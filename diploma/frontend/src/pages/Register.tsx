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
  const { getTitleLevel } = useAdaptiveLevel();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error("Введите пароль"));
    }
    if (value.length < 6) {
      return Promise.reject(
        new Error("Пароль должен содержать минимум 6 символов"),
      );
    }
    if (!/[a-zA-Z]/.test(value)) {
      return Promise.reject(
        new Error("Пароль должен содержать хотя бы одну букву"),
      );
    }
    if (!/\d/.test(value)) {
      return Promise.reject(
        new Error("Пароль должен содержать хотя бы одну цифру"),
      );
    }
    return Promise.resolve();
  };

  const validateAge = (_: any, value: dayjs.Dayjs) => {
    if (!value) {
      return Promise.reject(new Error("Введите дату рождения"));
    }
    const age = dayjs().diff(value, "year");
    if (age < 8) {
      return Promise.reject(new Error("Возраст должен быть не менее 8 лет"));
    }
    if (age > 100) {
      return Promise.reject(new Error("Некорректная дата рождения"));
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
      message.success("Регистрация прошла успешно!");
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
          <Title level={getTitleLevel(2)}>Регистрация в CodeZone</Title>
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
            name="birthDate"
            rules={[{ validator: validateAge }]}
            tooltip="Укажите вашу дату рождения"
          >
            <DatePicker
              placeholder="Дата рождения"
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
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Подтвердите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Подтвердите пароль"
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
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div className={styles.loginLink}>
            <Text type="secondary">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
              <br />
              <Link
                to="/dashboard"
                onClick={() => {
                  const guestUser = {
                    id: "guest",
                    name: "Гость",
                    role: "guest",
                    isGuest: true,
                  };
                  onRegister(guestUser);
                }}
              >
                Войти как гость
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
