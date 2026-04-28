import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Radio,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const { Title, Text } = Typography;

interface RegisterProps {
  onRegister: (userData: any) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", values);
      const { user } = response.data;
      onRegister(user);
      message.success("Регистрация успешна!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error("Пользователь с таким email уже существует");
      } else {
        message.error(error.response?.data?.message || "Ошибка регистрации");
      }
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
          width: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: 16,
          background: "white",
        }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <TeamOutlined style={{ fontSize: 48, color: "#52c41a" }} />
          <Title
            level={2}
            style={{ marginTop: 16, marginBottom: 8, color: "#1a1a1a" }}
          >
            Регистрация
          </Title>
          <Text type="secondary">Создайте новый аккаунт</Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Имя" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Введите корректный email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Введите пароль" },
              { min: 6, message: "Пароль должен быть не менее 6 символов" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: "Выберите роль" }]}
            initialValue="student"
          >
            <Radio.Group>
              <Space>
                <Radio value="student">
                  <UserSwitchOutlined /> Ученик
                </Radio>
                <Radio value="teacher">
                  <TeamOutlined /> Преподаватель
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, backgroundColor: "#52c41a" }}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
