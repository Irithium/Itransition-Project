import React from "react";
import { DialogTitle, DialogActions, Button, Box, Modal } from "@mui/material";
import { useTranslations } from "next-intl";
import AuthChangeButton from "@/components/AuthChangeButton";

const AuthModal = ({ open, onClose, title, children, type }) => {
  const t = useTranslations("General");

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={style}
        className="flex flex-col justify-between items-center p-4 rounded-lg w-full md:w-3/4 lg:w-1/2 h-full md:h-3/4 overflow-y-auto"
      >
        <DialogTitle className="xl:text-2xl font-bold">{title}</DialogTitle>
        {children}
        <DialogActions className="flex flex-row justify-center">
          <Button onClick={onClose} variant="text" color="secondary">
            {t("close")}
          </Button>
          <AuthChangeButton type={type} />
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default AuthModal;
