import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import styles from "../css/register.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

const { Title, Text } = Typography;

interface RegisterProps {
  onRegister: (userData: any) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const { getTitleLevel } = useAdaptiveLevel();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", values);
      const { user } = response.data;
      onRegister(user);
      message.success(t("register.registerSuccess"));
      navigate("/dashboard");
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error(t("register.emailConflict"));
      } else {
        message.error(
          error.response?.data?.message || t("register.registerError"),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.languageSwitcher}>
        <LanguageSwitcher />
      </div>

      <Card className={styles.card}>
        <div className={styles.header}>
          <TeamOutlined className={styles.headerIcon} />
          <Title level={getTitleLevel(2)}>{t("register.title")}</Title>
          <Text type="secondary">{t("register.subtitle")}</Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="name"
            label={t("register.nameLabel")}
            rules={[{ required: true, message: t("register.nameRequired") }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("register.namePlaceholder")}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={t("register.emailLabel")}
            rules={[
              { required: true, message: t("register.emailRequired") },
              { type: "email", message: t("register.emailInvalid") },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t("register.emailPlaceholder")}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t("register.passwordLabel")}
            rules={[
              { required: true, message: t("register.passwordRequired") },
              { min: 6, message: t("register.passwordMinLength") },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("register.passwordPlaceholder")}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className={styles.submitButton}
            >
              {t("register.registerButton")}
            </Button>
          </Form.Item>

          <div className={styles.loginLink}>
            <Text type="secondary">
              {t("register.alreadyHaveAccount")}{" "}
              <Link to="/login">{t("register.loginLink")}</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
