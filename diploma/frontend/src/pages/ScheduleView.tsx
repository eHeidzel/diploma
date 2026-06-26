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
import "dayjs/locale/en";
import { scheduleApi, scheduleRequestsApi } from "../services/api";
import styles from "../css/scheduleView.module.css";
import { useTranslation } from "react-i18next";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

const { Title } = Typography;
const { TextArea } = Input;

interface ScheduleViewProps {
  user?: any;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ user }) => {
  const { t, i18n } = useTranslation();
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

  // Маппинг дней недели на русском
  const weekDaysMap: Record<string, string> = {
    monday: "Пн",
    tuesday: "Вт",
    wednesday: "Ср",
    thursday: "Чт",
    friday: "Пт",
    saturday: "Сб",
    sunday: "Вс",
  };

  // Маппинг дней недели на английском
  const weekDaysMapEn: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  // Полные названия дней недели на русском
  const weekDaysFullMap: Record<string, string> = {
    monday: "Понедельник",
    tuesday: "Вторник",
    wednesday: "Среда",
    thursday: "Четверг",
    friday: "Пятница",
    saturday: "Суббота",
    sunday: "Воскресенье",
  };

  const weekDaysFullMapEn: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  // Функция для получения переведенного дня недели
  const getTranslatedWeekDay = (date: dayjs.Dayjs, format: "short" | "full" = "short") => {
    const dayKey = date.format("dddd").toLowerCase();
    const isRussian = i18n.language === "ru";
    
    if (format === "full") {
      return isRussian ? weekDaysFullMap[dayKey] || date.format("dddd") : weekDaysFullMapEn[dayKey] || date.format("dddd");
    }
    
    return isRussian ? weekDaysMap[dayKey] || date.format("ddd") : weekDaysMapEn[dayKey] || date.format("ddd");
  };

  // Эффект для смены локали dayjs при смене языка
  useEffect(() => {
    const locale = i18n.language === "ru" ? "ru" : "en";
    dayjs.locale(locale);
  }, [i18n.language]);

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
      message.error(t("scheduleView.loading"));
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
      message.error(t("scheduleView.students.noStudents"));
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
      message.success(t("scheduleView.request.success"));
      setRequestModalVisible(false);
      requestForm.resetFields();
    } catch (error: any) {
      console.error("Error sending request:", error);
      message.error(error.response?.data?.message || t("scheduleView.request.error"));
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
    const statusMap: Record<string, { color: string; label: string }> = {
      planned: { color: "green", label: t("scheduleView.statuses.planned") },
      in_progress: { color: "blue", label: t("scheduleView.statuses.in_progress") },
      completed: { color: "default", label: t("scheduleView.statuses.completed") },
      cancelled: { color: "red", label: t("scheduleView.statuses.cancelled") },
    };
    const config = statusMap[status] || { color: "default", label: status };
    return <Tag color={config.color}>{config.label}</Tag>;
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

    const lessonsByDay = new Map();
    weekDays.forEach(day => {
      const dateStr = day.format("YYYY-MM-DD");
      const dayLessons = weekLessons.filter(lesson => lesson.date === dateStr);
      lessonsByDay.set(dateStr, dayLessons);
    });

    const occupiedSlots = new Map();

    return (
      <div className={styles.weekView}>
        <div className={styles.weekHeader}>
          <div className={styles.weekTimeHeader}>{t("scheduleView.table.time")}</div>
          {weekDays.map((day) => {
            const isToday = day.isSame(dayjs(), "day");
            const dayName = getTranslatedWeekDay(day, "short");
            
            return (
              <div
                key={day.format("YYYY-MM-DD")}
                className={`${styles.weekDayHeader} ${
                  isToday ? styles.today : ""
                }`}
                onClick={() => {
                  setSelectedDate(day);
                  setViewMode("day");
                }}
              >
                <div className={styles.weekDayName}>{dayName}</div>
                <div className={styles.weekDayDate}>{day.format("DD MMM")}</div>
              </div>
            );
          })}
        </div>

        <div className={styles.weekBody}>
          {timeSlots.map((timeSlot, slotIndex) => {
            const slotMinutes = getMinutesFromStart(timeSlot);

            return (
              <div key={timeSlot} className={styles.weekTimeRow}>
                <div className={styles.weekTimeLabel}>{timeSlot.slice(0, 5)}</div>
                {weekDays.map((day) => {
                  const dateStr = day.format("YYYY-MM-DD");

                  if (occupiedSlots.get(dateStr)?.has(slotIndex)) {
                    return <div key={dateStr} className={styles.weekTimeCell} />;
                  }

                  const dayLessons = lessonsByDay.get(dateStr) || [];

                  const lessonAtSlot = dayLessons.find(
                    (lesson: any) => getMinutesFromStart(lesson.startTime) === slotMinutes
                  );

                  if (lessonAtSlot) {
                    const startMinutes = getMinutesFromStart(lessonAtSlot.startTime);
                    const endMinutes = getMinutesFromStart(lessonAtSlot.endTime);
                    const durationMinutes = endMinutes - startMinutes;

                    const slotDuration = 30;
                    const slotHeight = 60;
                    const heightInPixels = (durationMinutes / slotDuration) * slotHeight;

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
                              <VideoCameraOutlined /> {t("scheduleView.meetLink.hasLink")}
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

    // Получаем полное название дня недели
    const fullDayName = getTranslatedWeekDay(selectedDate, "full");
    const formattedDate = selectedDate.format("DD MMMM YYYY");
    const dayTitle = i18n.language === "ru" 
      ? `${fullDayName}, ${formattedDate}` 
      : `${fullDayName}, ${formattedDate}`;

    if (dayLessons.length === 0) {
      return (
        <div className={styles.dayView}>
          <div className={styles.dayHeader}>
            <Title level={4}>{dayTitle}</Title>
          </div>
          <div className={styles.dayBodyEmpty}>
            <Empty description={t("scheduleView.noLessons")} />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.dayView}>
        <div className={styles.dayHeader}>
          <Title level={4}>{dayTitle}</Title>
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

              if (occupiedSlots.has(slotIndex)) {
                return <div key={timeSlot} className={styles.dayContentSlot} />;
              }

              const lessonAtSlot = dayLessons.find(
                (lesson) => getMinutesFromStart(lesson.startTime) === slotMinutes
              );

              if (!lessonAtSlot) {
                return <div key={timeSlot} className={styles.dayContentSlot} />;
              }

              const startMinutes = getMinutesFromStart(lessonAtSlot.startTime);
              const endMinutes = getMinutesFromStart(lessonAtSlot.endTime);
              const durationMinutes = endMinutes - startMinutes;

              const slotDuration = 30;
              const slotHeight = 60;
              const totalHeight = (durationMinutes / slotDuration) * slotHeight;

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
                        <VideoCameraOutlined /> {t("scheduleView.meetLink.hasLink")}
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
                        <TeamOutlined /> {t("scheduleView.details.viewStudents")}
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
      title: t("scheduleView.table.date"),
      key: "date",
      render: (_: any, record: any) => {
        const date = dayjs(record.date);
        const dayName = getTranslatedWeekDay(date, "short");
        return `${dayName} ${date.format("DD.MM.YYYY")}`;
      },
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: t("scheduleView.table.time"),
      key: "time",
      render: (_: any, record: any) =>
        `${record.startTime.slice(0, 5)} - ${record.endTime.slice(0, 5)}`,
    },
    {
      title: t("scheduleView.table.activity"),
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
      title: isTeacher ? t("scheduleView.table.students") : t("scheduleView.table.teacher"),
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
        return record.teacher?.name || t("common.notSpecified");
      },
    },
    {
      title: t("scheduleView.table.actions"),
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {record.meetLink && record.status === "planned" && (
            <Tooltip title={t("scheduleView.details.connect")}>
              <Button
                type="text"
                size="small"
                icon={<VideoCameraOutlined />}
                onClick={() => window.open(record.meetLink, "_blank")}
              />
            </Tooltip>
          )}
          <Tooltip title={t("scheduleView.details.title")}>
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
        <Spin size="large" tip={t("scheduleView.loading")} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={getTitleLevel(3)} className={styles.title}>
          {isTeacher ? t("scheduleView.teacherTitle") : t("scheduleView.title")}
        </Title>
        <div className={styles.viewControls}>
          <Button.Group>
            <Button
              type={viewMode === "week" ? "primary" : "default"}
              onClick={() => setViewMode("week")}
            >
              {t("scheduleView.views.week")}
            </Button>
            <Button
              type={viewMode === "day" ? "primary" : "default"}
              onClick={() => setViewMode("day")}
            >
              {t("scheduleView.views.day")}
            </Button>
            <Button
              type={viewMode === "table" ? "primary" : "default"}
              onClick={() => setViewMode("table")}
            >
              {t("scheduleView.views.list")}
            </Button>
          </Button.Group>
          {isTeacher && (
            <Tooltip title={t("scheduleView.request.title")}>
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
              {t("scheduleView.navigation.today")}
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
              {t("scheduleView.navigation.today")}
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
        title={t("scheduleView.details.title")}
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
              <strong>{t("scheduleView.details.activity")}:</strong> {selectedLesson.activity?.title}
            </p>
            <p>
              <strong>{t("scheduleView.details.date")}:</strong>{" "}
              {dayjs(selectedLesson.date).format("DD.MM.YYYY")}
            </p>
            <p>
              <strong>{t("scheduleView.details.time")}:</strong> {selectedLesson.startTime.slice(0, 5)} -{" "}
              {selectedLesson.endTime.slice(0, 5)}
            </p>
            {selectedLesson.teacher && !isTeacher && (
              <p>
                <strong>{t("scheduleView.details.teacher")}:</strong> {selectedLesson.teacher.name}
              </p>
            )}
            {selectedLesson.room && (
              <p>
                <strong>{t("scheduleView.details.room")}:</strong> {selectedLesson.room}
              </p>
            )}
            {selectedLesson.meetLink && (
              <p>
                <strong>{t("scheduleView.details.meetLink")}:</strong>{" "}
                <a
                  href={selectedLesson.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("scheduleView.details.connect")}
                </a>
              </p>
            )}
            {isTeacher && (
              <>
                <p>
                  <strong>{t("scheduleView.details.enrolled")}:</strong>{" "}
                  {selectedLesson.enrolledCount} / {selectedLesson.maxStudents}
                </p>
                <Button
                  type="primary"
                  onClick={() => fetchStudentsForLesson(selectedLesson.id)}
                >
                  <TeamOutlined /> {t("scheduleView.details.viewStudents")}
                </Button>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={t("scheduleView.request.title")}
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
            label={t("scheduleView.request.label")}
            rules={[
              { required: true, message: t("scheduleView.request.label") },
              { min: 10, message: t("scheduleView.request.minLength") },
              { max: 500, message: t("scheduleView.request.maxLength") },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={t("scheduleView.request.placeholder")}
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
                {t("scheduleView.request.cancel")}
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {t("scheduleView.request.send")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t("scheduleView.students.title")}
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
            emptyText: <Empty description={t("scheduleView.students.noStudents")} />,
          }}
        />
      </Modal>
    </div>
  );
};

export default ScheduleView;