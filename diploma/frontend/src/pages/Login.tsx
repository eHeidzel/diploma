import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const { Title, Text } = Typography;

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", values);
      const { user } = response.data;
      onLogin(user);
      message.success(t("login.loginSuccess", { name: user.name }));
      navigate("/dashboard");
    } catch (error: any) {
      message.error(error.response?.data?.message || t("login.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 20, right: 24 }}>
        <LanguageSwitcher />
      </div>

      <Card
        style={{
          width: 450,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: 16,
          background: "white",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title
            level={2}
            style={{ marginTop: 16, marginBottom: 8, color: "#1a1a1a" }}
          >
            {t("login.title")}
          </Title>
          <Text type="secondary">{t("login.subtitle")}</Text>
        </div>

        <Form name="login" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t("login.emailRequired") },
              { type: "email", message: t("login.emailInvalid") },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("login.emailPlaceholder")}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t("login.passwordRequired") }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("login.passwordPlaceholder")}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, backgroundColor: "#52c41a" }}
            >
              {t("login.loginButton")}
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              {t("login.noAccount")}{" "}
              <Link to="/register">{t("login.registerLink")}</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
