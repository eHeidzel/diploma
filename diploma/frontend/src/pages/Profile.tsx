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
  UploadOutlined,
  LockOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { profileApi } from "../services/api";
import styles from "../css/profile.module.css";
import { useTranslation } from "react-i18next";

const { Text } = Typography;
const { TextArea } = Input;

interface ProfilePageProps {
  user: any;
  onUserUpdate?: (updatedUser: any) => void;
}

const Profile: React.FC<ProfilePageProps> = ({ user, onUserUpdate }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
    if (user?.role === "student") {
      fetchBalance();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileApi.get();
      setProfile(response.data);
      form.setFieldsValue({
        name: response.data.name,
        phone: response.data.phone || "+375",
        city: response.data.city,
        bio: response.data.bio,
      });

      if (onUserUpdate && response.data.avatar) {
        onUserUpdate({ avatar: response.data.avatar });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      message.error(t("profile.loading"));
    } finally {
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
      message.success(t("profile.info.save"));
      setEditMode(false);

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
      message.error(t("profile.loading"));
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      await profileApi.changePassword(
        values.currentPassword,
        values.newPassword,
      );
      message.success(t("profile.password.success"));
      setChangePasswordVisible(false);
      passwordForm.resetFields();
    } catch (error: any) {
      console.error("Error changing password:", error);
      message.error(error.response?.data?.message || t("profile.password.error"));
    }
  };

  const handleAvatarUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);

    try {
      const response = await profileApi.uploadAvatar(file as File);
      const newAvatarUrl = response.data.avatar;

      setProfile((prev: any) => ({ ...prev, avatar: newAvatarUrl }));

      if (onUserUpdate) {
        onUserUpdate({ avatar: newAvatarUrl });
      }

      message.success(t("profile.avatar.success"));
      onSuccess?.(response.data);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error(t("profile.avatar.error"));
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return t("profile.info.notSpecified");
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

  const validateBio = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    if (value.length < 10) {
      return Promise.reject(new Error(t("profile.validation.bioMin")));
    }
    if (value.length > 500) {
      return Promise.reject(new Error(t("profile.validation.bioMax")));
    }
    return Promise.resolve();
  };

  if (!profile) return <div className={styles.loading}>{t("profile.loading")}</div>;

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
                  {uploading ? t("profile.avatar.uploading") : t("profile.avatar.upload")}
                </Button>
              </Upload>
            </div>
            <Divider />
            <Descriptions
              column={1}
              size="small"
              className={styles.descriptions}
            >
              <Descriptions.Item label={t("profile.info.email")}>
                {profile.email}
              </Descriptions.Item>
              <Descriptions.Item label={t("profile.info.role")}>
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
                    ? t("profile.roles.teacher")
                    : profile.role === "admin"
                      ? t("profile.roles.admin")
                      : t("profile.roles.student")}
                </Tag>
              </Descriptions.Item>
              {profile.role === "student" && (
                <Descriptions.Item label={t("profile.info.balance")}>
                  <Text strong style={{ color: "#52c41a", fontSize: 18 }}>
                    {balance} BYN
                  </Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t("profile.info.registrationDate")}>
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
                <span>{t("profile.info.personal")}</span>
              </Space>
            }
            extra={
              !editMode ? (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                >
                  {t("profile.info.edit")}
                </Button>
              ) : (
                <Space>
                  <Button onClick={() => setEditMode(false)}>
                    {t("profile.info.cancel")}
                  </Button>
                  <Button type="primary" onClick={() => form.submit()}>
                    {t("profile.info.save")}
                  </Button>
                </Space>
              )
            }
          >
            {!editMode ? (
              <Descriptions column={1} className={styles.descriptions}>
                <Descriptions.Item label={t("profile.info.name")}>
                  {profile.name}
                </Descriptions.Item>
                <Descriptions.Item label={t("profile.info.phone")}>
                  {formatPhone(profile.phone) || t("profile.info.notSpecified")}
                </Descriptions.Item>
                <Descriptions.Item label={t("profile.info.city")}>
                  {profile.city || t("profile.info.notSpecified")}
                </Descriptions.Item>
                <Descriptions.Item label={t("profile.info.about")}>
                  {profile.bio || t("profile.info.notSpecified")}
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
                  label={t("profile.info.name")}
                  rules={[
                    { required: true, message: t("profile.validation.nameRequired") },
                    { min: 2, message: t("profile.validation.nameMin") },
                    { max: 100, message: t("profile.validation.nameMax") },
                    {
                      pattern: /^[a-zA-Zа-яА-ЯёЁ\s]+$/,
                      message: t("profile.validation.namePattern"),
                    },
                  ]}
                >
                  <Input placeholder={t("profile.info.name")} />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label={t("profile.info.phone")}
                  rules={[
                    {
                      pattern: /^(\+375|80)?(29|33|44|25)\d{7}$/,
                      message: t("profile.validation.phoneInvalid"),
                    },
                  ]}
                >
                  <Input placeholder="+375 (29) 123-45-67" />
                </Form.Item>

                <Form.Item
                  name="city"
                  label={t("profile.info.city")}
                  rules={[
                    { min: 2, message: t("profile.validation.cityMin") },
                    { max: 100, message: t("profile.validation.cityMax") },
                    {
                      pattern: /^[a-zA-Zа-яА-ЯёЁ\s-]+$/,
                      message: t("profile.validation.cityPattern"),
                    },
                  ]}
                >
                  <Input placeholder={t("profile.info.city")} />
                </Form.Item>

                <Form.Item
                  name="bio"
                  label={t("profile.info.about")}
                  rules={[{ validator: validateBio }]}
                  extra={`${t("profile.validation.bioMin")}, ${t("profile.validation.bioMax")}`}
                >
                  <TextArea
                    rows={4}
                    placeholder={t("profile.info.about")}
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
                {t("profile.password.change")}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={t("profile.password.title")}
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
            label={t("profile.password.current")}
            rules={[
              { required: true, message: t("profile.password.validation.required") },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={t("profile.password.new")}
            rules={[
              { required: true, message: t("profile.password.validation.required") },
              { min: 6, message: t("profile.password.validation.minLength") },
              {
                pattern: /[a-zA-Z]/,
                message: t("profile.password.validation.hasLetter"),
              },
              {
                pattern: /\d/,
                message: t("profile.password.validation.hasDigit"),
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t("profile.password.confirm")}
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: t("profile.password.validation.required") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("profile.password.validation.confirmMatch")));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setChangePasswordVisible(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {t("profile.password.change")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;