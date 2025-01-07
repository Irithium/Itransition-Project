import useAuthModal from "@/hooks/useAuthModal";

const { Button } = require("@mui/material");
const { useTranslations } = require("next-intl");

const AuthChangeButton = ({ type }) => {
  const t = useTranslations("Auth");
  const { changeModal } = useAuthModal();

  return (
    <Button onClick={changeModal} variant="text" color="secondary">
      {type === "login" ? t("noRegistered") : t("registered")}
    </Button>
  );
};

export default AuthChangeButton;
