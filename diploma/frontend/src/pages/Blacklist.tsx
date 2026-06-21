
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
  DatePicker,
  message,
  Popconfirm,
  Tooltip,
  Avatar,
  Select,
  Input as AntInput,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  StopOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { adminApi } from "../services/api";
import styles from "../css/admin.module.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Search } = AntInput;

interface BlacklistProps {
  user: any;
}

const Blacklist: React.FC<BlacklistProps> = ({ user }) => {
  const [blacklistedUsers, setBlacklistedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getBlacklist();
      setBlacklistedUsers(response.data);
    } catch (error) {
      console.error("Error fetching blacklist:", error);
      message.error("Ошибка загрузки черного списка");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBlacklist = async (values: any) => {
    try {
      await adminApi.addToBlacklist(
        selectedUser.id,
        values.reason,
        values.until ? values.until.format("YYYY-MM-DD") : undefined,
      );
      message.success("Пользователь добавлен в черный список");
      setModalVisible(false);
      form.resetFields();
      setSelectedUser(null);
      fetchBlacklist();
    } catch (error) {
      console.error("Error adding to blacklist:", error);
      message.error("Ошибка добавления в черный список");
    }
  };

  const handleRemoveFromBlacklist = async (id: number) => {
    try {
      await adminApi.removeFromBlacklist(id);
      message.success("Пользователь удален из черного списка");
      fetchBlacklist();
    } catch (error) {
      console.error("Error removing from blacklist:", error);
      message.error("Ошибка удаления из черного списка");
    }
  };

  const columns = [
    {
      title: "Пользователь",
      key: "user",
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.user?.avatar} icon={<UserOutlined />} />
          <div>
            <Text strong>{record.user?.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.user?.email}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a: any, b: any) =>
        (a.user?.name || "").localeCompare(b.user?.name || ""),
    },
    {
      title: "Причина блокировки",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Заблокирован до",
      dataIndex: "until",
      key: "until",
      render: (until: string) =>
        until ? dayjs(until).format("DD.MM.YYYY") : "Навсегда",
    },
    {
      title: "Дата блокировки",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) => (
        <Popconfirm
          title="Разблокировка пользователя"
          description="Вы уверены, что хотите разблокировать этого пользователя?"
          onConfirm={() => handleRemoveFromBlacklist(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Tooltip title="Разблокировать">
            <Button type="text" icon={<StopOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  const [users, setUsers] = useState<any[]>([]);
  const [usersModalVisible, setUsersModalVisible] = useState(false);
  const [userSearchText, setUserSearchText] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsers();
      const blockedIds = blacklistedUsers.map((b) => b.userId);
      setUsers(
        response.data.filter(
          (u: any) => !blockedIds.includes(u.id) && u.role !== "admin",
        ),
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSelectUser = (userRecord: any) => {
    setSelectedUser(userRecord);
    setUsersModalVisible(false);
    setModalVisible(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(userSearchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchText.toLowerCase()),
  );

  const userColumns = [
    {
      title: "Пользователь",
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
      title: "Роль",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "teacher" ? "blue" : "green"}>
          {role === "teacher" ? "Преподаватель" : "Ученик"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleSelectUser(record)}
        >
          Добавить
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>Черный список</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            fetchUsers();
            setUserSearchText("");
            setUsersModalVisible(true);
          }}
        >
          Добавить в черный список
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={blacklistedUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Выберите пользователя"
        open={usersModalVisible}
        onCancel={() => setUsersModalVisible(false)}
        footer={null}
        width={650}
      >
        <Search
          placeholder="Поиск по имени или email"
          allowClear
          style={{ marginBottom: 16 }}
          onSearch={setUserSearchText}
          onChange={(e) => setUserSearchText(e.target.value)}
        />
        <Table
          columns={userColumns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      <Modal
        title={`Блокировка пользователя: ${selectedUser?.name}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        footer={null}
        width={450}
      >
        <Form form={form} layout="vertical" onFinish={handleAddToBlacklist}>
          <Form.Item
            name="reason"
            label="Причина блокировки"
            rules={[{ required: true, message: "Укажите причину блокировки" }]}
          >
            <TextArea rows={3} placeholder="Укажите причину блокировки..." />
          </Form.Item>

          <Form.Item
            name="until"
            label="Блокировка до (опционально)"
            tooltip="Если не указать, блокировка будет бессрочной"
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD.MM.YYYY"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Отмена</Button>
              <Button type="primary" danger htmlType="submit">
                Заблокировать
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Blacklist;
