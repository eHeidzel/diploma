
import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Button, Space, Alert, Spin } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { activitiesApi } from "../services/api";
import styles from "@styles/learning.module.css";

interface DefaultBookingModalProps {
  visible: boolean;
  selectedActivity: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const DefaultBookingModal: React.FC<DefaultBookingModalProps> = ({
  visible,
  selectedActivity,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [noDatesAvailable, setNoDatesAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isWebinar = selectedActivity?.type === "webinar";
  const isMasterclass = selectedActivity?.type === "masterclass";
  const isTrial = selectedActivity?.type === "trial";

  useEffect(() => {
    if (visible && selectedActivity) {
      setNoDatesAvailable(false);
      setError(null);
      form.resetFields();
      setAvailableTimeSlots([]);
      loadAvailableDates();
    }
  }, [visible, selectedActivity]);

  const loadAvailableDates = async () => {
    try {
      setLoading(true);
      setError(null);

      let dates = selectedActivity?.availableDates || [];

      if (!dates || dates.length === 0) {
        try {
          const response = await activitiesApi.getAvailableDates(
            selectedActivity.id,
          );
          dates = response.data || [];
          selectedActivity.availableDates = dates;
        } catch (apiError) {
          console.log("API for dates not available, using local data");
        }
      }

      if (dates && dates.length > 0) {
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureDates = dates.filter((item: any) => {
          const itemDate = new Date(item.date);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate.getTime() >= today.getTime();
        });

        if (futureDates.length > 0) {
          selectedActivity.availableDates = futureDates;
          setNoDatesAvailable(false);
        } else {
          setNoDatesAvailable(true);
          setError("Все доступные даты уже прошли");
        }
      } else {
        setNoDatesAvailable(true);
        if (isWebinar || isMasterclass) {
          setError("Даты для этого занятия еще не добавлены администратором");
        } else if (isTrial) {
          setError("Нет доступных дат для пробного занятия");
        }
      }
    } catch (error: any) {
      console.error("Error loading dates:", error);
      setNoDatesAvailable(true);
      setError("Ошибка загрузки доступных дат");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    if (!selectedActivity?.availableDates) {
      setAvailableTimeSlots([]);
      form.setFieldsValue({ selectedTime: undefined });
      return;
    }

    const selectedDateData = selectedActivity.availableDates.find(
      (item: any) => item.date === date,
    );

    if (isWebinar || isMasterclass) {
      const times = selectedDateData?.times || ["19:00"];
      setAvailableTimeSlots(times);
      form.setFieldsValue({ selectedTime: times[0] || "19:00" });
      return;
    }

    if (isTrial) {
      const times = selectedDateData?.times || [
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
      ];
      setAvailableTimeSlots(times);
      form.setFieldsValue({ selectedTime: undefined });
      return;
    }

    const times = selectedDateData?.times || [];
    setAvailableTimeSlots(times);
    form.setFieldsValue({ selectedTime: undefined });
  };

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit({
        date: values.selectedDate,
        time: values.selectedTime,
      });
      form.resetFields();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const availableDates = selectedActivity?.availableDates || [];
  const hasAvailableDates = availableDates.length > 0 && !noDatesAvailable;

  const getDateOptions = () => {
    if (!availableDates || availableDates.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return availableDates
      .filter((item: any) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() >= today.getTime();
      })
      .map((item: any) => {
        const dateObj = new Date(item.date);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        const weekdays = [
          "Воскресенье",
          "Понедельник",
          "Вторник",
          "Среда",
          "Четверг",
          "Пятница",
          "Суббота",
        ];
        const weekday = weekdays[dateObj.getDay()];
        return {
          value: item.date,
          label: `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}, ${weekday}`,
        };
      });
  };

  if (!selectedActivity) return null;

  return (
    <Modal
      title={`Запись на: ${selectedActivity.title}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width="500px"
      centered
      className={`${styles.bookingModal} ${styles.defaultBookingModal}`}
      destroyOnClose
      getContainer={false}
    >
      <div className={styles.modalContent}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Загрузка доступных дат...</p>
          </div>
        ) : error ? (
          <Alert
            message="Нет доступных дат"
            description={
              <div>
                <p>{error}</p>
                {(isWebinar || isMasterclass) && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                    Администратор добавит новые даты позже.
                  </p>
                )}
                {isTrial && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                    Попробуйте выбрать другую дату или обратитесь к
                    администратору.
                  </p>
                )}
              </div>
            }
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="selectedDate"
              label="Выберите дату"
              rules={[{ required: true, message: "Выберите дату занятия" }]}
            >
              <Select
                placeholder="Выберите дату"
                size="middle"
                className={styles.dateSelect}
                onChange={handleDateChange}
                notFoundContent="Нет доступных дат"
                options={getDateOptions()}
              />
            </Form.Item>

            <Form.Item
              name="selectedTime"
              label="Выберите время"
              rules={[{ required: true, message: "Выберите время занятия" }]}
            >
              <Select
                placeholder={
                  isWebinar || isMasterclass
                    ? "Время фиксированное"
                    : "Выберите удобное время"
                }
                size="middle"
                className={styles.timeSelect}
                disabled={
                  !form.getFieldValue("selectedDate") ||
                  availableTimeSlots.length === 0
                }
                notFoundContent="Нет доступного времени"
                options={availableTimeSlots.map((time) => ({
                  value: time,
                  label: time,
                }))}
              />
            </Form.Item>

            {(isWebinar || isMasterclass) && (
              <Alert
                message="Время фиксированное"
                description="Для вебинаров и мастер-классов время устанавливается администратором"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {isTrial && (
              <Alert
                message="Пробное занятие"
                description="Выберите удобную дату и время. Преподаватель подтвердит занятие."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item className={styles.modalFooter}>
              <Space className={styles.modalButtons}>
                <Button onClick={onCancel} size="middle">
                  Отмена
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  className={styles.submitButton}
                  disabled={!hasAvailableDates}
                >
                  Подтвердить запись
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export default DefaultBookingModal;
