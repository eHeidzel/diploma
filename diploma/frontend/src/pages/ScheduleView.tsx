import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  message,
  Table,
  Space,
  Tag,
  Typography,
  Spin,
  Empty,
  Tooltip,
  List,
  Avatar,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
} from "antd";
import {
  VideoCameraOutlined,
  UserOutlined,
  TeamOutlined,
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  HomeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { scheduleApi, scheduleRequestsApi } from "../services/api";
import styles from "../css/scheduleView.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

dayjs.locale("ru");

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ScheduleViewProps {
  user?: any;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ user }) => {
  const { getTitleLevel } = useAdaptiveLevel();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "week" | "day">("week");
  const [currentWeekStart, setCurrentWeekStart] = useState(
    dayjs().startOf("week"),
  );
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [studentsModalVisible, setStudentsModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      let response;
      if (isStudent) {
        response = await scheduleApi.getMy();
      } else if (isTeacher) {
        response = await scheduleApi.getByTeacher(user?.id);
      } else {
        response = await scheduleApi.getAll();
      }
      setSchedule(response.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      message.error("Ошибка загрузки расписания");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForLesson = async (scheduleId: number) => {
    try {
      const response = await scheduleApi.getEnrolledStudents(scheduleId);
      const uniqueStudents = Array.from(
        new Map(
          response.data.map((student: any) => [student.email, student]),
        ).values(),
      );
      setStudentsList(uniqueStudents);
      setStudentsModalVisible(true);
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Ошибка загрузки списка учеников");
    }
  };

  const handleSendRequest = async (values: any) => {
    setSubmitting(true);
    try {
      const data = {
        scheduleId: selectedLesson?.id,
        requestType: values.requestType,
        reason: values.reason,
        proposedDate: values.proposedDate?.format("YYYY-MM-DD"),
        proposedTime: values.proposedTime?.format("HH:mm"),
      };

      await scheduleRequestsApi.create(data);
      message.success("Запрос отправлен администратору");
      setRequestModalVisible(false);
      requestForm.resetFields();
      setSelectedLesson(null);
    } catch (error) {
      console.error("Error sending request:", error);
      message.error("Ошибка отправки запроса");
    } finally {
      setSubmitting(false);
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "individual":
        return <UserOutlined />;
      case "group":
        return <TeamOutlined />;
      case "webinar":
        return <VideoCameraOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "planned":
        return <Tag color="green">Запланировано</Tag>;
      case "in_progress":
        return <Tag color="blue">В процессе</Tag>;
      case "completed":
        return <Tag color="default">Завершено</Tag>;
      case "cancelled":
        return <Tag color="red">Отменено</Tag>;
      default:
        return <Tag>Неизвестно</Tag>;
    }
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(currentWeekStart.add(i, "day"));
    }
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 20 && minute > 0) break;
        slots.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        );
      }
    }
    return slots;
  };

  const getMinutesFromStart = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + (minute || 0);
  };

  const getLessonDurationHours = (lesson: any) => {
    const startMinutes = getMinutesFromStart(lesson.startTime);
    const endMinutes = getMinutesFromStart(lesson.endTime);
    return (endMinutes - startMinutes) / 60;
  };

  const getWeekLessons = () => {
    const weekDays = getWeekDays();
    const weekDates = weekDays.map((d) => d.format("YYYY-MM-DD"));
    return schedule.filter(
      (s) => weekDates.includes(s.date) && s.status !== "cancelled",
    );
  };

  const getDayLessons = () => {
    const dateStr = selectedDate.format("YYYY-MM-DD");
    return schedule
      .filter((s) => s.date === dateStr && s.status !== "cancelled")
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(currentWeekStart.subtract(1, "week"));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(currentWeekStart.add(1, "week"));
  };

  const goToTodayWeek = () => {
    setCurrentWeekStart(dayjs().startOf("week"));
    setSelectedDate(dayjs());
  };

  const goToPreviousDay = () => {
    setSelectedDate(selectedDate.subtract(1, "day"));
  };

  const goToNextDay = () => {
    setSelectedDate(selectedDate.add(1, "day"));
  };

  const goToTodayDay = () => {
    setSelectedDate(dayjs());
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const timeSlots = getTimeSlots();
    const weekLessons = getWeekLessons();
    const occupiedSlots = new Map<string, Set<number>>();

    return (
      <div className={styles.weekView}>
        <div className={styles.weekHeader}>
          <div className={styles.timeColumnHeader}>Время</div>
          {weekDays.map((day) => (
            <div
              key={day.format("YYYY-MM-DD")}
              className={`${styles.weekDayHeader} ${
                day.isSame(dayjs(), "day") ? styles.today : ""
              }`}
              onClick={() => {
                setSelectedDate(day);
                setViewMode("day");
              }}
            >
              <div className={styles.weekDayName}>{day.format("dddd")}</div>
              <div className={styles.weekDayDate}>{day.format("DD MMM")}</div>
            </div>
          ))}
        </div>
        <div className={styles.weekBody}>
          {timeSlots.map((timeSlot, slotIndex) => {
            return (
              <div key={timeSlot} className={styles.timeRow}>
                <div className={styles.timeLabel}>{timeSlot.slice(0, 5)}</div>
                {weekDays.map((day) => {
                  const dateStr = day.format("YYYY-MM-DD");

                  if (occupiedSlots.get(dateStr)?.has(slotIndex)) {
                    return <div key={dateStr} className={styles.timeCell} />;
                  }

                  const lessonAtSlot = weekLessons.find(
                    (lesson) =>
                      lesson.date === dateStr &&
                      getMinutesFromStart(lesson.startTime) ===
                        getMinutesFromStart(timeSlot),
                  );

                  if (!lessonAtSlot) {
                    return <div key={dateStr} className={styles.timeCell} />;
                  }

                  const durationHours = getLessonDurationHours(lessonAtSlot);
                  const slotHeight = 60;
                  const height = durationHours * slotHeight;

                  const slotCount = Math.ceil(durationHours * 2);
                  for (let i = 0; i < slotCount; i++) {
                    if (!occupiedSlots.has(dateStr)) {
                      occupiedSlots.set(dateStr, new Set());
                    }
                    occupiedSlots.get(dateStr)!.add(slotIndex + i);
                  }

                  return (
                    <div
                      key={dateStr}
                      className={styles.timeCell}
                      style={{ position: "relative" }}
                    >
                      <div
                        className={`${styles.weekLessonCard} ${
                          lessonAtSlot.status === "cancelled"
                            ? styles.cancelled
                            : ""
                        }`}
                        style={{
                          height: `${height}px`,
                          top: `0px`,
                        }}
                        onClick={() => {
                          setSelectedLesson(lessonAtSlot);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        <div className={styles.lessonTitle}>
                          {getActivityTypeIcon(lessonAtSlot.activity?.type)}{" "}
                          {lessonAtSlot.activity?.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayLessons = getDayLessons();
    const timeSlots = getTimeSlots();
    const occupiedSlots = new Set<number>();

    if (dayLessons.length === 0) {
      return (
        <div className={styles.dayView}>
          <div className={styles.dayHeader}>
            <Title level={4}>{selectedDate.format("dddd, DD MMMM YYYY")}</Title>
          </div>
          <div className={styles.dayBodyEmpty}>
            <Empty description="Нет занятий на выбранную дату" />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.dayView}>
        <div className={styles.dayHeader}>
          <Title level={4}>{selectedDate.format("dddd, DD MMMM YYYY")}</Title>
        </div>
        <div className={styles.dayGrid}>
          <div className={styles.dayTimeColumn}>
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot} className={styles.dayTimeSlot}>
                {timeSlot.slice(0, 5)}
              </div>
            ))}
          </div>

          <div className={styles.dayContentColumn}>
            {timeSlots.map((timeSlot, slotIndex) => {
              if (occupiedSlots.has(slotIndex)) {
                return <div key={timeSlot} className={styles.dayContentSlot} />;
              }

              const lessonAtSlot = dayLessons.find(
                (lesson) =>
                  getMinutesFromStart(lesson.startTime) ===
                  getMinutesFromStart(timeSlot),
              );

              if (!lessonAtSlot) {
                return <div key={timeSlot} className={styles.dayContentSlot} />;
              }

              const durationHours = getLessonDurationHours(lessonAtSlot);
              const slotHeight = 60;
              const totalHeight = durationHours * slotHeight;

              const slotCount = Math.ceil(durationHours * 2);
              for (let i = 0; i < slotCount; i++) {
                occupiedSlots.add(slotIndex + i);
              }

              return (
                <div
                  key={timeSlot}
                  className={styles.dayContentSlot}
                  style={{ position: "relative" }}
                >
                  <div
                    className={`${styles.dayLessonCard} ${
                      lessonAtSlot.status === "cancelled"
                        ? styles.cancelled
                        : ""
                    }`}
                    style={{
                      height: totalHeight,
                      top: 0,
                      left: 4,
                      right: 4,
                    }}
                    onClick={() => {
                      setSelectedLesson(lessonAtSlot);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <div className={styles.dayLessonTitle}>
                      {getActivityTypeIcon(lessonAtSlot.activity?.type)}{" "}
                      {lessonAtSlot.activity?.title}
                    </div>
                    <div className={styles.dayLessonTime}>
                      {lessonAtSlot.startTime.slice(0, 5)} -{" "}
                      {lessonAtSlot.endTime.slice(0, 5)}
                    </div>
                    {lessonAtSlot.meetLink && (
                      <div className={styles.dayLessonMeetLink}>
                        <VideoCameraOutlined /> Есть ссылка
                      </div>
                    )}
                    {lessonAtSlot.teacher && (
                      <div className={styles.dayLessonTeacher}>
                        <UserOutlined /> {lessonAtSlot.teacher.name}
                      </div>
                    )}
                    {isTeacher && (
                      <Button
                        size="small"
                        type="link"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchStudentsForLesson(lessonAtSlot.id);
                        }}
                      >
                        <TeamOutlined /> Список учеников
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: "Дата",
      key: "date",
      render: (_: any, record: any) => dayjs(record.date).format("DD.MM.YYYY"),
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Время",
      key: "time",
      render: (_: any, record: any) =>
        `${record.startTime.slice(0, 5)} - ${record.endTime.slice(0, 5)}`,
    },
    {
      title: "Занятие",
      key: "activity",
      render: (_: any, record: any) => (
        <Space>
          {getActivityTypeIcon(record.activity?.type)}
          <span>{record.activity?.title}</span>
          {getStatusTag(record.status)}
        </Space>
      ),
    },
    {
      title: isTeacher ? "Ученики" : "Преподаватель",
      key: isTeacher ? "students" : "teacher",
      render: (_: any, record: any) => {
        if (isTeacher) {
          return (
            <Button
              type="link"
              size="small"
              onClick={() => fetchStudentsForLesson(record.id)}
            >
              <TeamOutlined /> {record.enrolledCount}/{record.maxStudents}
            </Button>
          );
        }
        return record.teacher?.name || "Не назначен";
      },
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {record.meetLink && record.status === "planned" && (
            <Tooltip title="Подключиться">
              <Button
                type="text"
                size="small"
                icon={<VideoCameraOutlined />}
                onClick={() => window.open(record.meetLink, "_blank")}
              />
            </Tooltip>
          )}
          <Tooltip title="Детали">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedLesson(record);
                setIsDetailsModalOpen(true);
              }}
            />
          </Tooltip>
          {/* Для преподавателя - кнопка запроса администратору */}
          {isTeacher && record.status === "planned" && (
            <Tooltip title="Запрос администратору">
              <Button
                type="text"
                size="small"
                icon={<SendOutlined />}
                onClick={() => {
                  setSelectedLesson(record);
                  setRequestModalVisible(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="Загрузка расписания..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={getTitleLevel(3)} className={styles.title}>
          {isTeacher ? "Мои занятия" : "Расписание занятий"}
        </Title>
        <div className={styles.viewControls}>
          <Button.Group>
            <Button
              type={viewMode === "week" ? "primary" : "default"}
              onClick={() => setViewMode("week")}
            >
              Неделя
            </Button>
            <Button
              type={viewMode === "day" ? "primary" : "default"}
              onClick={() => setViewMode("day")}
            >
              День
            </Button>
            <Button
              type={viewMode === "table" ? "primary" : "default"}
              onClick={() => setViewMode("table")}
            >
              Список
            </Button>
          </Button.Group>
        </div>
      </div>

      {viewMode === "week" && (
        <div className={styles.navigation}>
          <Space>
            <Button icon={<LeftOutlined />} onClick={goToPreviousWeek} />
            <Button icon={<RightOutlined />} onClick={goToNextWeek} />
            <Button icon={<HomeOutlined />} onClick={goToTodayWeek}>
              Сегодня
            </Button>
            <span className={styles.weekRange}>
              {currentWeekStart.format("DD MMM")} -{" "}
              {currentWeekStart.add(6, "day").format("DD MMM YYYY")}
            </span>
          </Space>
        </div>
      )}

      {viewMode === "day" && (
        <div className={styles.navigation}>
          <Space>
            <Button icon={<LeftOutlined />} onClick={goToPreviousDay} />
            <Button icon={<RightOutlined />} onClick={goToNextDay} />
            <Button icon={<HomeOutlined />} onClick={goToTodayDay}>
              Сегодня
            </Button>
            <span className={styles.weekRange}>
              {selectedDate.format("DD MMMM YYYY")}
            </span>
          </Space>
        </div>
      )}

      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
      {viewMode === "table" && (
        <div className={styles.tableWrapper}>
          <Table
            dataSource={schedule.filter((s) => s.status !== "cancelled")}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}

      {/* Модальное окно деталей занятия */}
      <Modal
        title="Детали занятия"
        open={isDetailsModalOpen}
        onCancel={() => {
          setIsDetailsModalOpen(false);
          setSelectedLesson(null);
        }}
        footer={null}
        width={500}
        centered
      >
        {selectedLesson && (
          <div className={styles.lessonDetails}>
            <p>
              <strong>Занятие:</strong> {selectedLesson.activity?.title}
            </p>
            <p>
              <strong>Дата:</strong>{" "}
              {dayjs(selectedLesson.date).format("DD.MM.YYYY")}
            </p>
            <p>
              <strong>Время:</strong> {selectedLesson.startTime.slice(0, 5)} -{" "}
              {selectedLesson.endTime.slice(0, 5)}
            </p>
            {selectedLesson.teacher && !isTeacher && (
              <p>
                <strong>Преподаватель:</strong> {selectedLesson.teacher.name}
              </p>
            )}
            {selectedLesson.room && (
              <p>
                <strong>Аудитория:</strong> {selectedLesson.room}
              </p>
            )}
            {selectedLesson.meetLink && (
              <p>
                <strong>Ссылка:</strong>{" "}
                <a
                  href={selectedLesson.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Подключиться
                </a>
              </p>
            )}
            {isTeacher && (
              <>
                <p>
                  <strong>Записано учеников:</strong>{" "}
                  {selectedLesson.enrolledCount} / {selectedLesson.maxStudents}
                </p>
                <Button
                  type="primary"
                  onClick={() => fetchStudentsForLesson(selectedLesson.id)}
                >
                  <TeamOutlined /> Посмотреть список учеников
                </Button>
              </>
            )}
            {isTeacher && selectedLesson.status === "planned" && (
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => setRequestModalVisible(true)}
                >
                  Запрос администратору
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Модальное окно запроса администратору */}
      <Modal
        title="Запрос администратору"
        open={requestModalVisible}
        onCancel={() => {
          setRequestModalVisible(false);
          requestForm.resetFields();
          setSelectedLesson(null);
        }}
        footer={null}
        width={500}
        centered
        destroyOnClose
      >
        <Form form={requestForm} layout="vertical" onFinish={handleSendRequest}>
          <Form.Item
            name="requestType"
            label="Тип запроса"
            rules={[{ required: true, message: "Выберите тип запроса" }]}
          >
            <Select placeholder="Выберите тип запроса">
              <Select.Option value="reschedule">Перенос занятия</Select.Option>
              <Select.Option value="cancellation">Отмена занятия</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Причина"
            rules={[
              { required: true, message: "Опишите причину" },
              { min: 10, message: "Минимум 10 символов" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Опишите причину запроса (минимум 10 символов)"
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.requestType !== currentValues.requestType
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("requestType") === "reschedule" && (
                <>
                  <Form.Item
                    name="proposedDate"
                    label="Предлагаемая дата"
                    rules={[{ required: true, message: "Выберите дату" }]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD.MM.YYYY"
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    name="proposedTime"
                    label="Предлагаемое время"
                    rules={[{ required: true, message: "Выберите время" }]}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      format="HH:mm"
                      minuteStep={30}
                    />
                  </Form.Item>
                </>
              )
            }
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setRequestModalVisible(false);
                  requestForm.resetFields();
                  setSelectedLesson(null);
                }}
              >
                Отмена
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Отправить запрос
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно списка учеников */}
      <Modal
        title="Список учеников"
        open={studentsModalVisible}
        onCancel={() => setStudentsModalVisible(false)}
        footer={null}
        width={500}
        centered
      >
        <List
          dataSource={studentsList}
          renderItem={(student) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={student.avatar} icon={<UserOutlined />} />}
                title={student.name}
                description={student.email}
              />
            </List.Item>
          )}
          locale={{
            emptyText: <Empty description="Нет записанных учеников" />,
          }}
        />
      </Modal>
    </div>
  );
};

export default ScheduleView;
