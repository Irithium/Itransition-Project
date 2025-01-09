import * as yup from "yup";

const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{6,}$/;

export const loginSchema = (t) =>
  yup.object({
    email: yup.string().email(t("invalidEmail")).required(t("required")),
    password: yup.string().min(6, t("passwordMin")),
  });

export const registerSchema = (t) =>
  yup.object({
    username: yup.string().min(4, t("usernameMin")).required(t("required")),
    email: yup.string().email(t("invalidEmail")).required(t("required")),
    password: yup
      .string()
      .min(6, t("passwordMin"))
      .matches(passwordRules, { message: t("passwordRules") }),
  });
