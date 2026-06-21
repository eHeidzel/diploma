
import React from "react";
import { Button } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("language", nextLang);
  };

  return (
    <Button type="text" icon={<GlobalOutlined />} onClick={toggleLanguage}>
      {i18n.language === "ru" ? "RU" : "EN"}
    </Button>
  );
};

export default LanguageSwitcher;
