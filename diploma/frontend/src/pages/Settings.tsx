// pages/Settings.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Switch,
  Button,
  Space,
  message,
  Typography,
  Select,
} from "antd";
import { BellOutlined, GlobalOutlined } from "@ant-design/icons";
import { settingsApi } from "../services/api";
import { useTranslation } from "react-i18next";
import styles from "../css/settings.module.css";

const { Title } = Typography;

interface SettingsPageProps {
  user: any;
}

const Settings: React.FC<SettingsPageProps> = ({ user }) => {
  const { i18n } = useTranslation();
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
        language: response.data.language || i18n.language,
        notificationsEnabled: response.data.notificationsEnabled !== false,
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
      await settingsApi.update({
        language: values.language,
        notificationsEnabled: values.notificationsEnabled,
      });

      if (values.language && values.language !== i18n.language) {
        i18n.changeLanguage(values.language);
      }

      message.success("Настройки сохранены");
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
          language: "ru",
          notificationsEnabled: true,
        }}
      >
        <Card
          title={
            <Space>
              <GlobalOutlined /> Язык
            </Space>
          }
          className={styles.card}
        >
          <Form.Item name="language" label="Язык интерфейса">
            <Select>
              <Select.Option value="ru">Русский</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </Form.Item>
        </Card>

        <Card
          title={
            <Space>
              <BellOutlined /> Уведомления
            </Space>
          }
          className={styles.card}
        >
          <Form.Item
            name="notificationsEnabled"
            label="Включить уведомления"
            valuePropName="checked"
          >
            <Switch checkedChildren="Вкл" unCheckedChildren="Выкл" />
          </Form.Item>
        </Card>

        <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            size="large"
          >
            Сохранить настройки
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;