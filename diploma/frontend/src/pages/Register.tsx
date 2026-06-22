import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  DatePicker,
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import styles from "../css/register.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface RegisterProps {
  onRegister: (userData: any) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error(t("register.passwordRequired")));
    }
    if (value.length < 6) {
      return Promise.reject(new Error(t("register.passwordMinLength")));
    }
    if (!/[a-zA-Z]/.test(value)) {
      return Promise.reject(new Error(t("register.passwordHasLetter")));
    }
    if (!/\d/.test(value)) {
      return Promise.reject(new Error(t("register.passwordHasDigit")));
    }
    return Promise.resolve();
  };

  const validateAge = (_: any, value: dayjs.Dayjs) => {
    if (!value) {
      return Promise.reject(new Error(t("register.birthDateRequired")));
    }
    const age = dayjs().diff(value, "year");
    if (age < 8) {
      return Promise.reject(new Error(t("register.ageMin")));
    }
    if (age > 100) {
      return Promise.reject(new Error(t("register.ageMax")));
    }
    return Promise.resolve();
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
        birthDate: values.birthDate
          ? values.birthDate.format("YYYY-MM-DD")
          : null,
      });

      const { user, token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      onRegister(user);
      message.success(t("register.registerSuccess"));
      navigate("/dashboard");
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error(t("register.emailConflict"));
      } else {
        message.error(error.response?.data?.message || t("register.registerError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf("day");
  };

  return (
    <div className={styles.container}>
      <div className={styles.languageSwitcher}>
        <LanguageSwitcher />
      </div>

      <Card className={styles.card}>
        <div className={styles.header}>
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
            rules={[{ required: true, message: t("register.nameRequired") }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t("register.namePlaceholder")} />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: t("register.emailRequired") },
              { type: "email", message: t("register.emailInvalid") },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder={t("register.emailPlaceholder")} />
          </Form.Item>

          <Form.Item
            name="birthDate"
            rules={[{ validator: validateAge }]}
            tooltip={t("register.birthDateTooltip")}
          >
            <DatePicker
              placeholder={t("register.birthDatePlaceholder")}
              style={{ width: "100%" }}
              format="DD.MM.YYYY"
              disabledDate={disabledDate}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ validator: validatePassword }]}
            validateTrigger="onBlur"
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t("register.passwordPlaceholder")} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: t("register.confirmPasswordRequired") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("register.passwordsDoNotMatch")));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("register.confirmPasswordPlaceholder")}
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
              {loading ? t("register.loading") : t("register.registerButton")}
            </Button>
          </Form.Item>

          <div className={styles.loginLink}>
            <Text type="secondary">
              {t("register.alreadyHaveAccount")}{" "}
              <Link to="/login">{t("register.loginLink")}</Link>
              <br />
              <Link
                to="/dashboard"
                onClick={() => {
                  const guestUser = {
                    id: "guest",
                    name: t("common.guest"),
                    role: "guest",
                    isGuest: true,
                  };
                  onRegister(guestUser);
                }}
              >
                {t("register.guestLink")}
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;