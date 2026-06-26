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
import { adminApi } from "../services/api";
import styles from "../css/admin.module.css";
import { useTranslation } from "react-i18next";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

const { Title } = Typography;

interface AdminScheduleProps {
  user: any;
}

const AdminSchedule: React.FC<AdminScheduleProps> = ({ }) => {
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [form] = Form.useForm();

  const TIME_SLOTS = [];
  for (let hour = 8; hour <= 19; hour++) {
    TIME_SLOTS.push(dayjs().hour(hour).minute(0).second(0));
    TIME_SLOTS.push(dayjs().hour(hour).minute(30).second(0));
  }
  TIME_SLOTS.push(dayjs().hour(20).minute(0).second(0));

  const ACTIVITY_TYPES: Record<string, string> = {
    webinar: t("adminActivities.types.webinar"),
    masterclass: t("adminActivities.types.masterclass"),
    individual: t("adminActivities.types.individual"),
    group: t("adminActivities.types.group"),
    trial: t("adminActivities.types.trial"),
  };

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
      message.error(t("adminSchedule.messages.loadError"));
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
      return Promise.reject(new Error(t("adminSchedule.validation.timeRequired")));
    }

    const startHour = value[0].hour();
    const endHour = value[1].hour();
    const startMinute = value[0].minute();
    const endMinute = value[1].minute();

    if (startHour < 8 || (startHour === 20 && startMinute > 0) || startHour > 20) {
      return Promise.reject(new Error(t("adminSchedule.validation.timeWorkingHours")));
    }

    if (endHour < 8 || (endHour === 20 && endMinute > 0) || endHour > 20) {
      return Promise.reject(new Error(t("adminSchedule.validation.timeWorkingHours")));
    }

    if (value[1].isBefore(value[0])) {
      return Promise.reject(new Error(t("adminSchedule.validation.timeEndAfterStart")));
    }

    const diffMinutes = value[1].diff(value[0], "minute");
    if (diffMinutes < 30) {
      return Promise.reject(new Error(t("adminSchedule.validation.timeMinDuration")));
    }

    if (diffMinutes > 240) {
      return Promise.reject(new Error(t("adminSchedule.validation.timeMaxDuration")));
    }

    return Promise.resolve();
  };

  const validateDate = (_: any, value: dayjs.Dayjs) => {
    if (!value) {
      return Promise.reject(new Error(t("adminSchedule.validation.dateRequired")));
    }

    if (value.isBefore(dayjs(), "day")) {
      return Promise.reject(new Error(t("adminSchedule.validation.datePast")));
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
        message.success(t("adminSchedule.messages.updateSuccess"));
      } else {
        await adminApi.createSchedule(scheduleData);
        message.success(t("adminSchedule.messages.createSuccess"));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingSchedule(null);
      setSelectedActivity(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || t("adminSchedule.messages.saveError"));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteSchedule(id);
      message.success(t("adminSchedule.messages.deleteSuccess"));
      fetchData();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      message.error(t("adminSchedule.messages.deleteError"));
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
      title: t("adminSchedule.table.date"),
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: t("adminSchedule.table.time"),
      key: "time",
      render: (_: any, record: any) =>
        `${record.startTime} - ${record.endTime}`,
    },
    {
      title: t("adminSchedule.table.students"),
      key: "students",
      render: (_: any, record: any) =>
        `${record.enrolledCount || 0}/${record.maxStudents || 0}`,
    },
    {
      title: t("adminSchedule.table.status"),
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
          planned: t("adminSchedule.statuses.planned"),
          in_progress: t("adminSchedule.statuses.in_progress"),
          completed: t("adminSchedule.statuses.completed"),
          cancelled: t("adminSchedule.statuses.cancelled"),
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
      filters: [
        { text: t("adminSchedule.statuses.planned"), value: "planned" },
        { text: t("adminSchedule.statuses.in_progress"), value: "in_progress" },
        { text: t("adminSchedule.statuses.completed"), value: "completed" },
        { text: t("adminSchedule.statuses.cancelled"), value: "cancelled" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: t("adminSchedule.table.actions"),
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title={t("common.edit")}>
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
            title={t("adminSchedule.messages.deleteConfirmTitle")}
            description={t("adminSchedule.messages.deleteConfirm")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.yes")}
            cancelText={t("common.no")}
          >
            <Tooltip title={t("common.delete")}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={getTitleLevel(3)}>{t("adminSchedule.title")}</Title>
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
          {t("adminSchedule.addButton")}
        </Button>
      </div>

      <Alert
        description={t("adminSchedule.infoMessage")}
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
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} записей`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={
          editingSchedule
            ? t("adminSchedule.modals.editTitle")
            : t("adminSchedule.modals.createTitle")
        }
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
            label={t("adminSchedule.fields.activity")}
            rules={[
              { required: true, message: t("adminSchedule.validation.activityRequired") },
            ]}
          >
            <Select
              placeholder={t("adminSchedule.placeholders.activity")}
              showSearch
              optionFilterProp="children"
              onChange={handleActivityChange}
            >
              {activities.map((activity) => (
                <Select.Option key={activity.id} value={activity.id}>
                  {activity.title} ({ACTIVITY_TYPES[activity.type] || activity.type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="teacherId"
            label={t("adminSchedule.fields.teacher")}
            rules={[
              { required: true, message: t("adminSchedule.validation.teacherRequired") },
            ]}
          >
            <Select
              placeholder={t("adminSchedule.placeholders.teacher")}
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
            label={t("adminSchedule.fields.date")}
            rules={[{ validator: validateDate }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD.MM.YYYY"
              placeholder={t("adminSchedule.placeholders.date")}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label={t("adminSchedule.fields.time")}
            rules={[{ validator: validateTimeRange }]}
          >
            <TimePicker.RangePicker
              format="HH:mm"
              minuteStep={30}
              style={{ width: "100%" }}
              placeholder={[
                t("adminSchedule.placeholders.time"),
                t("adminSchedule.placeholders.time"),
              ]}
              disabledTime={disabledTime}
            />
          </Form.Item>

          <Form.Item
            name="maxStudents"
            label={t("adminSchedule.fields.maxStudents")}
            initialValue={10}
          >
            <Select>
              <Select.Option value={1}>
                {t("adminSchedule.maxStudentsOptions.1")}
              </Select.Option>
              <Select.Option value={5}>
                {t("adminSchedule.maxStudentsOptions.5")}
              </Select.Option>
              <Select.Option value={10}>
                {t("adminSchedule.maxStudentsOptions.10")}
              </Select.Option>
              <Select.Option value={15}>
                {t("adminSchedule.maxStudentsOptions.15")}
              </Select.Option>
              <Select.Option value={20}>
                {t("adminSchedule.maxStudentsOptions.20")}
              </Select.Option>
              <Select.Option value={30}>
                {t("adminSchedule.maxStudentsOptions.30")}
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSchedule ? t("common.save") : t("common.add")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSchedule;