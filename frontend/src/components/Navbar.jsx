"use client";
import React, { startTransition, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  TextField,
  MenuItem,
  InputBase,
  Box,
} from "@mui/material";
import {
  Search as SearchIcon,
  AccountCircle,
  Add as AddIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import useAuthModal from "@/hooks/useAuthModal";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";
import logo from "/public/logo.jpg";
import AuthModal from "./Auth/AuthModal";
import { Form } from "formik";
import useUserStore from "@/stores/userStore";
import Cookies from "js-cookie";
import { setUserLocale } from "@/services/locale";

const Navbar = () => {
  const router = useRouter();
  const t = useTranslations("Navbar");
  const {
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    isRegisterModalOpen,
    openRegisterModal,
    closeRegisterModal,
  } = useAuthModal();
  const { logout } = useAuth();
  const [language, setLanguage] = useState(Cookies.get("i18next"));

  const { isAuthenticated, setIsAuthenticated } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const changeLanguage = (locale) => {
    if (typeof locale !== "string") {
      throw new Error("El valor debe ser una cadena");
    }
    startTransition(() => {
      setUserLocale(locale);
    });
    setLanguage(locale);
  };

  const handleSearch = (event) => {
    if (event.key === "Enter") {
      console.log("Search:", event.target.value);
    }
  };

  return (
    <div className="bg-[#F39A86]">
      <AppBar position="static" color="transparent">
        <Toolbar className="flex justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" passHref>
              <Image
                src={logo}
                alt="Logo"
                width={40}
                height={40}
                className="cursor-pointer"
              />
            </Link>
            <TextField
              select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              variant="outlined"
              size="small"
              className="text-center text-xs "
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
            </TextField>
          </div>

          <div className="flex-grow mx-4">
            <InputBase
              placeholder={t("search")}
              inputProps={{ "aria-label": "search" }}
              onKeyDown={handleSearch}
              className="w-full bg-white rounded px-2 py-1"
            />
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/templates/new")}
                  className="hidden md:flex text-xs bg-[#DA6c70] ml-0"
                >
                  {t("createTemplate")}
                </Button>
                <IconButton
                  color="primary"
                  onClick={() => router.push("/templates/new")}
                  className="md:hidden "
                >
                  <AddIcon />
                </IconButton>
              </>
            )}
            {!isAuthenticated ? (
              <>
                <Button color="inherit" onClick={openLoginModal}>
                  {t("login")}
                </Button>
                <Button color="inherit" onClick={openRegisterModal}>
                  {t("register")}
                </Button>

                <AuthModal
                  open={isLoginModalOpen}
                  onClose={closeLoginModal}
                  title={t("login")}
                  type="login"
                >
                  <Form type="login" />
                </AuthModal>

                <AuthModal
                  open={isRegisterModalOpen}
                  onClose={closeRegisterModal}
                  title={t("register")}
                  type="register"
                >
                  <Form type="register" />
                </AuthModal>
              </>
            ) : (
              <IconButton
                color="inherit"
                onClick={() => router.push("/profile")}
              >
                <AccountCircle />
              </IconButton>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navbar;
