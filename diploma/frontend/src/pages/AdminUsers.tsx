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
} from "@ant-design/icons";
import { adminApi } from "../services/api";
import styles from "../css/admin.module.css";
import { useTranslation } from "react-i18next";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

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

const getFullAvatarUrl = (avatar: string) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `https://diploma-production-f729.up.railway.app${avatar}`;
};

const AdminUsers: React.FC<AdminUsersProps> = ({ }) => {
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const [users, setUsers] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
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
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error(t("adminUsers.messages.loadError"));
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
        message.success(t("adminUsers.messages.updateSuccess"));
      } else {
        await adminApi.createTeacher(values);
        message.success(t("adminUsers.messages.createSuccess"));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      message.error(t("adminUsers.messages.saveError"));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteUser(id);
      message.success(t("adminUsers.messages.deleteSuccess"));
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error(t("adminUsers.messages.deleteError"));
    }
  };

  const handleBlockUser = async (id: number, isBlocked: boolean) => {
    try {
      await adminApi.blockUser(id, isBlocked);
      message.success(
        isBlocked ? t("adminUsers.messages.blockSuccess") : t("adminUsers.messages.unblockSuccess"),
      );
      fetchUsers();
    } catch (error) {
      console.error("Error blocking user:", error);
      message.error(t("adminUsers.messages.blockError"));
    }
  };

  const handleTeacherRequest = async (requestId: number, status: string) => {
    try {
      await adminApi.processTeacherRequest(requestId, status);
      message.success(
        status === "approved"
          ? t("adminUsers.messages.requestApproved")
          : t("adminUsers.messages.requestRejected"),
      );
      fetchTeacherRequests();
      fetchUsers();
    } catch (error) {
      console.error("Error processing request:", error);
      message.error(t("adminUsers.messages.requestProcessError"));
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
      message.success(t("adminUsers.messages.grantAccessSuccess"));
      setAccessModalVisible(false);
      accessForm.resetFields();

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
      message.error(t("adminUsers.messages.grantAccessError"));
    }
  };

  const handleRevokeAccess = async (accessId: number) => {
    try {
      await adminApi.revokeTeacherAccess(accessId);
      message.success(t("adminUsers.messages.revokeAccessSuccess"));

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
      message.error(t("adminUsers.messages.revokeAccessError"));
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
      admin: t("adminUsers.roles.admin"),
      teacher: t("adminUsers.roles.teacher"),
      student: t("adminUsers.roles.student"),
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
      title: t("adminUsers.table.user"),
      key: "user",
      render: (_: any, record: any) => {
        const avatarUrl = record.avatar || record.avatarUrl || record.avatar_url;
        const fullAvatarUrl = getFullAvatarUrl(avatarUrl);
        
        return (
          <Space>
            <Avatar 
              src={fullAvatarUrl} 
              icon={!fullAvatarUrl && <UserOutlined />}
              size={40}
              style={{ flexShrink: 0 }}
              onError={() => false}
            />
            <div>
              <Text strong>{record.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.email}
              </Text>
            </div>
          </Space>
        );
      },
      sorter: (a: any, b: any) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: t("adminUsers.table.role"),
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{getRoleLabel(role)}</Tag>
      ),
      filters: [
        { text: t("adminUsers.roles.student"), value: "student" },
        { text: t("adminUsers.roles.teacher"), value: "teacher" },
        { text: t("adminUsers.roles.admin"), value: "admin" },
      ],
      onFilter: (value: any, record: any) => record.role === value,
    },
    {
      title: t("adminUsers.table.status"),
      dataIndex: "isBlocked",
      key: "isBlocked",
      render: (isBlocked: boolean) => (
        <Badge
          status={isBlocked ? "error" : "success"}
          text={isBlocked ? t("adminUsers.statuses.blocked") : t("adminUsers.statuses.active")}
        />
      ),
    },
    {
      title: t("adminUsers.table.registrationDate"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: t("adminUsers.table.actions"),
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title={t("adminUsers.table.view")}>
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
          <Tooltip title={t("adminUsers.table.edit")}>
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
          {record.role !== "admin" && (
            <>
              <Tooltip
                title={record.isBlocked ? t("adminUsers.table.unblock") : t("adminUsers.table.block")}
              >
                <Button
                  type="text"
                  icon={<BlockOutlined />}
                  onClick={() => handleBlockUser(record.id, !record.isBlocked)}
                  danger={!record.isBlocked}
                />
              </Tooltip>
              <Popconfirm
                title={t("adminUsers.messages.deleteConfirmTitle")}
                description={t("adminUsers.messages.deleteConfirm")}
                onConfirm={() => handleDelete(record.id)}
                okText={t("common.yes")}
                cancelText={t("common.no")}
              >
                <Tooltip title={t("adminUsers.table.delete")}>
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
      title: t("adminUsers.requestColumns.teacher"),
      key: "user",
      render: (_: any, record: any) => {
        const avatarUrl = record.avatar || record.avatarUrl || record.avatar_url;
        const fullAvatarUrl = getFullAvatarUrl(avatarUrl);
        
        return (
          <Space>
            <Avatar 
              src={fullAvatarUrl} 
              icon={!fullAvatarUrl && <UserOutlined />}
              onError={() => false}
            />
            <div>
              <Text strong>{record.name}</Text>
              <br />
              <Text type="secondary">{record.email}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: t("adminUsers.requestColumns.specialization"),
      dataIndex: "specialization",
      key: "specialization",
    },
    {
      title: t("adminUsers.requestColumns.experience"),
      dataIndex: "experience",
      key: "experience",
    },
    {
      title: t("adminUsers.requestColumns.status"),
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
            ? t("adminUsers.requestStatuses.pending")
            : status === "approved"
              ? t("adminUsers.requestStatuses.approved")
              : t("adminUsers.requestStatuses.rejected")}
        </Tag>
      ),
    },
    {
      title: t("adminUsers.requestColumns.actions"),
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
              {t("adminUsers.modals.approve")}
            </Button>
            <Button
              danger
              size="small"
              icon={<BlockOutlined />}
              onClick={() => handleTeacherRequest(record.id, "rejected")}
            >
              {t("adminUsers.modals.reject")}
            </Button>
          </Space>
        ),
    },
  ];

  const accessColumns = [
    {
      title: t("adminUsers.fields.category"),
      dataIndex: "category",
      key: "category",
      render: (category: string) => {
        const found = CATEGORIES.find((c) => c.value === category);
        return found ? found.label : category;
      },
    },
    {
      title: t("adminUsers.fields.googleDriveLink"),
      dataIndex: "googleDriveLink",
      key: "googleDriveLink",
      render: (link: string) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {t("adminUsers.table.openMaterials")}
        </a>
      ),
    },
    {
      title: t("adminUsers.table.grantedDate"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t("adminUsers.table.actions"),
      key: "actions",
      render: (_: any, record: any) => (
        <Popconfirm
          title={t("adminUsers.table.revokeAccess")}
          description={t("adminUsers.messages.deleteConfirm")}
          onConfirm={() => handleRevokeAccess(record.id)}
          okText={t("common.yes")}
          cancelText={t("common.no")}
        >
          <Tooltip title={t("adminUsers.table.revokeAccess")}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={getTitleLevel(3)}>{t("adminUsers.title")}</Title>
        <Space wrap>
          <Search
            placeholder={t("adminUsers.searchPlaceholder")}
            allowClear
            style={{ width: 250 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Button onClick={() => setTeacherRequestsVisible(true)}>
            {t("adminUsers.teacherRequestsButton")} (
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
            {t("adminUsers.addTeacherButton")}
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

      <Modal
        title={t("adminUsers.modals.viewTitle")}
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
            {t("adminUsers.modals.close")}
          </Button>
        }
        width={700}
        destroyOnClose
      >
        {selectedTeacher && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t("adminUsers.fields.avatar")}>
                <Avatar 
                  src={getFullAvatarUrl(selectedTeacher.avatar || selectedTeacher.avatarUrl || selectedTeacher.avatar_url)}
                  size={64}
                  icon={<UserOutlined />}
                  onError={() => false}
                />
              </Descriptions.Item>
              <Descriptions.Item label={t("adminUsers.fields.name")}>
                {selectedTeacher.name}
              </Descriptions.Item>
              <Descriptions.Item label={t("adminUsers.fields.email")}>
                {selectedTeacher.email}
              </Descriptions.Item>
              <Descriptions.Item label={t("adminUsers.fields.phone")}>
                {selectedTeacher.phone || t("common.notSpecified")}
              </Descriptions.Item>
              <Descriptions.Item label={t("adminUsers.table.role")}>
                {getRoleLabel(selectedTeacher.role)}
              </Descriptions.Item>
              <Descriptions.Item label={t("adminUsers.table.status")}>
                <Badge
                  status={selectedTeacher.isBlocked ? "error" : "success"}
                  text={
                    selectedTeacher.isBlocked
                      ? t("adminUsers.statuses.blocked")
                      : t("adminUsers.statuses.active")
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label={t("adminUsers.table.registrationDate")}>
                {new Date(selectedTeacher.createdAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>

            {selectedTeacher.role === "teacher" && (
              <>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Title level={5} style={{ margin: 0 }}>
                    {t("adminUsers.fields.googleDriveLink")}
                  </Title>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setAccessModalVisible(true);
                    }}
                  >
                    {t("adminUsers.table.grantAccess")}
                  </Button>
                </div>
                {selectedTeacher.accesses &&
                selectedTeacher.accesses.length > 0 ? (
                  <Table
                    columns={accessColumns}
                    dataSource={selectedTeacher.accesses}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    style={{ marginTop: 10 }}
                  />
                ) : (
                  <Text type="secondary" style={{ display: "block", marginTop: 10 }}>
                    {t("adminUsers.messages.noAccesses")}
                  </Text>
                )}
              </>
            )}
          </>
        )}
      </Modal>

      <Modal
        title={
          editingUser
            ? t("adminUsers.modals.editTitle")
            : t("adminUsers.modals.createTitle")
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
          <Form.Item
            name="name"
            label={t("adminUsers.fields.name")}
            rules={[{ required: true, message: t("adminUsers.validation.nameRequired") }]}
          >
            <Input placeholder={t("adminUsers.placeholders.name")} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t("adminUsers.fields.email")}
            rules={[
              { required: true, message: t("adminUsers.validation.emailRequired") },
              { type: "email", message: t("adminUsers.validation.emailInvalid") },
            ]}
          >
            <Input placeholder={t("adminUsers.placeholders.email")} />
          </Form.Item>
          <Form.Item
            name="phone"
            label={t("adminUsers.fields.phone")}
            rules={[
              {
                pattern: /^(\+375|80)?(29|33|44|25)\d{7}$/,
                message: t("adminUsers.validation.phoneInvalid"),
              },
            ]}
          >
            <Input placeholder={t("adminUsers.placeholders.phone")} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label={t("adminUsers.fields.password")}
              rules={[
                { required: true, message: t("adminUsers.validation.passwordRequired") },
                { min: 6, message: t("adminUsers.validation.passwordMin") },
              ]}
            >
              <Input.Password placeholder={t("adminUsers.placeholders.password")} />
            </Form.Item>
          )}
          <Form.Item name="specialization" label={t("adminUsers.fields.specialization")}>
            <Input placeholder={t("adminUsers.placeholders.specialization")} />
          </Form.Item>
          <Form.Item name="experience" label={t("adminUsers.fields.experience")}>
            <Input placeholder={t("adminUsers.placeholders.experience")} />
          </Form.Item>
          <Form.Item name="bio" label={t("adminUsers.fields.bio")}>
            <Input.TextArea rows={3} placeholder={t("adminUsers.placeholders.bio")} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? t("common.save") : t("common.create")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t("adminUsers.modals.grantAccessTitle", {
          name: selectedTeacher?.name || "",
        })}
        open={accessModalVisible}
        onCancel={() => {
          setAccessModalVisible(false);
          accessForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={accessForm} layout="vertical" onFinish={handleGrantAccess}>
          <Form.Item
            name="category"
            label={t("adminUsers.fields.category")}
            rules={[
              { required: true, message: t("adminUsers.validation.categoryRequired") },
            ]}
          >
            <Select
              placeholder={t("adminUsers.fields.category")}
              options={CATEGORIES}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="googleDriveLink"
            label={t("adminUsers.fields.googleDriveLink")}
            rules={[
              { required: true, message: t("adminUsers.validation.googleDriveLinkRequired") },
            ]}
          >
            <Input placeholder={t("adminUsers.placeholders.googleDriveLink")} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setAccessModalVisible(false);
                  accessForm.resetFields();
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {t("adminUsers.table.grantAccess")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t("adminUsers.modals.requestsTitle")}
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