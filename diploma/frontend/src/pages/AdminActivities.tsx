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
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Tooltip,
  Switch,
  Row,
  Col,
  Avatar,
  Alert,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  GiftOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { adminApi } from "../services/api";
import styles from "../css/admin.module.css";
import { useTranslation } from "react-i18next";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

const { Title } = Typography;
const { TextArea } = Input;

interface AdminActivitiesProps {
  user: any;
}

interface AvailableDate {
  date: string;
  times: string[];
}

const CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Fullstack" },
  { value: "mobile", label: "Mobile" },
  { value: "devops", label: "DevOps" },
  { value: "data_science", label: "Data Science" },
  { value: "qa", label: "QA" },
  { value: "pm", label: "Project Manager" },
  { value: "ux_ui", label: "UX/UI Design" },
  { value: "security", label: "Security" },
];

const AdminActivities: React.FC<AdminActivitiesProps> = ({ user }) => {
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const [activities, setActivities] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<AvailableDate[]>([]);
  const [form] = Form.useForm();

  const watchType = Form.useWatch("type", form);

  const ACTIVITY_TYPES = [
    { value: "webinar", label: t("adminActivities.types.webinar"), icon: <VideoCameraOutlined /> },
    { value: "masterclass", label: t("adminActivities.types.masterclass"), icon: <TrophyOutlined /> },
    { value: "individual", label: t("adminActivities.types.individual"), icon: <UserOutlined /> },
    { value: "group", label: t("adminActivities.types.group"), icon: <TeamOutlined /> },
    { value: "trial", label: t("adminActivities.types.trial"), icon: <GiftOutlined /> },
  ];

  const DURATION_OPTIONS = [
    { value: "30 мин", label: t("adminActivities.durationOptions.30 мин") },
    { value: "45 мин", label: t("adminActivities.durationOptions.45 мин") },
    { value: "1 час", label: t("adminActivities.durationOptions.1 час") },
    { value: "1.5 часа", label: t("adminActivities.durationOptions.1.5 часа") },
    { value: "2 часа", label: t("adminActivities.durationOptions.2 часа") },
    { value: "2.5 часа", label: t("adminActivities.durationOptions.2.5 часа") },
    { value: "3 часа", label: t("adminActivities.durationOptions.3 часа") },
  ];

  const AGE_RANGES = [
    { value: "8-12", label: t("adminActivities.ageRanges.8-12") },
    { value: "13-17", label: t("adminActivities.ageRanges.13-17") },
    { value: "18-25", label: t("adminActivities.ageRanges.18-25") },
    { value: "25-35", label: t("adminActivities.ageRanges.25-35") },
    { value: "35+", label: t("adminActivities.ageRanges.35+") },
    { value: "all", label: t("adminActivities.ageRanges.all") },
  ];

  const LEVELS = [
    { value: "beginner", label: t("adminActivities.levels.beginner") },
    { value: "intermediate", label: t("adminActivities.levels.intermediate") },
    { value: "advanced", label: t("adminActivities.levels.advanced") },
    { value: "all", label: t("adminActivities.levels.all") },
  ];

  useEffect(() => {
    fetchActivities();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (watchType) {
      setSelectedDates([]);
    }
  }, [watchType]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
      message.error(t("adminActivities.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await adminApi.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const getHourType = (duration: string): string | null => {
    if (duration === "45 мин") return "academic";
    if (duration === "1 час") return "astronomical";
    return null;
  };

  const handleAddDate = (): void => {
    setSelectedDates([...selectedDates, { date: "", times: [] }]);
  };

  const handleRemoveDate = (index: number): void => {
    setSelectedDates(selectedDates.filter((_, i) => i !== index));
  };

  const handleDateChange = (index: number, date: string): void => {
    const updated = [...selectedDates];
    updated[index].date = date;
    setSelectedDates(updated);
  };

  const handleTimeChange = (index: number, times: string[]): void => {
    const updated = [...selectedDates];
    updated[index].times = times;
    setSelectedDates(updated);
  };

  const handleSubmit = async (values: any): Promise<void> => {
    setError(null);
    try {
      const selectedTeacher = teachers.find((t) => t.id === values.teacherId);
      const targetAudience = {
        ageRange: values.ageRange || "Не указано",
        level: values.level || "Любой",
      };
      const hourType = getHourType(values.duration);

      let availableDates: AvailableDate[] = [];
      if (["webinar", "masterclass", "group"].includes(values.type)) {
        if (selectedDates.length === 0) {
          throw new Error(t("adminActivities.messages.noDates"));
        }
        availableDates = selectedDates.filter(
          (d) => d.date && d.times.length > 0,
        );
        if (availableDates.length === 0) {
          throw new Error(t("adminActivities.messages.addDate"));
        }
      }

      const submitData = {
        title: values.title,
        type: values.type,
        categories: values.categories || [],
        description: values.description || "",
        teacher: selectedTeacher?.name || "Не назначен",
        teacherId: values.teacherId,
        teacherAvatar: selectedTeacher?.avatar || null,
        price: values.price || 0,
        duration: values.duration,
        hourType: hourType,
        isActive: values.isActive !== undefined ? values.isActive : true,
        targetAudience: targetAudience,
        availableAgeGroups: [values.ageRange],
        availableDates: availableDates,
        availableTimes: [],
        availableSlots: [],
        groupPeriod:
          values.type === "group" ? values.groupPeriod || "6 месяцев" : null,
        groupShift:
          values.type === "group" ? values.groupShift || "утренняя" : null,
        learningPlan: values.learningPlan || [],
        meetLink: values.meetLink || null,
        order: activities.length + 1,
      };

      if (editingActivity) {
        await adminApi.updateActivity(editingActivity.id, submitData);
        message.success(t("adminActivities.messages.updateSuccess"));
      } else {
        await adminApi.createActivity(submitData);
        message.success(t("adminActivities.messages.createSuccess"));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingActivity(null);
      setSelectedDates([]);
      fetchActivities();
    } catch (error: any) {
      console.error("Error saving activity:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        t("adminActivities.messages.saveError");
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await adminApi.deleteActivity(id);
      message.success(t("adminActivities.messages.deleteSuccess"));
      fetchActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
      message.error(t("adminActivities.messages.deleteError"));
    }
  };

  const getActivityTypeTag = (type: string) => {
    const config: any = {
      webinar: { color: "blue", label: t("adminActivities.types.webinar") },
      masterclass: { color: "gold", label: t("adminActivities.types.masterclass") },
      individual: { color: "green", label: t("adminActivities.types.individual") },
      group: { color: "purple", label: t("adminActivities.types.group") },
      trial: { color: "orange", label: t("adminActivities.types.trial") },
    };
    return <Tag color={config[type]?.color}>{config[type]?.label}</Tag>;
  };

  const columns = [
    {
      title: t("adminActivities.table.id"),
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: t("adminActivities.table.title"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("adminActivities.table.type"),
      dataIndex: "type",
      key: "type",
      render: (type: string) => getActivityTypeTag(type),
    },
    {
      title: t("adminActivities.table.categories"),
      dataIndex: "categories",
      key: "categories",
      render: (categories: string[]) => (
        <Space wrap>
          {categories?.map((cat) => {
            const category = CATEGORIES.find((c) => c.value === cat);
            return (
              <Tag key={cat} color="blue">
                {category?.label || cat}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: t("adminActivities.table.price"),
      dataIndex: "price",
      key: "price",
      render: (price: number) =>
        price === 0 ? t("adminActivities.table.free") : `${price} BYN`,
    },
    {
      title: t("adminActivities.table.teacher"),
      dataIndex: "teacher",
      key: "teacher",
      render: (teacher: string) => teacher || t("adminActivities.table.notAssigned"),
    },
    {
      title: t("adminActivities.table.duration"),
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: t("adminActivities.table.meetLink"),
      dataIndex: "meetLink",
      key: "meetLink",
      render: (link: string) =>
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <LinkOutlined /> {t("adminActivities.table.openLink")}
          </a>
        ) : (
          <Tag color="default">{t("adminActivities.table.notSpecified")}</Tag>
        ),
    },
    {
      title: t("adminActivities.table.isActive"),
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? t("adminActivities.table.active") : t("adminActivities.table.inactive")}
        </Tag>
      ),
    },
    {
      title: t("adminActivities.table.actions"),
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title={t("adminActivities.editButton")}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingActivity(record);
                setError(null);
                setSelectedDates(record.availableDates || []);
                form.setFieldsValue({
                  ...record,
                  teacherId: record.teacherId,
                  ageRange: record.targetAudience?.ageRange || "all",
                  level: record.targetAudience?.level || "all",
                  groupPeriod: record.groupPeriod || "6 месяцев",
                  groupShift: record.groupShift || "утренняя",
                  meetLink: record.meetLink || null,
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title={t("adminActivities.messages.deleteConfirmTitle")}
            description={t("adminActivities.messages.deleteConfirm")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.yes")}
            cancelText={t("common.no")}
          >
            <Tooltip title={t("adminActivities.deleteButton")}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const showDatesBlock = ["webinar", "masterclass", "group"].includes(
    watchType,
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={getTitleLevel(3)}>{t("adminActivities.title")}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingActivity(null);
            setError(null);
            setSelectedDates([]);
            form.resetFields();
            form.setFieldsValue({
              isActive: true,
              price: 0,
              ageRange: "all",
              level: "all",
              groupPeriod: "6 месяцев",
              groupShift: "утренняя",
              meetLink: null,
            });
            setModalVisible(true);
          }}
        >
          {t("adminActivities.createButton")}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        title={
          editingActivity
            ? t("adminActivities.editTitle")
            : t("adminActivities.createTitle")
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingActivity(null);
          setError(null);
          setSelectedDates([]);
          form.resetFields();
        }}
        footer={null}
        width={800}
        className={styles.activityModal}
        destroyOnClose
      >
        {error && (
          <Alert
            message={t("common.error")}
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label={t("adminActivities.fields.title")}
                rules={[
                  { required: true, message: t("adminActivities.validation.titleRequired") },
                ]}
              >
                <Input placeholder={t("adminActivities.placeholders.title")} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label={t("adminActivities.fields.type")}
                rules={[
                  { required: true, message: t("adminActivities.validation.typeRequired") },
                ]}
              >
                <Select>
                  {ACTIVITY_TYPES.map((type) => (
                    <Select.Option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="categories"
            label={t("adminActivities.fields.categories")}
            rules={[
              { required: true, message: t("adminActivities.validation.categoriesRequired") },
            ]}
          >
            <Select mode="multiple" placeholder={t("adminActivities.fields.categories")}>
              {CATEGORIES.map((cat) => (
                <Select.Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={t("adminActivities.fields.description")}
            rules={[
              { required: true, message: t("adminActivities.validation.descriptionRequired") },
            ]}
          >
            <TextArea rows={3} placeholder={t("adminActivities.placeholders.description")} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="teacherId"
                label={t("adminActivities.fields.teacher")}
                rules={[
                  { required: true, message: t("adminActivities.validation.teacherRequired") },
                ]}
              >
                <Select
                  placeholder={t("adminActivities.fields.teacher")}
                  showSearch
                  optionFilterProp="children"
                >
                  {teachers.map((teacher) => (
                    <Select.Option key={teacher.id} value={teacher.id}>
                      <Space>
                        <Avatar
                          size="small"
                          src={teacher.avatar}
                          icon={<UserOutlined />}
                        />
                        {teacher.name}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label={t("adminActivities.fields.price")}
                rules={[
                  { required: true, message: t("adminActivities.validation.priceRequired") },
                  {
                    type: "number",
                    min: 0,
                    message: t("adminActivities.validation.priceMin"),
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder={t("adminActivities.placeholders.price")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="duration"
                label={t("adminActivities.fields.duration")}
                rules={[
                  { required: true, message: t("adminActivities.validation.durationRequired") },
                ]}
              >
                <Select placeholder={t("adminActivities.fields.duration")}>
                  {DURATION_OPTIONS.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ageRange"
                label={t("adminActivities.fields.ageRange")}
                rules={[
                  { required: true, message: t("adminActivities.validation.ageRangeRequired") },
                ]}
              >
                <Select placeholder={t("adminActivities.fields.ageRange")}>
                  {AGE_RANGES.map((range) => (
                    <Select.Option key={range.value} value={range.value}>
                      {range.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="level"
                label={t("adminActivities.fields.level")}
                rules={[
                  { required: true, message: t("adminActivities.validation.levelRequired") },
                ]}
              >
                <Select placeholder={t("adminActivities.fields.level")}>
                  {LEVELS.map((level) => (
                    <Select.Option key={level.value} value={level.value}>
                      {level.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {watchType === "group" && (
              <>
                <Col span={6}>
                  <Form.Item
                    name="groupPeriod"
                    label={t("adminActivities.fields.groupPeriod")}
                    rules={[
                      { required: true, message: t("adminActivities.validation.groupPeriodRequired") },
                    ]}
                  >
                    <Select>
                      <Select.Option value="6 месяцев">
                        {t("adminActivities.groupPeriods.6 месяцев")}
                      </Select.Option>
                      <Select.Option value="год">
                        {t("adminActivities.groupPeriods.год")}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="groupShift"
                    label={t("adminActivities.fields.groupShift")}
                    rules={[
                      { required: true, message: t("adminActivities.validation.groupShiftRequired") },
                    ]}
                  >
                    <Select>
                      <Select.Option value="утренняя">
                        {t("adminActivities.groupShifts.утренняя")}
                      </Select.Option>
                      <Select.Option value="дневная">
                        {t("adminActivities.groupShifts.дневная")}
                      </Select.Option>
                      <Select.Option value="вечерняя">
                        {t("adminActivities.groupShifts.вечерняя")}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Form.Item
            name="meetLink"
            label={t("adminActivities.fields.meetLink")}
            extra={t("adminActivities.fields.meetLinkExtra")}
          >
            <Input
              placeholder={t("adminActivities.fields.meetLinkPlaceholder")}
              prefix={<LinkOutlined />}
              allowClear
            />
          </Form.Item>

          {showDatesBlock && (
            <div className={styles.datesBlock}>
              <div className={styles.datesHeader}>
                <span>
                  <CalendarOutlined /> {t("adminActivities.messages.selectDate")}
                </span>
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={handleAddDate}
                >
                  {t("adminActivities.messages.addDateButton")}
                </Button>
              </div>

              {selectedDates.length === 0 && (
                <Alert
                  message={t("adminActivities.messages.noDates")}
                  description={t("adminActivities.messages.addDate")}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              {selectedDates.map((item, index) => (
                <div key={index} className={styles.dateRow}>
                  <div className={styles.datePicker}>
                    <DatePicker
                      value={item.date ? dayjs(item.date) : null}
                      onChange={(date: Dayjs | null) =>
                        handleDateChange(
                          index,
                          date?.format("YYYY-MM-DD") || "",
                        )
                      }
                      format="DD.MM.YYYY"
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                      placeholder={t("adminActivities.messages.selectDate")}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className={styles.timePicker}>
                    <Select
                      mode="multiple"
                      placeholder={t("adminActivities.messages.selectTime")}
                      value={item.times}
                      onChange={(values: string[]) =>
                        handleTimeChange(index, values)
                      }
                      style={{ width: "100%" }}
                      options={[
                        "09:00",
                        "09:30",
                        "10:00",
                        "10:30",
                        "11:00",
                        "11:30",
                        "12:00",
                        "12:30",
                        "13:00",
                        "13:30",
                        "14:00",
                        "14:30",
                        "15:00",
                        "15:30",
                        "16:00",
                        "16:30",
                        "17:00",
                        "17:30",
                        "18:00",
                        "18:30",
                        "19:00",
                        "19:30",
                      ].map((time) => ({ value: time, label: time }))}
                    />
                  </div>
                  <Button
                    danger
                    type="text"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleRemoveDate(index)}
                  />
                </div>
              ))}
            </div>
          )}

          {["individual", "trial"].includes(watchType) && (
            <Alert
              message={t("adminActivities.messages.selectDate")}
              description={
                watchType === "individual"
                  ? t("adminActivities.messages.dateInfoIndividual")
                  : t("adminActivities.messages.dateInfoTrial")
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="isActive"
            label={t("adminActivities.fields.isActive")}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={t("common.yes")}
              unCheckedChildren={t("common.no")}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {editingActivity ? t("common.save") : t("common.create")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminActivities;