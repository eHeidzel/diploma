import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { authApi } from "../services/api";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import styles from "../css/login.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

const { Title, Text } = Typography;

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const [loading, setLoading] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("blocked") === "true") {
      setBlockedMessage(t("login.blockedMessage"));
    }
    localStorage.removeItem("isGuest");
  }, [location, t]);

  // Функция для извлечения сообщения из ошибки
  const extractErrorMessage = (error: any): string => {
    // Если есть response и data
    if (error.response?.data) {
      const data = error.response.data;
      
      // Если data - это строка
      if (typeof data === 'string') {
        try {
          // Пробуем распарсить как JSON
          const parsed = JSON.parse(data);
          if (parsed.message) return parsed.message;
          if (parsed.error) return parsed.error;
          return data;
        } catch {
          return data;
        }
      }
      
      // Если data - это объект
      if (typeof data === 'object') {
        if (data.message) return data.message;
        if (data.error) return data.error;
        if (data.detail) return data.detail;
        // Если есть description или error_description
        if (data.description) return data.description;
        if (data.error_description) return data.error_description;
        // Если есть validation errors
        if (data.errors) {
          const errors = Object.values(data.errors).flat();
          return errors.join(', ');
        }
        // Если есть массив ошибок
        if (Array.isArray(data)) {
          return data.map(item => item.message || item).join(', ');
        }
        // Возвращаем JSON строку
        return JSON.stringify(data);
      }
    }
    
    // Если есть message в самом error
    if (error.message) {
      return error.message;
    }
    
    // Если есть error.message
    if (error.error?.message) {
      return error.error.message;
    }
    
    // Стандартное сообщение
    return t("login.loginError");
  };

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setBlockedMessage(null);
    setErrorMessage(null);

    try {
      const response = await authApi.login(values.email, values.password);
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("isGuest");

      onLogin(user);
      message.success(t("login.loginSuccess").replace("{{name}}", user.name));
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Извлекаем сообщение из ошибки
      const errorMsg = extractErrorMessage(error);
      
      // Проверка на блокировку
      if (
        errorMsg.toLowerCase().includes("заблокирован") ||
        errorMsg.toLowerCase().includes("blocked") ||
        errorMsg.toLowerCase().includes("заблоковано")
      ) {
        setBlockedMessage(errorMsg);
      } else {
        setErrorMessage(errorMsg);
      }
      
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    localStorage.removeItem("token");

    const guestUser = {
      id: "guest_" + Date.now(),
      name: t("common.guest"),
      email: "guest@example.com",
      role: "guest",
      isGuest: true,
    };

    localStorage.setItem("user", JSON.stringify(guestUser));
    localStorage.setItem("isGuest", "true");

    onLogin(guestUser);
    message.success(t("login.guestSuccess"));

    navigate("/dashboard", { replace: true });
  };

  const handleCloseBlocked = () => {
    setBlockedMessage(null);
    const newUrl =
      window.location.pathname +
      window.location.search.replace(/[?&]blocked=true/, "");
    window.history.replaceState({}, "", newUrl);
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.languageSwitcher}>
        <LanguageSwitcher />
      </div>

      <Card className={styles.card}>
        <div className={styles.title}>
          <Title level={getTitleLevel(2)}>{t("login.title")}</Title>
          <Text type="secondary">{t("login.subtitle")}</Text>
        </div>

        {blockedMessage && (
          <Alert
            message={t("login.blockedTitle")}
            description={
              <div>
                <p>{blockedMessage}</p>
                <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  {t("login.blockedContact")}
                </p>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={handleCloseBlocked}
          />
        )}

        {errorMessage && (
          <Alert
            message={t("login.loginError")}
            description={errorMessage}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={handleCloseError}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          preserve={true}
          initialValues={{ email: "", password: "" }}
        >
          <Form.Item
            name="email"
            preserve={true}
            rules={[
              { required: true, message: t("login.emailRequired") },
              { type: "email", message: t("login.emailInvalid") },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("login.emailPlaceholder")}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            preserve={true}
            rules={[{ required: true, message: t("login.passwordRequired") }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("login.passwordPlaceholder")}
              disabled={loading}
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
              {loading ? t("login.loading") : t("login.loginButton")}
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.registerLink}>
          <Text type="secondary">
            {t("login.noAccount")}{" "}
            <Link to="/register">{t("login.registerLink")}</Link>
            <br />
            <Link
              to="#"
              onClick={handleGuestLogin}
              style={{ color: "#1890ff" }}
            >
              {t("login.guestLink")}
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;