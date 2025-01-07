"use client";
import { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useAuthModal from "@/hooks/useAuthModal";
import Button from "@mui/material/Button";
import api from "@/services/api";
import { loginSchema, registerSchema } from "@/lib/validations";
import { useTranslations } from "next-intl";
import TextFieldComponent from "../TextField";

const Form = ({ type }) => {
  const router = useRouter();
  const fields =
    type === "login"
      ? ["email", "password"]
      : ["username", "email", "password"];
  const [error, setError] = useState("");
  const t = useTranslations("Auth");
  const { login, register } = useAuth();
  const { closeLoginModal, closeRegisterModal } = useAuthModal();

  const formik = useFormik({
    initialValues:
      type === "login"
        ? {
            email: "",
            password: "",
          }
        : {
            username: "",
            email: "",
            password: "",
          },
    validationSchema: type === "login" ? loginSchema(t) : registerSchema(t),
    onSubmit: async (values) => {
      try {
        if (type === "login") {
          const message = await login(values);
          toast.success(message);
          closeLoginModal();
        } else {
          const message = await register(values);
          toast.success(message);
          closeRegisterModal();
        }

        router.refresh();
      } catch (error) {
        console.log(error);
        setError(error.response.data.error);
      }
    },
  });
  console.log(formik.values);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col w-1/2 gap-6 justify-between my-2"
    >
      {fields.map((field, index) => (
        <TextFieldComponent key={index} field={field} formik={formik} />
      ))}

      <Button
        type="submit"
        variant="contained"
        color="secondary"
        className="w-3/4 self-center"
        size="large"
      >
        {type === "login" ? t("login") : t("register")}
      </Button>
      {error && <div>{error}</div>}
    </form>
  );
};

export default Form;
