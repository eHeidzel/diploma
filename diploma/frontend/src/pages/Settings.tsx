import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Switch,
  Button,
  Space,
  message,
  Divider,
  Typography,
} from "antd";
import { BellOutlined, SafetyOutlined } from "@ant-design/icons";
import { settingsApi } from "../services/api";
import styles from "../css/settings.module.css";

const { Title } = Typography;

interface SettingsPageProps {
  user: any;
}

const Settings: React.FC<SettingsPageProps> = ({ user }) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsApi.get();
      setSettings(response.data);
      form.setFieldsValue({
        emailNotifications: response.data.emailNotifications,
        pushNotifications: response.data.pushNotifications,
        bookingReminders: response.data.bookingReminders,
        scheduleChanges: response.data.scheduleChanges,
        showProfile: response.data.showProfile,
        showEmail: response.data.showEmail,
        showPhone: response.data.showPhone,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      message.error("Ошибка загрузки настроек");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (values: any) => {
    setSaving(true);
    try {
      const notificationsData = {
        emailNotifications: values.emailNotifications,
        pushNotifications: values.pushNotifications,
        bookingReminders: values.bookingReminders,
        scheduleChanges: values.scheduleChanges,
      };
      const privacyData = {
        showProfile: values.showProfile,
        showEmail: values.showEmail,
        showPhone: values.showPhone,
      };

      await Promise.all([
        settingsApi.updateNotifications(notificationsData),
        settingsApi.updatePrivacy(privacyData),
      ]);

      message.success("Все настройки сохранены");
      fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error("Ошибка сохранения настроек");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <Title level={3}>Настройки</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveAll}
        initialValues={{
          emailNotifications: true,
          pushNotifications: true,
          bookingReminders: true,
          scheduleChanges: true,
          showProfile: true,
          showEmail: false,
          showPhone: false,
        }}
      >
        <Card
          title={
            <Space>
              <BellOutlined /> Уведомления
            </Space>
          }
          className={styles.card}
        >
          <Form.Item
            name="emailNotifications"
            label="Email уведомления"
            valuePropName="checked"
          >
            <Switch checkedChildren="Вкл" unCheckedChildren="Выкл" />
          </Form.Item>
          <Form.Item
            name="pushNotifications"
            label="Push уведомления"
            valuePropName="checked"
          >
            <Switch checkedChildren="Вкл" unCheckedChildren="Выкл" />
          </Form.Item>
          <Form.Item
            name="bookingReminders"
            label="Напоминания о записи"
            valuePropName="checked"
          >
            <Switch checkedChildren="Вкл" unCheckedChildren="Выкл" />
          </Form.Item>
          <Form.Item
            name="scheduleChanges"
            label="Изменения в расписании"
            valuePropName="checked"
          >
            <Switch checkedChildren="Вкл" unCheckedChildren="Выкл" />
          </Form.Item>
        </Card>

        <Card
          title={
            <Space>
              <SafetyOutlined /> Конфиденциальность
            </Space>
          }
          className={styles.card}
        >
          <Form.Item
            name="showProfile"
            label="Показывать профиль другим пользователям"
            valuePropName="checked"
          >
            <Switch checkedChildren="Да" unCheckedChildren="Нет" />
          </Form.Item>
          <Form.Item
            name="showEmail"
            label="Показывать email"
            valuePropName="checked"
          >
            <Switch checkedChildren="Да" unCheckedChildren="Нет" />
          </Form.Item>
          <Form.Item
            name="showPhone"
            label="Показывать телефон"
            valuePropName="checked"
          >
            <Switch checkedChildren="Да" unCheckedChildren="Нет" />
          </Form.Item>
        </Card>

        <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            size="large"
          >
            Сохранить все настройки
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;
