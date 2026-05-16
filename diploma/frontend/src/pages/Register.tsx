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
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const { Title, Text } = Typography;

interface RegisterProps {
  onRegister: (userData: any) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      <div style={{ position: "absolute", top: 20, right: 24 }}>
        <LanguageSwitcher />
      </div>

      <Card
        style={{
          width: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: 16,
          background: "white",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <TeamOutlined style={{ fontSize: 48, color: "#52c41a" }} />
          <Title
            level={2}
            style={{ marginTop: 16, marginBottom: 8, color: "#1a1a1a" }}
          >
            {t("register.title")}
          </Title>
          <Text type="secondary">{t("register.subtitle")}</Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: t("register.nameRequired") }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("register.namePlaceholder")}
            />
          </Form.Item>

          <Form.Item
            name="email"
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

          <Form.Item
            name="role"
            rules={[{ required: true, message: t("register.roleRequired") }]}
            initialValue="student"
          >
            <Radio.Group>
              <Space>
                <Radio value="student">
                  <UserSwitchOutlined /> {t("register.studentRole")}
                </Radio>
                <Radio value="teacher">
                  <TeamOutlined /> {t("register.teacherRole")}
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
              {t("register.registerButton")}
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
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
