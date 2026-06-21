
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
  message,
  Popconfirm,
  Tooltip,
  Avatar,
  Badge,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  BlockOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { adminApi } from "../services/api";
import styles from "../css/admin.module.css";

const { Title, Text } = Typography;
const { Search } = Input;

interface AdminUsersProps {
  user: any;
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

const AdminUsers: React.FC<AdminUsersProps> = ({ user }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherAccesses, setTeacherAccesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [teacherRequestsVisible, setTeacherRequestsVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [accessForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchTeacherRequests();
    fetchTeacherAccesses();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherRequests = async () => {
    try {
      const response = await adminApi.getTeacherRequests();
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teacher requests:", error);
    }
  };

  const fetchTeacherAccesses = async () => {
    try {
      const response = await adminApi.getTeacherAccesses();
      setTeacherAccesses(response.data);
    } catch (error) {
      console.error("Error fetching teacher accesses:", error);
    }
  };

  const handleViewTeacher = async (record: any) => {
    setSelectedTeacher(record);
    if (record.role === "teacher") {
      try {
        
        const response = await adminApi.getTeacherAccesses();
        const teacherAccesses = response.data.filter(
          (access: any) => access.teacherId === record.id,
        );
        setSelectedTeacher({
          ...record,
          accesses: teacherAccesses,
        });
      } catch (error) {
        console.error("Error fetching teacher accesses:", error);
        setSelectedTeacher({
          ...record,
          accesses: [],
        });
      }
    }
    setViewModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, values);
        message.success("Пользователь обновлен");
      } else {
        await adminApi.createTeacher(values);
        message.success("Преподаватель создан");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Ошибка сохранения пользователя");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteUser(id);
      message.success("Пользователь удален");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Ошибка удаления пользователя");
    }
  };

  const handleBlockUser = async (id: number, isBlocked: boolean) => {
    try {
      await adminApi.blockUser(id, isBlocked);
      message.success(
        isBlocked ? "Пользователь заблокирован" : "Пользователь разблокирован",
      );
      fetchUsers();
    } catch (error) {
      console.error("Error blocking user:", error);
      message.error("Ошибка изменения статуса");
    }
  };

  const handleTeacherRequest = async (requestId: number, status: string) => {
    try {
      await adminApi.processTeacherRequest(requestId, status);
      message.success(
        `Заявка ${status === "approved" ? "одобрена" : "отклонена"}`,
      );
      fetchTeacherRequests();
      fetchUsers();
    } catch (error) {
      console.error("Error processing request:", error);
      message.error("Ошибка обработки заявки");
    }
  };

  const handleGrantAccess = async (values: any) => {
    try {
      const accessData = {
        teacherId: selectedTeacher?.id,
        category: values.category,
        googleDriveLink: values.googleDriveLink,
      };

      await adminApi.grantTeacherAccess(accessData);
      message.success("Доступ успешно выдан");
      setAccessModalVisible(false);
      accessForm.resetFields();
      fetchTeacherAccesses();

      
      if (selectedTeacher) {
        const response = await adminApi.getTeacherAccesses();
        const teacherAccesses = response.data.filter(
          (access: any) => access.teacherId === selectedTeacher.id,
        );
        setSelectedTeacher({
          ...selectedTeacher,
          accesses: teacherAccesses,
        });
      }
    } catch (error) {
      console.error("Error granting access:", error);
      message.error("Ошибка выдачи доступа");
    }
  };

  const handleRevokeAccess = async (accessId: number) => {
    try {
      await adminApi.revokeTeacherAccess(accessId);
      message.success("Доступ отозван");
      fetchTeacherAccesses();

      
      if (selectedTeacher) {
        const response = await adminApi.getTeacherAccesses();
        const teacherAccesses = response.data.filter(
          (access: any) => access.teacherId === selectedTeacher.id,
        );
        setSelectedTeacher({
          ...selectedTeacher,
          accesses: teacherAccesses,
        });
      }
    } catch (error) {
      console.error("Error revoking access:", error);
      message.error("Ошибка отзыва доступа");
    }
  };

  const getRoleColor = (role: string) => {
    const colors: any = {
      admin: "red",
      teacher: "blue",
      student: "green",
    };
    return colors[role] || "default";
  };

  const getRoleLabel = (role: string) => {
    const labels: any = {
      admin: "Администратор",
      teacher: "Преподаватель",
      student: "Ученик",
    };
    return labels[role] || role;
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: "Пользователь",
      key: "user",
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a: any, b: any) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{getRoleLabel(role)}</Tag>
      ),
      filters: [
        { text: "Ученик", value: "student" },
        { text: "Преподаватель", value: "teacher" },
        { text: "Администратор", value: "admin" },
      ],
      onFilter: (value: any, record: any) => record.role === value,
    },
    {
      title: "Статус",
      dataIndex: "isBlocked",
      key: "isBlocked",
      render: (isBlocked: boolean) => (
        <Badge
          status={isBlocked ? "error" : "success"}
          text={isBlocked ? "Заблокирован" : "Активен"}
        />
      ),
    },
    {
      title: "Дата регистрации",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Просмотр">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                if (record.role === "teacher") {
                  handleViewTeacher(record);
                } else {
                  setSelectedTeacher(record);
                  setViewModalVisible(true);
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingUser(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {record.role === "teacher" && (
            <Tooltip title="Выдать доступ к материалам">
              <Button
                type="text"
                icon={<FolderOpenOutlined />}
                onClick={() => {
                  setSelectedTeacher(record);
                  setAccessModalVisible(true);
                }}
              />
            </Tooltip>
          )}
          {record.role !== "admin" && (
            <>
              <Tooltip
                title={record.isBlocked ? "Разблокировать" : "Заблокировать"}
              >
                <Button
                  type="text"
                  icon={<BlockOutlined />}
                  onClick={() => handleBlockUser(record.id, !record.isBlocked)}
                  danger={!record.isBlocked}
                />
              </Tooltip>
              <Popconfirm
                title="Удаление пользователя"
                description="Вы уверены, что хотите удалить этого пользователя?"
                onConfirm={() => handleDelete(record.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Tooltip title="Удалить">
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const requestColumns = [
    {
      title: "Преподаватель",
      key: "user",
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Специализация",
      dataIndex: "specialization",
      key: "specialization",
    },
    {
      title: "Опыт",
      dataIndex: "experience",
      key: "experience",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "pending"
              ? "orange"
              : status === "approved"
                ? "green"
                : "red"
          }
        >
          {status === "pending"
            ? "На рассмотрении"
            : status === "approved"
              ? "Одобрена"
              : "Отклонена"}
        </Tag>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) =>
        record.status === "pending" && (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleTeacherRequest(record.id, "approved")}
            >
              Одобрить
            </Button>
            <Button
              danger
              size="small"
              icon={<BlockOutlined />}
              onClick={() => handleTeacherRequest(record.id, "rejected")}
            >
              Отклонить
            </Button>
          </Space>
        ),
    },
  ];

  
  const accessColumns = [
    {
      title: "Категория",
      dataIndex: "category",
      key: "category",
      render: (category: string) => {
        const found = CATEGORIES.find((c) => c.value === category);
        return found ? found.label : category;
      },
    },
    {
      title: "Ссылка на материалы",
      dataIndex: "googleDriveLink",
      key: "googleDriveLink",
      render: (link: string) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          Открыть
        </a>
      ),
    },
    {
      title: "Дата выдачи",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) => (
        <Popconfirm
          title="Отозвать доступ"
          description="Вы уверены, что хотите отозвать этот доступ?"
          onConfirm={() => handleRevokeAccess(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Tooltip title="Отозвать доступ">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>Управление пользователями</Title>
        <Space wrap>
          <Search
            placeholder="Поиск по имени или email"
            allowClear
            style={{ width: 250 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Button onClick={() => setTeacherRequestsVisible(true)}>
            Заявки преподавателей (
            {teachers.filter((t) => t.status === "pending").length})
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Добавить преподавателя
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Модальное окно просмотра */}
      <Modal
        title="Просмотр пользователя"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedTeacher(null);
        }}
        footer={
          <Button
            onClick={() => {
              setViewModalVisible(false);
              setSelectedTeacher(null);
            }}
          >
            Закрыть
          </Button>
        }
        width={700}
        destroyOnClose
      >
        {selectedTeacher && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Имя">
                {selectedTeacher.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedTeacher.email}
              </Descriptions.Item>
              <Descriptions.Item label="Телефон">
                {selectedTeacher.phone || "Не указан"}
              </Descriptions.Item>
              <Descriptions.Item label="Роль">
                {getRoleLabel(selectedTeacher.role)}
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Badge
                  status={selectedTeacher.isBlocked ? "error" : "success"}
                  text={selectedTeacher.isBlocked ? "Заблокирован" : "Активен"}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Дата регистрации">
                {new Date(selectedTeacher.createdAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>

            {selectedTeacher.role === "teacher" && (
              <>
                <Title level={5} style={{ marginTop: 20 }}>
                  Доступ к материалам
                </Title>
                {selectedTeacher.accesses &&
                selectedTeacher.accesses.length > 0 ? (
                  <Table
                    columns={accessColumns}
                    dataSource={selectedTeacher.accesses}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Text type="secondary">Нет выданных доступов</Text>
                )}
              </>
            )}
          </>
        )}
      </Modal>

      {/* Модальное окно создания/редактирования */}
      <Modal
        title={
          editingUser ? "Редактировать пользователя" : "Создать преподавателя"
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Имя" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Телефон">
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="specialization" label="Специализация">
            <Input />
          </Form.Item>
          <Form.Item name="experience" label="Опыт">
            <Input placeholder="например: 5 лет" />
          </Form.Item>
          <Form.Item name="bio" label="О себе">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Отмена</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? "Сохранить" : "Создать"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно выдачи доступа (только для преподавателей) */}
      <Modal
        title={`Выдача доступа к материалам для преподавателя: ${selectedTeacher?.name}`}
        open={accessModalVisible}
        onCancel={() => {
          setAccessModalVisible(false);
          accessForm.resetFields();
          setSelectedTeacher(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={accessForm} layout="vertical" onFinish={handleGrantAccess}>
          <Form.Item
            name="category"
            label="Категория материалов"
            rules={[{ required: true, message: "Выберите категорию" }]}
          >
            <Select
              placeholder="Выберите категорию"
              options={CATEGORIES}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="googleDriveLink"
            label="Ссылка на Google Диск с материалами"
            rules={[{ required: true, message: "Введите ссылку" }]}
          >
            <Input placeholder="https://drive.google.com/..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setAccessModalVisible(false);
                  accessForm.resetFields();
                  setSelectedTeacher(null);
                }}
              >
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Выдать доступ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно заявок преподавателей */}
      <Modal
        title="Заявки преподавателей"
        open={teacherRequestsVisible}
        onCancel={() => setTeacherRequestsVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Table
          columns={requestColumns}
          dataSource={teachers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </div>
  );
};

export default AdminUsers;
