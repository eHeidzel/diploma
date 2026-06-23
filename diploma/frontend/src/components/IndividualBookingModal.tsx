
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  DatePicker,
  Select,
  Button,
  Space,
  Alert,
  Tag,
  Spin,
} from "antd";
import {
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { activitiesApi } from "../services/api";
import styles from "../css/learning.module.css";

const daysOfWeek = [
  { value: "monday", label: "Понедельник", dayjsDay: 1 },
  { value: "tuesday", label: "Вторник", dayjsDay: 2 },
  { value: "wednesday", label: "Среда", dayjsDay: 3 },
  { value: "thursday", label: "Четверг", dayjsDay: 4 },
  { value: "friday", label: "Пятница", dayjsDay: 5 },
  { value: "saturday", label: "Суббота", dayjsDay: 6 },
  { value: "sunday", label: "Воскресенье", dayjsDay: 0 },
];

interface IndividualBookingModalProps {
  visible: boolean;
  selectedActivity: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  firstLessonInfo: any;
}

const IndividualBookingModal: React.FC<IndividualBookingModalProps> = ({
  visible,
  selectedActivity,
  onCancel,
  onSubmit,
  firstLessonInfo,
}) => {
  const [form] = Form.useForm();
  const [localFirstLessonInfo, setLocalFirstLessonInfo] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasTeacher, setHasTeacher] = useState<boolean>(true);

  const watchStartDate = Form.useWatch("startDate", form);
  const watchSchedule = Form.useWatch("schedule", form);

  useEffect(() => {
    if (selectedActivity) {
      const teacherId = selectedActivity?.teacherId || selectedActivity?.id;
      if (!teacherId) {
        setHasTeacher(false);
        setError("Для этого занятия не назначен преподаватель");
      } else {
        setHasTeacher(true);
        setError(null);
      }
    }
  }, [selectedActivity]);

  const loadTeacherSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      setError(null);
      const teacherId = selectedActivity?.teacherId || selectedActivity?.id;

      if (!teacherId) {
        setHasTeacher(false);
        setError("Для этого занятия не назначен преподаватель");
        setAvailableSlots([]);
        return;
      }

      const response = await activitiesApi.getTeacherAvailableSlots(
        teacherId,
        date,
        60,
      );

      if (response.data && response.data.slots) {
        setAvailableSlots(response.data.slots || []);
        if (response.data.slots.length === 0) {
          setError("У преподавателя нет свободного времени в эту дату");
        }
      } else {
        setAvailableSlots([]);
        setError("Не удалось загрузить свободное время");
      }
    } catch (error: any) {
      console.error("Error loading slots:", error);
      setAvailableSlots([]);
      if (error.response?.status === 404) {
        setError("Преподаватель не найден");
        setHasTeacher(false);
      } else {
        setError("Ошибка загрузки свободного времени");
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const dateStr = date.format("YYYY-MM-DD");
      setSelectedDate(dateStr);
      loadTeacherSlots(dateStr);
    } else {
      setSelectedDate(null);
      setAvailableSlots([]);
      setError(null);
    }
  };

  const calculateFirstLesson = (
    startDate: dayjs.Dayjs,
    selectedSchedule: any[],
  ) => {
    if (!startDate || !selectedSchedule || selectedSchedule.length === 0)
      return null;

    for (let offset = 0; offset <= 14; offset++) {
      const checkDate = startDate.add(offset, "day");
      const checkDay = checkDate.day();

      const matchedSchedule = selectedSchedule.find((schedule) => {
        const dayInfo = daysOfWeek.find((d) => d.value === schedule.day);
        return dayInfo && dayInfo.dayjsDay === checkDay;
      });

      if (matchedSchedule) {
        const dayInfo = daysOfWeek.find((d) => d.value === matchedSchedule.day);
        return {
          date: checkDate.format("DD.MM.YYYY"),
          day: dayInfo?.label || "",
          time: matchedSchedule.time,
        };
      }
    }
    return null;
  };

  useEffect(() => {
    if (watchStartDate && watchSchedule && watchSchedule.length > 0) {
      const info = calculateFirstLesson(watchStartDate, watchSchedule);
      setLocalFirstLessonInfo(info);
    } else {
      setLocalFirstLessonInfo(null);
    }
  }, [watchStartDate, watchSchedule]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setLocalFirstLessonInfo(null);
      setAvailableSlots([]);
      setSelectedDate(null);
      setError(null);
    }
  }, [visible, form]);

  const handleSubmit = async (values: any) => {
    try {
      const scheduleData =
        values.schedule?.map((item: any) => ({
          day: item.day,
          time: item.time,
        })) || [];

      await onSubmit({
        startDate: values.startDate.format("YYYY-MM-DD"),
        schedule: scheduleData,
        ageGroup: values.ageGroup,
        teacherId: selectedActivity?.teacherId || selectedActivity?.id,
      });
      form.resetFields();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  if (!selectedActivity) return null;

  const displayFirstLesson = firstLessonInfo || localFirstLessonInfo;

  if (!hasTeacher) {
    return (
      <Modal
        title={`Запись на: ${selectedActivity.title}`}
        open={visible}
        onCancel={onCancel}
        footer={null}
        width="500px"
        centered
        className={`${styles.bookingModal} ${styles.individualBookingModal}`}
        destroyOnClose
        getContainer={false}
      >
        <div className={styles.modalContent}>
          <Alert
            message="Нет преподавателя"
            description="Для этого занятия пока не назначен преподаватель. Пожалуйста, обратитесь к администратору."
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button onClick={onCancel}>Закрыть</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={`Запись на: ${selectedActivity.title}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width="600px"
      centered
      className={`${styles.bookingModal} ${styles.individualBookingModal}`}
      destroyOnClose
      getContainer={false}
    >
      <div className={styles.modalContent}>
        <Alert
          message="Выберите дату начала и дни недели"
          description="Время будет автоматически подобрано по свободному расписанию преподавателя"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {error && (
          <Alert
            message="Ошибка"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="startDate"
            label="Дата старта занятий"
            rules={[
              { required: true, message: "Выберите дату начала занятий" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              size="middle"
              placeholder="Выберите дату"
              format="DD.MM.YYYY"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
              onChange={handleDateChange}
            />
          </Form.Item>

          <Form.Item
            name="ageGroup"
            label="Возрастная группа"
            rules={[{ required: true, message: "Выберите возрастную группу" }]}
          >
            <Select
              placeholder="Выберите возрастную группу"
              size="middle"
              className={styles.ageGroupSelect}
              options={selectedActivity.availableAgeGroups?.map(
                (group: string) => ({
                  value: group,
                  label: group,
                }),
              )}
            />
          </Form.Item>

          {displayFirstLesson && (
            <Alert
              message="Информация о первом занятии"
              description={
                <div>
                  <p>
                    <CalendarOutlined /> <strong>Дата:</strong>{" "}
                    {displayFirstLesson.date} ({displayFirstLesson.day})
                  </p>
                  <p>
                    <ClockCircleOutlined /> <strong>Время:</strong>{" "}
                    {displayFirstLesson.time}
                  </p>
                </div>
              }
              type="info"
              showIcon
              className={styles.firstLessonAlert}
            />
          )}

          <div className={styles.individualSchedule}>
            <div className={styles.sectionTitle}>
              <UserOutlined /> Выберите расписание
            </div>
            <Form.List name="schedule">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className={styles.scheduleRow}>
                      <div className={styles.scheduleDay}>
                        <Form.Item
                          {...restField}
                          name={[name, "day"]}
                          rules={[{ required: true, message: "Выберите день" }]}
                          noStyle
                        >
                          <Select
                            placeholder="День недели"
                            options={daysOfWeek}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </div>
                      <div className={styles.scheduleTime}>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, curValues) => {
                            return (
                              prevValues.schedule?.[name]?.day !==
                              curValues.schedule?.[name]?.day
                            );
                          }}
                        >
                          {({ getFieldValue }) => {
                            const scheduleValue = getFieldValue("schedule");
                            const currentDay = scheduleValue?.[name]?.day;

                            const showSlots = selectedDate && currentDay;

                            return (
                              <Form.Item
                                {...restField}
                                name={[name, "time"]}
                                rules={[
                                  { required: true, message: "Выберите время" },
                                ]}
                                noStyle
                              >
                                <Select
                                  placeholder={
                                    showSlots
                                      ? "Выберите свободное время"
                                      : "Сначала выберите день"
                                  }
                                  style={{ width: "100%" }}
                                  disabled={!showSlots || loadingSlots}
                                  loading={loadingSlots}
                                  notFoundContent={
                                    loadingSlots ? (
                                      <Spin size="small" />
                                    ) : error ? (
                                      <span style={{ color: "#ff4d4f" }}>
                                        {error}
                                      </span>
                                    ) : (
                                      "Нет свободного времени у преподавателя"
                                    )
                                  }
                                >
                                  {showSlots &&
                                    availableSlots.map((time) => (
                                      <Select.Option key={time} value={time}>
                                        {time}
                                      </Select.Option>
                                    ))}
                                </Select>
                              </Form.Item>
                            );
                          }}
                        </Form.Item>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        className={styles.removeScheduleBtn}
                        disabled={fields.length <= 1}
                      />
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add({ day: undefined, time: undefined })}
                      block
                      icon={<PlusOutlined />}
                      className={styles.addScheduleBtn}
                      disabled={fields.length >= 7}
                    >
                      Добавить день и время (макс. 7)
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          {selectedActivity.hourType && (
            <div className={styles.hourTypeInfo}>
              <Tag
                color={
                  selectedActivity.hourType === "academic" ? "blue" : "gold"
                }
                className={styles.hourTypeInfoTag}
              >
                {selectedActivity.hourType === "academic"
                  ? "🎓 Академический час (45 мин)"
                  : "⭐ Астрономический час (60 мин)"}
              </Tag>
            </div>
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

export default IndividualBookingModal;
