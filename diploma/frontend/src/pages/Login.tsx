
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
  const { getTitleLevel } = useAdaptiveLevel();
  const [loading, setLoading] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("blocked") === "true") {
      setBlockedMessage(
        "Ваш аккаунт был заблокирован. Обратитесь к администратору для получения дополнительной информации.",
      );
    }

    
    localStorage.removeItem("isGuest");
  }, [location]);

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
      message.success(`Добро пожаловать, ${user.name}!`);
      navigate("/dashboard");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка входа";

      if (
        errorMsg.toLowerCase().includes("заблокирован") ||
        errorMsg.toLowerCase().includes("blocked")
      ) {
        setBlockedMessage(errorMsg);
        message.error(errorMsg);
      } else {
        setErrorMessage(errorMsg);
        message.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Гостевой вход - JWT strategy bypass");

    
    localStorage.removeItem("token");

    const guestUser = {
      id: "guest_" + Date.now(),
      name: "Гость",
      email: "guest@example.com",
      role: "guest",
      isGuest: true,
    };

    
    localStorage.setItem("user", JSON.stringify(guestUser));
    localStorage.setItem("isGuest", "true");

    onLogin(guestUser);
    message.success("Добро пожаловать в гостевой режим!");

    
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
          <Title level={getTitleLevel(2)}>Вход в CodeZone</Title>
          <Text type="secondary">Войдите в свой аккаунт</Text>
        </div>

        {blockedMessage && (
          <Alert
            message="Доступ запрещен"
            description={
              <div>
                <p>{blockedMessage}</p>
                <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  Если вы считаете, что это ошибка, пожалуйста, обратитесь к
                  администратору.
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
            message="Ошибка входа"
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
              { required: true, message: "Введите email" },
              { type: "email", message: "Введите корректный email" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            preserve={true}
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
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
              {loading ? "Вход..." : "Войти"}
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.registerLink}>
          <Text type="secondary">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            <br />
            <Link
              to="#"
              onClick={handleGuestLogin}
              style={{ color: "#1890ff" }}
            >
              Войти как гость
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
