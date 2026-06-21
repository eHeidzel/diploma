// pages/ScheduleView.tsx
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
        scheduleId: 0,
        requestType: "cancellation",
        reason: values.reason,
      };

      await scheduleRequestsApi.create(data);
      message.success("Запрос отправлен администратору");
      setRequestModalVisible(false);
      requestForm.resetFields();
    } catch (error: any) {
      console.error("Error sending request:", error);
      message.error(error.response?.data?.message || "Ошибка отправки запроса");
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
  
  // Группируем занятия по дням
  const lessonsByDay = new Map();
  weekDays.forEach(day => {
    const dateStr = day.format("YYYY-MM-DD");
    const dayLessons = weekLessons.filter(lesson => lesson.date === dateStr);
    lessonsByDay.set(dateStr, dayLessons);
  });

  // Словарь для отслеживания занятых слотов
  const occupiedSlots = new Map();

  return (
    <div className={styles.weekView}>
      <div className={styles.weekHeader}>
        <div className={styles.weekTimeHeader}>Время</div>
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
          const slotMinutes = getMinutesFromStart(timeSlot);
          
          return (
            <div key={timeSlot} className={styles.weekTimeRow}>
              <div className={styles.weekTimeLabel}>{timeSlot.slice(0, 5)}</div>
              {weekDays.map((day) => {
                const dateStr = day.format("YYYY-MM-DD");
                
                // Проверяем, занят ли этот слот для данного дня
                if (occupiedSlots.get(dateStr)?.has(slotIndex)) {
                  return <div key={dateStr} className={styles.weekTimeCell} />;
                }
                
                const dayLessons = lessonsByDay.get(dateStr) || [];
                
                // Находим занятие, которое начинается в этом слоте
                const lessonAtSlot = dayLessons.find(
                  (lesson: any) => getMinutesFromStart(lesson.startTime) === slotMinutes
                );

                if (lessonAtSlot) {
                  // ТОЧНЫЙ РАСЧЕТ ВЫСОТЫ
                  const startMinutes = getMinutesFromStart(lessonAtSlot.startTime);
                  const endMinutes = getMinutesFromStart(lessonAtSlot.endTime);
                  const durationMinutes = endMinutes - startMinutes;
                  
                  const slotDuration = 30; // длительность слота в минутах
                  const slotHeight = 60; // высота слота в пикселях
                  const heightInPixels = (durationMinutes / slotDuration) * slotHeight;
                  
                  // Отмечаем занятые слоты для этого дня
                  const slotCount = Math.ceil(durationMinutes / slotDuration);
                  if (!occupiedSlots.has(dateStr)) {
                    occupiedSlots.set(dateStr, new Set());
                  }
                  for (let i = 0; i < slotCount; i++) {
                    occupiedSlots.get(dateStr)!.add(slotIndex + i);
                  }

                  return (
                    <div key={dateStr} className={styles.weekTimeCell}>
                      <div
                        className={`${styles.weekLessonCard} ${
                          lessonAtSlot.status === "cancelled" ? styles.cancelled : ""
                        }`}
                        style={{
                          height: `${Math.max(heightInPixels - 4, 56)}px`,
                          top: `2px`,
                          bottom: `auto`,
                        }}
                        onClick={() => {
                          setSelectedLesson(lessonAtSlot);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        <div className={styles.weekLessonTitle}>
                          {getActivityTypeIcon(lessonAtSlot.activity?.type)} {lessonAtSlot.activity?.title}
                        </div>
                        <div className={styles.weekLessonTime}>
                          {lessonAtSlot.startTime.slice(0, 5)} - {lessonAtSlot.endTime.slice(0, 5)}
                        </div>
                        {lessonAtSlot.meetLink && (
                          <div className={styles.weekLessonMeetLink}>
                            <VideoCameraOutlined /> Есть ссылка
                          </div>
                        )}
                        {isTeacher && (
                          <div className={styles.weekLessonStudents}>
                            <TeamOutlined /> {lessonAtSlot.enrolledCount || 0}/{lessonAtSlot.maxStudents}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return <div key={dateStr} className={styles.weekTimeCell} />;
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
              const slotMinutes = getMinutesFromStart(timeSlot);
              
              // Проверяем, занят ли этот слот
              if (occupiedSlots.has(slotIndex)) {
                return <div key={timeSlot} className={styles.dayContentSlot} />;
              }

              // Находим занятие, которое начинается в этом слоте
              const lessonAtSlot = dayLessons.find(
                (lesson) => getMinutesFromStart(lesson.startTime) === slotMinutes
              );

              if (!lessonAtSlot) {
                return <div key={timeSlot} className={styles.dayContentSlot} />;
              }

              // ТОЧНЫЙ РАСЧЕТ ВЫСОТЫ
              const startMinutes = getMinutesFromStart(lessonAtSlot.startTime);
              const endMinutes = getMinutesFromStart(lessonAtSlot.endTime);
              const durationMinutes = endMinutes - startMinutes;
              
              const slotDuration = 30; // длительность слота в минутах
              const slotHeight = 60; // высота слота в пикселях
              const totalHeight = (durationMinutes / slotDuration) * slotHeight;

              // Отмечаем занятые слоты
              const slotCount = Math.ceil(durationMinutes / slotDuration);
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
                      lessonAtSlot.status === "cancelled" ? styles.cancelled : ""
                    }`}
                    style={{
                      height: `${totalHeight - 4}px`,
                      top: `2px`,
                      left: `4px`,
                      right: `4px`,
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
          {isTeacher && (
            <Tooltip title="Запрос администратору">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => {
                  requestForm.resetFields();
                  setRequestModalVisible(true);
                }}
              />
            </Tooltip>
          )}
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
          </div>
        )}
      </Modal>

      <Modal
        title="Запрос администратору"
        open={requestModalVisible}
        onCancel={() => {
          setRequestModalVisible(false);
          requestForm.resetFields();
        }}
        footer={null}
        width={500}
        centered
        destroyOnClose
      >
        <Form form={requestForm} layout="vertical" onFinish={handleSendRequest}>
          <Form.Item
            name="reason"
            label="Текст запроса"
            rules={[
              { required: true, message: "Напишите текст запроса" },
              { min: 10, message: "Текст должен содержать минимум 10 символов" },
              { max: 500, message: "Текст не должен превышать 500 символов" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Опишите причину запроса (минимум 10 символов)"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setRequestModalVisible(false);
                  requestForm.resetFields();
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