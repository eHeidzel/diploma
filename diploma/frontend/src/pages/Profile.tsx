// pages/Profile.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  Space,
  message,
  Upload,
  Row,
  Col,
  Divider,
  Descriptions,
  Tag,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UploadOutlined,
  LockOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { profileApi } from "../services/api";
import styles from "../css/profile.module.css";

const { Text } = Typography;
const { TextArea } = Input;

interface ProfilePageProps {
  user: any;
  onUserUpdate?: (updatedUser: any) => void; // Добавляем опциональный пропс
}

const Profile: React.FC<ProfilePageProps> = ({ user, onUserUpdate }) => {
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [phoneValue, setPhoneValue] = useState("+375");
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
    if (user?.role === "student") {
      fetchBalance();
    }
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await profileApi.get();
      setProfile(response.data);
      setPhoneValue(response.data.phone || "+375");
      form.setFieldsValue({
        name: response.data.name,
        phone: response.data.phone || "+375",
        city: response.data.city,
        bio: response.data.bio,
      });

      // Обновляем аватар в родительском компоненте
      if (onUserUpdate && response.data.avatar) {
        onUserUpdate({ avatar: response.data.avatar });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      message.error("Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await profileApi.getBalance();
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    try {
      const response = await profileApi.update(values);
      message.success("Профиль успешно обновлен");
      setEditMode(false);

      // Обновляем данные в родительском компоненте
      if (onUserUpdate) {
        onUserUpdate({
          name: values.name,
          phone: values.phone,
          city: values.city,
          bio: values.bio,
        });
      }

      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Ошибка обновления профиля");
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      await profileApi.changePassword(
        values.currentPassword,
        values.newPassword,
      );
      message.success("Пароль успешно изменен");
      setChangePasswordVisible(false);
      passwordForm.resetFields();
    } catch (error: any) {
      console.error("Error changing password:", error);
      message.error(error.response?.data?.message || "Ошибка изменения пароля");
    }
  };

  const handleAvatarUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);

    try {
      const response = await profileApi.uploadAvatar(file as File);
      const newAvatarUrl = response.data.avatar;

      setProfile((prev: any) => ({ ...prev, avatar: newAvatarUrl }));

      // Обновляем аватар в родительском компоненте
      if (onUserUpdate) {
        onUserUpdate({ avatar: newAvatarUrl });
      }

      message.success("Аватар успешно обновлен");
      onSuccess?.(response.data);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error("Ошибка загрузки аватара");
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  // Функция валидации телефона
  const validatePhone = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    const phoneRegex = /^(\+375|80)?(29|33|44|25)\d{7}$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject(
        new Error(
          "Введите корректный номер телефона (например, +375291234567)",
        ),
      );
    }
    return Promise.resolve();
  };

  // Форматирование телефона для отображения
  const formatPhone = (phone: string) => {
    if (!phone) return "Не указан";
    if (phone.startsWith("+375")) {
      return phone.replace(
        /(\+375)(\d{2})(\d{3})(\d{2})(\d{2})/,
        "$1 ($2) $3-$4-$5",
      );
    }
    if (phone.length === 9) {
      return `+375 (${phone.slice(0, 2)}) ${phone.slice(2, 5)}-${phone.slice(5, 7)}-${phone.slice(7, 9)}`;
    }
    return phone;
  };

  // Валидация био
  const validateBio = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    if (value.length < 10) {
      return Promise.reject(
        new Error("Описание должно содержать минимум 10 символов"),
      );
    }
    if (value.length > 500) {
      return Promise.reject(
        new Error("Описание не должно превышать 500 символов"),
      );
    }
    return Promise.resolve();
  };

  if (!profile) return <div className={styles.loading}>Загрузка...</div>;

  const avatarUrl = profile.avatar
    ? profile.avatar.startsWith("http")
      ? profile.avatar
      : `http://localhost:8080${profile.avatar}`
    : null;

  return (
    <div className={styles.container}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className={styles.avatarCard}>
            <div className={styles.avatarContainer}>
              <Avatar size={120} src={avatarUrl} icon={<UserOutlined />} />
              <Upload
                showUploadList={false}
                customRequest={handleAvatarUpload}
                accept="image/*"
                disabled={uploading}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  className={styles.uploadBtn}
                >
                  Загрузить фото
                </Button>
              </Upload>
            </div>
            <Divider />
            <Descriptions
              column={1}
              size="small"
              className={styles.descriptions}
            >
              <Descriptions.Item label="Email">
                {profile.email}
              </Descriptions.Item>
              <Descriptions.Item label="Роль">
                <Tag
                  color={
                    profile.role === "teacher"
                      ? "blue"
                      : profile.role === "admin"
                        ? "red"
                        : "green"
                  }
                >
                  {profile.role === "teacher"
                    ? "Преподаватель"
                    : profile.role === "admin"
                      ? "Администратор"
                      : "Ученик"}
                </Tag>
              </Descriptions.Item>
              {profile.role === "student" && (
                <Descriptions.Item label="Баланс">
                  <Text strong style={{ color: "#52c41a", fontSize: 18 }}>
                    {balance} BYN
                  </Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Дата регистрации">
                {new Date(profile.createdAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Личная информация</span>
              </Space>
            }
            extra={
              !editMode ? (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                >
                  Редактировать
                </Button>
              ) : (
                <Space>
                  <Button onClick={() => setEditMode(false)}>Отмена</Button>
                  <Button type="primary" onClick={() => form.submit()}>
                    Сохранить
                  </Button>
                </Space>
              )
            }
          >
            {!editMode ? (
              <Descriptions column={1} className={styles.descriptions}>
                <Descriptions.Item label="Имя">
                  {profile.name}
                </Descriptions.Item>
                <Descriptions.Item label="Телефон">
                  {formatPhone(profile.phone) || "Не указан"}
                </Descriptions.Item>
                <Descriptions.Item label="Город">
                  {profile.city || "Не указан"}
                </Descriptions.Item>
                <Descriptions.Item label="О себе">
                  {profile.bio || "Не указано"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                initialValues={profile}
              >
                <Form.Item
                  name="name"
                  label="Имя"
                  rules={[
                    { required: true, message: "Введите имя" },
                    { min: 2, message: "Имя должно содержать минимум 2 символа" },
                    { max: 100, message: "Имя не должно превышать 100 символов" },
                    {
                      pattern: /^[a-zA-Zа-яА-ЯёЁ\s]+$/,
                      message: "Имя должно содержать только буквы и пробелы",
                    },
                  ]}
                >
                  <Input placeholder="Введите ваше имя" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Телефон"
                  rules={[
                    {
                      pattern: /^(\+375|80)?(29|33|44|25)\d{7}$/,
                      message:
                        "Введите корректный номер (например, +375291234567)",
                    },
                  ]}
                >
                  <Input placeholder="+375 (29) 123-45-67" />
                </Form.Item>

                <Form.Item
                  name="city"
                  label="Город"
                  rules={[
                    { min: 2, message: "Название города должно содержать минимум 2 символа" },
                    { max: 100, message: "Название города не должно превышать 100 символов" },
                    {
                      pattern: /^[a-zA-Zа-яА-ЯёЁ\s-]+$/,
                      message:
                        "Название города должно содержать только буквы, пробелы и дефисы",
                    },
                  ]}
                >
                  <Input placeholder="Введите ваш город" />
                </Form.Item>

                <Form.Item
                  name="bio"
                  label="О себе"
                  rules={[{ validator: validateBio }]}
                  extra="Минимум 10 символов, максимум 500"
                >
                  <TextArea
                    rows={4}
                    placeholder="Расскажите о себе..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Form>
            )}

            <Divider />

            <div className={styles.actions}>
              <Button
                icon={<LockOutlined />}
                onClick={() => setChangePasswordVisible(true)}
              >
                Сменить пароль
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Смена пароля"
        open={changePasswordVisible}
        onCancel={() => {
          setChangePasswordVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="Текущий пароль"
            rules={[{ required: true, message: "Введите текущий пароль" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Новый пароль"
            rules={[
              { required: true, message: "Введите новый пароль" },
              { min: 6, message: "Пароль должен содержать минимум 6 символов" },
              {
                pattern: /[a-zA-Z]/,
                message: "Пароль должен содержать хотя бы одну букву",
              },
              {
                pattern: /\d/,
                message: "Пароль должен содержать хотя бы одну цифру",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Подтверждение пароля"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Подтвердите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setChangePasswordVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Сменить пароль
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;