import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Form,
  Switch,
  Button,
  Space,
  message,
  Typography,
  Select,
  Result,
} from "antd";
import { BellOutlined, GlobalOutlined } from "@ant-design/icons";
import { settingsApi } from "../services/api";
import { useTranslation } from "react-i18next";
import styles from "../css/settings.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

interface SettingsPageProps {
  user: any;
}

const Settings: React.FC<SettingsPageProps> = ({ user }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getTitleLevel } = useAdaptiveLevel();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Проверка на гостя
    if (!user || user.role === "guest") {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        message.warning(t("settings.guest.accessDenied"));
        navigate("/");
      }
      return;
    }

    // Сбрасываем флаг если пользователь авторизован
    hasRedirected.current = false;
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsApi.get();
      form.setFieldsValue({
        language: response.data.language || i18n.language || "ru",
        notificationsEnabled: response.data.notificationsEnabled !== false,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      form.setFieldsValue({
        language: i18n.language || "ru",
        notificationsEnabled: true,
      });
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
        await i18n.changeLanguage(values.language);
        localStorage.setItem("language", values.language);
      }

      message.success(t("settings.success"));
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error(t("settings.error"));
    } finally {
      setSaving(false);
    }
  };

  // Если пользователь гость, показываем страницу с ошибкой доступа
  if (!user || user.role === "guest") {
    return (
      <div className={styles.container}>
        <Result
          status="403"
          title="403"
          subTitle={t("settings.guest.accessDenied")}
          extra={
            <Button type="primary" onClick={() => navigate("/")}>
              {t("common.backToHome")}
            </Button>
          }
        />
      </div>
    );
  }

  if (loading) return <div className={styles.loading}>{t("settings.loading")}</div>;

  return (
    <div className={styles.container}>
      <Title level={getTitleLevel(3)}>{t("settings.title")}</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveAll}
        initialValues={{
          language: i18n.language || "ru",
          notificationsEnabled: true,
        }}
      >
        <Card
          title={
            <Space>
              <GlobalOutlined /> {t("settings.language.title")}
            </Space>
          }
          className={styles.card}
        >
          <Form.Item name="language" label={t("settings.language.label")}>
            <Select>
              <Select.Option value="ru">{t("settings.language.ru")}</Select.Option>
              <Select.Option value="en">{t("settings.language.en")}</Select.Option>
            </Select>
          </Form.Item>
        </Card>

        <Card
          title={
            <Space>
              <BellOutlined /> {t("settings.notifications.title")}
            </Space>
          }
          className={styles.card}
        >
          <Form.Item
            name="notificationsEnabled"
            label={t("settings.notifications.label")}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={t("settings.notifications.enabled")}
              unCheckedChildren={t("settings.notifications.disabled")}
            />
          </Form.Item>
        </Card>

        <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            size="large"
          >
            {saving ? t("settings.saving") : t("settings.save")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;