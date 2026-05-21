import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Select,
  TimePicker,
  message,
  Table,
  Space,
  Tag,
  Typography,
  Spin,
  Empty,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import styles from "../css/scheduleView.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

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
  const { getTitleLevel } = useAdaptiveLevel();
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    await Promise.all([fetchSchedule(), fetchSubjects(), fetchTeachers()]);
    setInitialLoading(false);
  };

  const fetchSchedule = async () => {
    try {
      const response = await api.get("/schedule");
      setSchedule(response.data);
    } catch (error) {
      message.error(t("schedule.loadingError"));
      return [];
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      setSubjects(response.data);
    } catch (error) {
      message.error(t("schedule.subjectsError"));
      return [];
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/users/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return [];
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
        room: values.room || "",
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
      await fetchSchedule();
    } catch (error: any) {
      message.error(error.response?.data?.message || t("schedule.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    Modal.confirm({
      title: t("schedule.deleteConfirmTitle"),
      content: t("schedule.deleteConfirmContent"),
      okText: t("schedule.deleteButton"),
      cancelText: t("schedule.cancelButton"),
      onOk: async () => {
        try {
          await api.delete(`/schedule/${id}`);
          message.success(t("schedule.deleteSuccess"));
          await fetchSchedule();
        } catch (error) {
          message.error(t("schedule.deleteError"));
        }
      },
    });
  };

  const handleEditSchedule = (record: Schedule) => {
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
      render: (_: any, record: Schedule) => (
        <span className={styles.timeCell}>
          {record.startTime} - {record.endTime}
        </span>
      ),
    },
    {
      title: t("schedule.subjectColumn"),
      key: "subject",
      render: (_: any, record: Schedule) => (
        <Tag color={record.subject?.color} className={styles.subjectTag}>
          {record.subject?.name}
        </Tag>
      ),
    },
    {
      title: t("schedule.teacherColumn"),
      key: "teacher",
      render: (_: any, record: Schedule) => (
        <span className={styles.teacherName}>{record.teacher?.name}</span>
      ),
    },
    {
      title: t("schedule.roomColumn"),
      dataIndex: "room",
      key: "room",
    },
  ];

  const isTeacher = user?.role === "teacher";

  if (isTeacher) {
    columns.push({
      title: t("schedule.actionsColumn"),
      key: "actions",
      render: (_: any, record: Schedule) => (
        <Space size="small" className={styles.actionsSpace}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSchedule(record)}
            className={styles.editButton}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSchedule(record.id)}
            className={styles.deleteButton}
          />
        </Space>
      ),
    });
  }

  if (initialLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip={t("schedule.loading")} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={getTitleLevel(3)} className={styles.title}>
          {t("schedule.title")}
        </Title>
        {isTeacher && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSchedule(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            className={styles.addButton}
          >
            {t("schedule.addButton")}
          </Button>
        )}
      </div>

      <Table
        dataSource={schedule}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 10,
          responsive: true,
          showTotal: (total) => t("schedule.totalItems", { total }),
        }}
        scroll={{ x: true }}
        bordered={false}
        className={styles.scheduleTable}
        locale={{
          emptyText: <Empty description={t("schedule.noData")} />,
        }}
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
        width="95%"
        className={styles.modalForm}
      >
        <Form form={form} onFinish={handleCreateSchedule} layout="vertical">
          <Form.Item
            name="subjectId"
            label={t("schedule.subjectLabel")}
            rules={[{ required: true, message: t("schedule.subjectRequired") }]}
          >
            <Select
              placeholder={t("schedule.subjectLabel")}
              showSearch
              className={styles.selectField}
              notFoundContent={t("schedule.noData")}
            >
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
            <Select
              placeholder={t("schedule.teacherLabel")}
              showSearch
              className={styles.selectField}
            >
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
            <Select
              placeholder={t("schedule.dayLabel")}
              className={styles.selectField}
            >
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
            <TimePicker.RangePicker
              format="HH:mm"
              minuteStep={15}
              className={styles.timePicker}
            />
          </Form.Item>

          {/* <Form.Item name="room" label={t("schedule.roomLabel")}>
            <Input
              placeholder={t("schedule.roomPlaceholder")}
              className={styles.inputField}
            />
          </Form.Item> */}

          <Form.Item className={styles.modalFooter}>
            <Space className={styles.modalButtons}>
              <Button onClick={() => setIsModalOpen(false)}>
                {t("schedule.cancelButton")}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={styles.submitButton}
              >
                {editingSchedule
                  ? t("schedule.saveButton")
                  : t("schedule.createButton")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleView;
