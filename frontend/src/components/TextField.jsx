import { TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import React from "react";

const TextFieldComponent = ({ field, formik }) => {
  const t = useTranslations("Auth");

  return (
    <TextField
      label={t(field)}
      name={field}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      type={field === "password" ? "password" : "text"}
      value={formik.values[field]}
      error={formik.touched[field] && Boolean(formik.errors[field])}
      helperText={formik.touched[field] && formik.errors[field]}
    />
  );
};

export default TextFieldComponent;
