// pages/AdminActivities.tsx (обновленный - добавлено поле meetLink)
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

const ACTIVITY_TYPES = [
  { value: "webinar", label: "Вебинар", icon: <VideoCameraOutlined /> },
  { value: "masterclass", label: "Мастер-класс", icon: <TrophyOutlined /> },
  { value: "individual", label: "Индивидуальное", icon: <UserOutlined /> },
  { value: "group", label: "Групповое", icon: <TeamOutlined /> },
  { value: "trial", label: "Пробное", icon: <GiftOutlined /> },
];

const DURATION_OPTIONS = [
  { value: "30 мин", label: "30 минут" },
  { value: "45 мин", label: "45 минут (академический час)" },
  { value: "1 час", label: "1 час (астрономический час)" },
  { value: "1.5 часа", label: "1.5 часа" },
  { value: "2 часа", label: "2 часа" },
  { value: "2.5 часа", label: "2.5 часа" },
  { value: "3 часа", label: "3 часа" },
];

const AGE_RANGES = [
  { value: "8-12", label: "8-12 лет" },
  { value: "13-17", label: "13-17 лет" },
  { value: "18-25", label: "18-25 лет" },
  { value: "25-35", label: "25-35 лет" },
  { value: "35+", label: "35+ лет" },
  { value: "all", label: "Все возраста" },
];

const LEVELS = [
  { value: "beginner", label: "Начинающий" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced", label: "Продвинутый" },
  { value: "all", label: "Любой уровень" },
];

const AdminActivities: React.FC<AdminActivitiesProps> = ({ user }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<AvailableDate[]>([]);
  const [form] = Form.useForm();

  const watchType = Form.useWatch("type", form);

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
      message.error("Ошибка загрузки активностей");
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
          throw new Error("Добавьте хотя бы одну дату для занятия");
        }
        availableDates = selectedDates.filter(
          (d) => d.date && d.times.length > 0,
        );
        if (availableDates.length === 0) {
          throw new Error("Заполните даты и время для занятия");
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
        meetLink: values.meetLink || null, // Добавляем поле для ссылки
        order: activities.length + 1,
      };

      console.log("Submitting data:", JSON.stringify(submitData, null, 2));

      if (editingActivity) {
        await adminApi.updateActivity(editingActivity.id, submitData);
        message.success("Активность обновлена");
      } else {
        await adminApi.createActivity(submitData);
        message.success("Активность создана");
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
        "Ошибка сохранения активности";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await adminApi.deleteActivity(id);
      message.success("Активность удалена");
      fetchActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
      message.error("Ошибка удаления активности");
    }
  };

  const getActivityTypeTag = (type: string) => {
    const config: any = {
      webinar: { color: "blue", label: "Вебинар" },
      masterclass: { color: "gold", label: "Мастер-класс" },
      individual: { color: "green", label: "Индивидуальное" },
      group: { color: "purple", label: "Групповое" },
      trial: { color: "orange", label: "Пробное" },
    };
    return <Tag color={config[type]?.color}>{config[type]?.label}</Tag>;
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Название",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Тип",
      dataIndex: "type",
      key: "type",
      render: (type: string) => getActivityTypeTag(type),
    },
    {
      title: "Категории",
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
      title: "Цена",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (price === 0 ? "Бесплатно" : `${price} BYN`),
    },
    {
      title: "Преподаватель",
      dataIndex: "teacher",
      key: "teacher",
      render: (teacher: string) => teacher || "Не назначен",
    },
    {
      title: "Длительность",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Ссылка на конференцию",
      dataIndex: "meetLink",
      key: "meetLink",
      render: (link: string) => (
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <LinkOutlined /> Открыть
          </a>
        ) : (
          <Tag color="default">Не указана</Tag>
        )
      ),
    },
    {
      title: "Активна",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Да" : "Нет"}</Tag>
      ),
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
            title="Удаление активности"
            description="Вы уверены, что хотите удалить эту активность?"
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

  const showDatesBlock = ["webinar", "masterclass", "group"].includes(
    watchType,
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>Управление активностями</Title>
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
          Создать активность
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
          editingActivity ? "Редактировать активность" : "Создать активность"
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
            message="Ошибка"
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
                label="Название"
                rules={[{ required: true, message: "Введите название" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Тип занятия"
                rules={[{ required: true, message: "Выберите тип" }]}
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
            label="Категории"
            rules={[{ required: true, message: "Выберите категории" }]}
          >
            <Select mode="multiple" placeholder="Выберите категории">
              {CATEGORIES.map((cat) => (
                <Select.Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: "Введите описание" }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="teacherId"
                label="Преподаватель"
                rules={[{ required: true, message: "Выберите преподавателя" }]}
              >
                <Select
                  placeholder="Выберите преподавателя"
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
                label="Цена (BYN)"
                rules={[
                  { required: true, message: "Введите цену" },
                  {
                    type: "number",
                    min: 0,
                    message: "Цена не может быть отрицательной",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0 - бесплатно"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Длительность"
                rules={[{ required: true, message: "Выберите длительность" }]}
              >
                <Select placeholder="Выберите длительность">
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
                label="Возрастная группа"
                rules={[
                  { required: true, message: "Выберите возрастную группу" },
                ]}
              >
                <Select placeholder="Выберите возрастную группу">
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
                label="Уровень"
                rules={[{ required: true, message: "Выберите уровень" }]}
              >
                <Select placeholder="Выберите уровень">
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
                    label="Период"
                    rules={[{ required: true, message: "Выберите период" }]}
                  >
                    <Select>
                      <Select.Option value="6 месяцев">6 месяцев</Select.Option>
                      <Select.Option value="год">1 год</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="groupShift"
                    label="Смена"
                    rules={[{ required: true, message: "Выберите смену" }]}
                  >
                    <Select>
                      <Select.Option value="утренняя">Утренняя</Select.Option>
                      <Select.Option value="дневная">Дневная</Select.Option>
                      <Select.Option value="вечерняя">Вечерняя</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          {/* Поле для ссылки на конференцию */}
          <Form.Item
            name="meetLink"
            label="Ссылка на конференцию (опционально)"
            extra="Общая ссылка для всех занятий этой активности"
          >
            <Input
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              prefix={<LinkOutlined />}
              allowClear
            />
          </Form.Item>

          {showDatesBlock && (
            <div className={styles.datesBlock}>
              <div className={styles.datesHeader}>
                <span>
                  <CalendarOutlined /> Даты и время проведения
                </span>
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={handleAddDate}
                >
                  Добавить дату
                </Button>
              </div>

              {selectedDates.length === 0 && (
                <Alert
                  message="Добавьте даты для занятия"
                  description="Для этого типа занятия необходимо указать конкретные даты и время проведения"
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
                      placeholder="Выберите дату"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className={styles.timePicker}>
                    <Select
                      mode="multiple"
                      placeholder="Выберите время"
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
              message="Даты и время будут определяться автоматически"
              description={
                watchType === "individual"
                  ? "Пользователь выберет дни недели, а система проверит свободное время преподавателя с 8:00 до 20:00"
                  : "Пользователь выберет дату, а система проверит свободное время преподавателя с 8:00 до 20:00"
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item name="isActive" label="Активно" valuePropName="checked">
            <Switch checkedChildren="Да" unCheckedChildren="Нет" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Отмена</Button>
              <Button type="primary" htmlType="submit">
                {editingActivity ? "Сохранить" : "Создать"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminActivities;