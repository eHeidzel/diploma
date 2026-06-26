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
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

  const getShiftFromTime = (time: string): string => {
    if (!time) return t('learning.groupBooking.shiftMorning');
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return t('learning.groupBooking.shiftMorning');
    if (hour >= 12 && hour < 17) return t('learning.groupBooking.shiftDay');
    return t('learning.groupBooking.shiftEvening');
  };

  return (
    <Modal
      title={`${t('learning.groupBooking.title')}: ${selectedActivity.title}`}
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
          message={t('learning.groupBooking.title')}
          description={t('learning.groupBooking.description')}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {!hasAvailableDates && (
          <Alert
            message={t('learning.groupBooking.noAvailableGroups')}
            description={t('learning.groupBooking.noAvailableGroupsDescription')}
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
                  <BookOutlined /> {t('learning.learningPlan') || "Программа обучения"}
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
              <TeamOutlined /> {t('learning.groupBooking.selectPeriod')}
            </div>

            <Form.Item
              name="startDate"
              label={t('learning.groupBooking.selectStartDate')}
              rules={[{ required: true, message: t('learning.validation.startDateRequired') || "Выберите дату начала занятий" }]}
            >
              <Select 
                placeholder={t('learning.groupBooking.selectStartDate')}
                style={{ width: '100%' }}
                disabled={!hasAvailableDates}
                onChange={handleDateChange}
              >
                {availableDates.map((item) => (
                  <Select.Option key={item.date} value={item.date}>
                    {dayjs(item.date).format('DD MMMM YYYY')}
                    {item.times.length > 0 && ` (${item.times.length} ${t('learning.groupBooking.timeVariants') || 'вариантов времени'})`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedDate && availableTimes.length > 0 && (
              <Form.Item
                name="time"
                label={t('learning.groupBooking.selectTime')}
                rules={[{ required: true, message: t('learning.validation.timeRequired') || "Выберите время занятия" }]}
              >
                <Select 
                  placeholder={t('learning.groupBooking.selectTime')}
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
                message={t('learning.groupBooking.selectedTime')}
                description={`${t('learning.groupBooking.selectedTime')}: ${selectedTime} (${getShiftFromTime(selectedTime)})`}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item
              name="period"
              label={t('learning.groupBooking.period')}
              initialValue={selectedActivity.groupPeriod || "6 месяцев"}
              rules={[{ required: true, message: t('learning.validation.periodRequired') || "Выберите период обучения" }]}
            >
              <Radio.Group disabled={!hasAvailableDates}>
                <Space direction="vertical">
                  <Radio value="6 месяцев">{t('learning.groupBooking.sixMonths')}</Radio>
                  <Radio value="год">{t('learning.groupBooking.oneYear')}</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="shift"
              label={t('learning.groupBooking.shift')}
              initialValue={selectedActivity.groupShift || "утренняя"}
              rules={[{ required: true, message: t('learning.validation.shiftRequired') || "Выберите смену" }]}
            >
              <Radio.Group disabled>
                <Space direction="vertical">
                  <Radio value="утренняя">{t('learning.groupBooking.shiftMorning')}</Radio>
                  <Radio value="дневная">{t('learning.groupBooking.shiftDay')}</Radio>
                  <Radio value="вечерняя">{t('learning.groupBooking.shiftEvening')}</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>

          <Form.Item className={styles.modalFooter}>
            <Space className={styles.modalButtons}>
              <Button onClick={onCancel} size="middle">
                {t('learning.groupBooking.cancel')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="middle"
                className={styles.submitButton}
                disabled={!hasAvailableDates || !selectedTime}
                loading={loading}
              >
                {t('learning.groupBooking.confirm')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default GroupBookingModal;