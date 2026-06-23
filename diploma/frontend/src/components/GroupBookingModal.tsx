
import React from "react";
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
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import styles from "../css/learning.module.css";

interface GroupBookingModalProps {
  visible: boolean;
  selectedActivity: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const GroupBookingModal: React.FC<GroupBookingModalProps> = ({
  visible,
  selectedActivity,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit({
        period: values.period,
        shift: values.shift,
      });
      form.resetFields();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  if (!selectedActivity) return null;

  const hasAvailableDates =
    selectedActivity.availableDates &&
    selectedActivity.availableDates.length > 0;

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
          description="Расписание групповых занятий устанавливается администратором. Выберите период и смену."
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

            {hasAvailableDates && (
              <div style={{ marginBottom: 16 }}>
                <Alert
                  message="Доступные даты"
                  description={
                    <div>
                      {selectedActivity.availableDates.map((item: any) => (
                        <Tag
                          key={item.date}
                          color="green"
                          style={{ margin: "4px" }}
                        >
                          <CalendarOutlined /> {item.date}
                        </Tag>
                      ))}
                    </div>
                  }
                  type="success"
                  showIcon
                />
              </div>
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
              initialValue={selectedActivity.groupShift}
              rules={[{ required: true, message: "Выберите смену" }]}
            >
              <Radio.Group disabled={!hasAvailableDates}>
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
                disabled={!hasAvailableDates}
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
