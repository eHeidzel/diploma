import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Space,
  Radio,
  Divider,
  Tag,
  Steps,
  Alert,
  Select,
  DatePicker,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../css/learning.module.css";

interface GroupBookingModalProps {
  visible: boolean;
  selectedActivity: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

interface AvailableDate {
  date: string;
  times: string[];
}

const GroupBookingModal: React.FC<GroupBookingModalProps> = ({
  visible,
  selectedActivity,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (visible && selectedActivity) {
      const dates = getAvailableDates(selectedActivity);
      setAvailableDates(dates);
      
      if (dates.length > 0) {
        const firstDate = dates[0].date;
        setSelectedDate(firstDate);
        if (dates[0].times.length > 0) {
          setSelectedTime(dates[0].times[0]);
          form.setFieldsValue({
            startDate: firstDate,
            time: dates[0].times[0],
          });
        }
      }
    }
  }, [visible, selectedActivity]);

  const getAvailableDates = (activity: any): AvailableDate[] => {
    if (activity.availableDates && activity.availableDates.length > 0) {
      return activity.availableDates
        .filter((item: any) => item.date && item.times && item.times.length > 0)
        .map((item: any) => ({
          date: item.date,
          times: item.times,
        }));
    }
    return [];
  };

  const getTimeDisplay = (time: string): string => {
    // Преобразуем время в читаемый формат
    return time;
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const dateObj = availableDates.find((d) => d.date === date);
    if (dateObj && dateObj.times.length > 0) {
      const firstTime = dateObj.times[0];
      setSelectedTime(firstTime);
      form.setFieldsValue({
        time: firstTime,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await onSubmit({
        period: values.period,
        shift: values.shift,
        startDate: values.startDate,
        time: values.time,
        ageGroup: values.ageGroup || 'any',
      });
      form.resetFields();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedActivity) return null;

  const hasAvailableDates = availableDates.length > 0;
  const currentDateObj = availableDates.find((d) => d.date === selectedDate);
  const availableTimes = currentDateObj?.times || [];

  // Определяем смену на основе времени
  const getShiftFromTime = (time: string): string => {
    if (!time) return 'утренняя';
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'утренняя';
    if (hour >= 12 && hour < 17) return 'дневная';
    return 'вечерняя';
  };

  return (
    <Modal
      title={`Запись на: ${selectedActivity.title}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width="600px"
      centered
      className={`${styles.bookingModal} ${styles.groupBookingModal}`}
      destroyOnClose
      getContainer={false}
    >
      <div className={styles.modalContent}>
        <Alert
          message="Групповые занятия"
          description="Выберите дату и время занятия из доступных вариантов."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {!hasAvailableDates && (
          <Alert
            message="Нет доступных групп"
            description="На данный момент нет доступных групп для записи. Пожалуйста, обратитесь к администратору."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {selectedActivity.learningPlan &&
          selectedActivity.learningPlan.length > 0 && (
            <>
              <div className={styles.learningPlanModal}>
                <div className={styles.learningPlanHeader}>
                  <BookOutlined /> Программа обучения
                </div>
                <Steps
                  direction="vertical"
                  current={-1}
                  size="small"
                  items={selectedActivity.learningPlan.map((item: any) => ({
                    title: item.title,
                    description: (
                      <div>
                        {item.description}
                        <br />
                        <Tag color="blue" className={styles.durationTag}>
                          <ClockCircleOutlined /> {item.duration}
                        </Tag>
                      </div>
                    ),
                  }))}
                />
              </div>
              <Divider />
            </>
          )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className={styles.groupForm}>
            <div className={styles.sectionTitle}>
              <TeamOutlined /> Выберите параметры обучения
            </div>

            <Form.Item
              name="startDate"
              label="Дата начала занятий"
              rules={[{ required: true, message: "Выберите дату начала занятий" }]}
            >
              <Select 
                placeholder="Выберите дату начала"
                style={{ width: '100%' }}
                disabled={!hasAvailableDates}
                onChange={handleDateChange}
              >
                {availableDates.map((item) => (
                  <Select.Option key={item.date} value={item.date}>
                    {dayjs(item.date).format('DD MMMM YYYY')}
                    {item.times.length > 0 && ` (${item.times.length} вариантов времени)`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedDate && availableTimes.length > 0 && (
              <Form.Item
                name="time"
                label="Время занятия"
                rules={[{ required: true, message: "Выберите время занятия" }]}
              >
                <Select 
                  placeholder="Выберите время"
                  style={{ width: '100%' }}
                  disabled={!hasAvailableDates}
                  onChange={(value) => setSelectedTime(value)}
                >
                  {availableTimes.map((time) => (
                    <Select.Option key={time} value={time}>
                      <ClockCircleOutlined /> {getTimeDisplay(time)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {selectedTime && (
              <Alert
                message="Выбранное время"
                description={`Вы записываетесь на ${selectedTime} (${getShiftFromTime(selectedTime)} смена)`}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item
              name="period"
              label="Период обучения"
              initialValue={selectedActivity.groupPeriod || "6 месяцев"}
              rules={[{ required: true, message: "Выберите период обучения" }]}
            >
              <Radio.Group disabled={!hasAvailableDates}>
                <Space direction="vertical">
                  <Radio value="6 месяцев">6 месяцев</Radio>
                  <Radio value="год">1 год</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="shift"
              label="Смена"
              initialValue={selectedActivity.groupShift || "утренняя"}
              rules={[{ required: true, message: "Выберите смену" }]}
            >
              <Radio.Group disabled>
                <Space direction="vertical">
                  <Radio value="утренняя">Утренняя (9:00 - 12:00)</Radio>
                  <Radio value="дневная">Дневная (13:00 - 16:00)</Radio>
                  <Radio value="вечерняя">Вечерняя (18:00 - 21:00)</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>

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
                disabled={!hasAvailableDates || !selectedTime}
                loading={loading}
              >
                Подтвердить запись
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default GroupBookingModal;