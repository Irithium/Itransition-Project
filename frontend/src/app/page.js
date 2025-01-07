"use client";
import { setUserLocale } from "@/services/locale";
import { useTranslations } from "next-intl";
import useAuthModal from "@/hooks/useAuthModal";
import useAuth from "@/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import Form from "@/components/Auth/Form";
import { useTransition } from "react";
import Button from "@mui/material/Button";

export default function Home() {
  const t = useTranslations("Auth");
  const [isPending, startTransition] = useTransition();
  const {
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    isRegisterModalOpen,
    openRegisterModal,
    closeRegisterModal,
  } = useAuthModal();
  const { logout } = useAuth();

  const changeLanguage = (locale) => {
    if (typeof locale !== "string") {
      throw new Error("El valor debe ser una cadena");
    }
    startTransition(() => {
      setUserLocale(locale);
    });
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 ">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <ol className="list-inside list-decimal text-sm text-center sm:text-left ">
          <li className="mb-2">
            Get starte{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.js
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button onClick={() => changeLanguage("en")}>English</button>
          <button onClick={() => changeLanguage("es")}>Español</button>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <div>
          <Button onClick={openLoginModal}>{t("login")}</Button>
          <Button onClick={openRegisterModal}>{t("register")}</Button>
          <Button onClick={logout}>{t("logout")}</Button>

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
        </div>
      </footer>
    </div>
  );
}
