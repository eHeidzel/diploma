
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  message,
  Popconfirm,
  Tooltip,
  Alert,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { adminApi, activitiesApi } from "../services/api";
import styles from "../css/admin.module.css";

const { Title } = Typography;

interface AdminScheduleProps {
  user: any;
}

const TIME_SLOTS = [];
for (let hour = 8; hour <= 19; hour++) {
  TIME_SLOTS.push(dayjs().hour(hour).minute(0).second(0));
  TIME_SLOTS.push(dayjs().hour(hour).minute(30).second(0));
}
TIME_SLOTS.push(dayjs().hour(20).minute(0).second(0));

const AdminSchedule: React.FC<AdminScheduleProps> = ({ user }) => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scheduleRes, activitiesRes, teachersRes] = await Promise.all([
        adminApi.getSchedule(),
        adminApi.getActivities(),
        adminApi.getTeachers(),
      ]);
      setSchedule(scheduleRes.data);
      setActivities(
        activitiesRes.data.filter((a: any) => a.isActive !== false),
      );
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      message.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const handleActivityChange = (activityId: number) => {
    const activity = activities.find((a) => a.id === activityId);
    setSelectedActivity(activity);
    if (activity?.teacherId) {
      form.setFieldsValue({ teacherId: activity.teacherId });
    }
  };

  const validateTimeRange = (_: any, value: [dayjs.Dayjs, dayjs.Dayjs]) => {
    if (!value || !value[0] || !value[1]) {
      return Promise.reject(new Error("Выберите время"));
    }

    const startHour = value[0].hour();
    const endHour = value[1].hour();
    const startMinute = value[0].minute();
    const endMinute = value[1].minute();

    if (
      startHour < 8 ||
      (startHour === 20 && startMinute > 0) ||
      startHour > 20
    ) {
      return Promise.reject(
        new Error("Занятия возможны только с 8:00 до 20:00"),
      );
    }

    if (endHour < 8 || (endHour === 20 && endMinute > 0) || endHour > 20) {
      return Promise.reject(
        new Error("Занятия возможны только с 8:00 до 20:00"),
      );
    }

    if (value[1].isBefore(value[0])) {
      return Promise.reject(
        new Error("Время окончания должно быть позже времени начала"),
      );
    }

    const diffMinutes = value[1].diff(value[0], "minute");
    if (diffMinutes < 30) {
      return Promise.reject(
        new Error("Минимальная длительность занятия - 30 минут"),
      );
    }

    if (diffMinutes > 240) {
      return Promise.reject(
        new Error("Максимальная длительность занятия - 4 часа"),
      );
    }

    return Promise.resolve();
  };

  const validateDate = (_: any, value: dayjs.Dayjs) => {
    if (!value) {
      return Promise.reject(new Error("Выберите дату"));
    }

    if (value.isBefore(dayjs(), "day")) {
      return Promise.reject(new Error("Нельзя создавать занятия в прошлом"));
    }

    return Promise.resolve();
  };

  const handleSubmit = async (values: any) => {
    try {
      const scheduleData = {
        activityId: values.activityId,
        teacherId: values.teacherId,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.timeRange[0].format("HH:mm"),
        endTime: values.timeRange[1].format("HH:mm"),
        maxStudents:
          values.maxStudents ||
          (selectedActivity?.type === "individual" ? 1 : 10),
      };

      if (editingSchedule) {
        await adminApi.updateSchedule(editingSchedule.id, scheduleData);
        message.success("Занятие обновлено");
      } else {
        await adminApi.createSchedule(scheduleData);
        message.success("Занятие добавлено в расписание");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingSchedule(null);
      setSelectedActivity(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Ошибка сохранения");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteSchedule(id);
      message.success("Занятие удалено");
      fetchData();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      message.error("Ошибка удаления");
    }
  };

  const disabledTime = () => {
    return {
      disabledHours: () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
          if (i < 8 || i > 20) {
            hours.push(i);
          }
        }
        return hours;
      },
      disabledMinutes: (hour: number) => {
        if (hour === 20) {
          return [30];
        }
        return [];
      },
    };
  };

  const columns = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Время",
      key: "time",
      render: (_: any, record: any) =>
        `${record.startTime} - ${record.endTime}`,
    },
    {
      title: "Занятие",
      dataIndex: "activityTitle",
      key: "activityTitle",
    },
    {
      title: "Преподаватель",
      dataIndex: "teacherName",
      key: "teacherName",
    },
    {
      title: "Учеников",
      key: "students",
      render: (_: any, record: any) =>
        `${record.enrolledCount || 0}/${record.maxStudents || 0}`,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: any = {
          planned: "blue",
          in_progress: "orange",
          completed: "green",
          cancelled: "red",
        };
        const labels: any = {
          planned: "Запланировано",
          in_progress: "В процессе",
          completed: "Завершено",
          cancelled: "Отменено",
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
      filters: [
        { text: "Запланировано", value: "planned" },
        { text: "В процессе", value: "in_progress" },
        { text: "Завершено", value: "completed" },
        { text: "Отменено", value: "cancelled" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Редактировать">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingSchedule(record);
                const activity = activities.find(
                  (a) => a.id === record.activityId,
                );
                setSelectedActivity(activity);
                form.setFieldsValue({
                  activityId: record.activityId,
                  teacherId: record.teacherId,
                  date: dayjs(record.date),
                  timeRange: [
                    dayjs(record.startTime, "HH:mm"),
                    dayjs(record.endTime, "HH:mm"),
                  ],
                  maxStudents: record.maxStudents,
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Удаление занятия"
            description="Вы уверены, что хотите удалить это занятие?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Tooltip title="Удалить">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const ACTIVITY_TYPES: Record<string, string> = {
    webinar: "Вебинар",
    masterclass: "Мастер-класс",
    individual: "Индивидуальное",
    group: "Групповое",
    trial: "Пробное",
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>Управление расписанием</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingSchedule(null);
            setSelectedActivity(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Добавить занятие
        </Button>
      </div>

      <Alert
        message="Информация о времени"
        description="Школа работает с 8:00 до 20:00. Занятия могут быть созданы только в этом интервале. Минимальная длительность - 30 минут, максимальная - 4 часа."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={schedule}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingSchedule ? "Редактировать занятие" : "Добавить занятие"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSchedule(null);
          setSelectedActivity(null);
          form.resetFields();
        }}
        footer={null}
        width={550}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="activityId"
            label="Занятие"
            rules={[{ required: true, message: "Выберите занятие" }]}
          >
            <Select
              placeholder="Выберите занятие"
              showSearch
              optionFilterProp="children"
              onChange={handleActivityChange}
            >
              {activities.map((activity) => (
                <Select.Option key={activity.id} value={activity.id}>
                  {activity.title} (
                  {ACTIVITY_TYPES[activity.type] || activity.type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="teacherId"
            label="Преподаватель"
            rules={[{ required: true, message: "Выберите преподавателя" }]}
          >
            <Select
              placeholder="Выберите преподавателя"
              showSearch
              optionFilterProp="children"
              disabled={!!selectedActivity?.teacherId}
            >
              {teachers.map((teacher) => (
                <Select.Option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Дата"
            rules={[{ validator: validateDate }]}
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
            name="timeRange"
            label="Время"
            rules={[{ validator: validateTimeRange }]}
          >
            <TimePicker.RangePicker
              format="HH:mm"
              minuteStep={30}
              style={{ width: "100%" }}
              disabledTime={disabledTime}
            />
          </Form.Item>

          <Form.Item
            name="maxStudents"
            label="Максимум учеников"
            initialValue={10}
          >
            <Select>
              <Select.Option value={1}>1 (Индивидуальное)</Select.Option>
              <Select.Option value={5}>5</Select.Option>
              <Select.Option value={10}>10</Select.Option>
              <Select.Option value={15}>15</Select.Option>
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={30}>30</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Отмена</Button>
              <Button type="primary" htmlType="submit">
                {editingSchedule ? "Сохранить" : "Добавить"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSchedule;
