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
import { useTranslation } from "react-i18next";

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
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const ScheduleView: React.FC<SubjectsProps> = ({ user }) => {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();

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
      message.error(t("schedule.loadingError"));
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      setSubjects(response.data);
    } catch (error) {
      message.error(t("schedule.subjectsError"));
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
        message.success(t("schedule.updateSuccess"));
      } else {
        await api.post("/schedule", scheduleData);
        message.success(t("schedule.createSuccess"));
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingSchedule(null);
      fetchSchedule();
    } catch (error) {
      message.error(t("schedule.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      await api.delete(`/schedule/${id}`);
      message.success(t("schedule.deleteSuccess"));
      fetchSchedule();
    } catch (error) {
      message.error(t("schedule.deleteError"));
    }
  };

  const columns = [
    {
      title: t("schedule.dayColumn"),
      key: "day",
      render: (_: any, record: Schedule) =>
        t(`schedule.daysOfWeek.${daysOfWeek[record.dayOfWeek]}`),
    },
    {
      title: t("schedule.timeColumn"),
      key: "time",
      render: (_: any, record: Schedule) =>
        `${record.startTime} - ${record.endTime}`,
    },
    {
      title: t("schedule.subjectColumn"),
      key: "subject",
      render: (_: any, record: Schedule) => (
        <Tag color={record.subject?.color || "#52c41a"}>
          {record.subject?.name}
        </Tag>
      ),
    },
    {
      title: t("schedule.teacherColumn"),
      key: "teacher",
      render: (_: any, record: Schedule) => record.teacher?.name,
    },
    { title: t("schedule.roomColumn"), dataIndex: "room", key: "room" },
  ];

  const isTeacher = user?.role === "teacher";

  if (isTeacher) {
    columns.push({
      title: t("schedule.actionsColumn"),
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
        <Title level={3}>{t("schedule.title")}</Title>
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
            {t("schedule.addButton")}
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
        title={
          editingSchedule ? t("schedule.editTitle") : t("schedule.createTitle")
        }
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
            label={t("schedule.subjectLabel")}
            rules={[{ required: true, message: t("schedule.subjectRequired") }]}
          >
            <Select placeholder={t("schedule.subjectLabel")}>
              {subjects.map((subject) => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="teacherId"
            label={t("schedule.teacherLabel")}
            rules={[{ required: true, message: t("schedule.teacherRequired") }]}
          >
            <Select placeholder={t("schedule.teacherLabel")}>
              {teachers.map((teacher) => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="dayOfWeek"
            label={t("schedule.dayLabel")}
            rules={[{ required: true, message: t("schedule.dayRequired") }]}
          >
            <Select placeholder={t("schedule.dayLabel")}>
              {daysOfWeek.map((day, index) => (
                <Option key={index} value={index}>
                  {t(`schedule.daysOfWeek.${day}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="timeRange"
            label={t("schedule.timeLabel")}
            rules={[{ required: true, message: t("schedule.timeRequired") }]}
          >
            <TimePicker.RangePicker format="HH:mm" minuteStep={15} />
          </Form.Item>
          <Form.Item name="room" label={t("schedule.roomLabel")}>
            <Input placeholder={t("schedule.roomPlaceholder")} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ backgroundColor: "#52c41a" }}
              >
                {editingSchedule
                  ? t("schedule.saveButton")
                  : t("schedule.createButton")}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                {t("schedule.cancelButton")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleView;
