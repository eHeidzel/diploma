import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  TimePicker,
  message,
  Table,
  Space,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../services/api";

const { Title } = Typography;
const { Option } = Select;

interface Schedule {
  id: number;
  subjectId: number;
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  subject: { name: string; color: string };
  teacher: { name: string };
}

interface SubjectsProps {
  user?: any;
}

const daysOfWeek = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

const ScheduleView: React.FC<SubjectsProps> = ({ user }) => {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSchedule();
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get("/schedule");
      setSchedule(response.data);
    } catch (error) {
      message.error("Ошибка загрузки расписания");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      setSubjects(response.data);
    } catch (error) {
      message.error("Ошибка загрузки предметов");
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/users/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleCreateSchedule = async (values: any) => {
    setLoading(true);
    try {
      const scheduleData = {
        subjectId: values.subjectId,
        teacherId: values.teacherId,
        dayOfWeek: values.dayOfWeek,
        startTime: values.timeRange[0].format("HH:mm"),
        endTime: values.timeRange[1].format("HH:mm"),
        room: values.room,
      };

      if (editingSchedule) {
        await api.put(`/schedule/${editingSchedule.id}`, scheduleData);
        message.success("Занятие обновлено");
      } else {
        await api.post("/schedule", scheduleData);
        message.success("Занятие добавлено");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingSchedule(null);
      fetchSchedule();
    } catch (error) {
      message.error("Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      await api.delete(`/schedule/${id}`);
      message.success("Занятие удалено");
      fetchSchedule();
    } catch (error) {
      message.error("Ошибка удаления");
    }
  };

  const columns = [
    {
      title: "День",
      key: "day",
      render: (_: any, record: Schedule) => daysOfWeek[record.dayOfWeek],
    },
    {
      title: "Время",
      key: "time",
      render: (_: any, record: Schedule) =>
        `${record.startTime} - ${record.endTime}`,
    },
    {
      title: "Предмет",
      key: "subject",
      render: (_: any, record: Schedule) => (
        <Tag color={record.subject?.color || "#52c41a"}>
          {record.subject?.name}
        </Tag>
      ),
    },
    {
      title: "Преподаватель",
      key: "teacher",
      render: (_: any, record: Schedule) => record.teacher?.name,
    },
    { title: "Аудитория", dataIndex: "room", key: "room" },
  ];

  const isTeacher = user?.role === "teacher";

  if (isTeacher) {
    columns.push({
      title: "Действия",
      key: "actions",
      render: (_: any, record: Schedule) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingSchedule(record);
              form.setFieldsValue({
                subjectId: record.subjectId,
                teacherId: record.teacherId,
                dayOfWeek: record.dayOfWeek,
                room: record.room,
                timeRange: [
                  dayjs(record.startTime, "HH:mm"),
                  dayjs(record.endTime, "HH:mm"),
                ],
              });
              setIsModalOpen(true);
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSchedule(record.id)}
          />
        </Space>
      ),
    });
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={3}>Расписание занятий</Title>
        {isTeacher && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSchedule(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            style={{ backgroundColor: "#52c41a" }}
          >
            Добавить занятие
          </Button>
        )}
      </div>

      <Table
        dataSource={schedule}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSchedule ? "Редактировать занятие" : "Добавить занятие"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleCreateSchedule} layout="vertical">
          <Form.Item
            name="subjectId"
            label="Предмет"
            rules={[{ required: true, message: "Выберите предмет" }]}
          >
            <Select placeholder="Выберите предмет">
              {subjects.map((subject) => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="teacherId"
            label="Преподаватель"
            rules={[{ required: true, message: "Выберите преподавателя" }]}
          >
            <Select placeholder="Выберите преподавателя">
              {teachers.map((teacher) => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="dayOfWeek"
            label="День недели"
            rules={[{ required: true, message: "Выберите день" }]}
          >
            <Select placeholder="Выберите день">
              {daysOfWeek.map((day, index) => (
                <Option key={index} value={index}>
                  {day}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="Время"
            rules={[{ required: true, message: "Выберите время" }]}
          >
            <TimePicker.RangePicker format="HH:mm" minuteStep={15} />
          </Form.Item>
          <Form.Item name="room" label="Аудитория">
            <Input placeholder="Например: 101" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ backgroundColor: "#52c41a" }}
              >
                {editingSchedule ? "Сохранить" : "Добавить"}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleView;
