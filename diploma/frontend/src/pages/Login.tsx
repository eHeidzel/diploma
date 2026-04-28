import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  // GraduationCapOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const { Title, Text } = Typography;

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", values);
      const { user } = response.data;
      onLogin(user);
      message.success(`Добро пожаловать, ${user.name}!`);
      navigate("/dashboard");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)",
      }}
    >
      <Card
        style={{
          width: 450,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: 16,
          background: "white",
        }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {/* <GraduationCapOutlined style={{ fontSize: 48, color: "#52c41a" }} /> */}
          <Title
            level={2}
            style={{ marginTop: 16, marginBottom: 8, color: "#1a1a1a" }}
          >
            Онлайн Школа
          </Title>
          <Text type="secondary">Войдите в свой аккаунт</Text>
        </div>

        <Form name="login" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Введите корректный email" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, backgroundColor: "#52c41a" }}
            >
              Войти
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
