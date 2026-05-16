import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Space,
  Typography,
  Table,
  message,
  Dropdown,
} from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Subjects from "./Subjects";
import ScheduleView from "./ScheduleView";
import api from "../services/api";
import { UserRole } from "@libs/shared/enums/user-role.enums";
import LanguageSwitcher from "../components/LanguageSwitcher";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">{t("dashboard.menu.main")}</Link>,
    },
    {
      key: "subjects",
      icon: <BookOutlined />,
      label: (
        <Link to="/dashboard/subjects">{t("dashboard.menu.subjects")}</Link>
      ),
    },
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: (
        <Link to="/dashboard/schedule">{t("dashboard.menu.schedule")}</Link>
      ),
    },
  ];

  if (user?.role === UserRole.TEACHER) {
    menuItems.push({
      key: "students",
      icon: <TeamOutlined />,
      label: (
        <Link to="/dashboard/students">{t("dashboard.menu.students")}</Link>
      ),
    });
  }

  const userMenu = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: t("dashboard.menu.logout"),
        onClick: () => {
          onLogout();
          navigate("/login");
        },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: "white", boxShadow: "2px 0 8px rgba(0,0,0,0.05)" }}
        theme="light"
      >
        <div
          style={{
            padding: 24,
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <BookOutlined style={{ fontSize: 32, color: "#52c41a" }} />
          {!collapsed && (
            <Title
              level={4}
              style={{ marginTop: 8, marginBottom: 0, color: "#52c41a" }}
            >
              CodeZone
            </Title>
          )}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          style={{ borderRight: "none", marginTop: 16 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "white",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
            {t("dashboard.title")}
          </Title>

          <Space size="large">
            <LanguageSwitcher></LanguageSwitcher>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  style={{ backgroundColor: "#52c41a" }}
                  icon={<UserOutlined />}
                />
                <span style={{ color: "#1a1a1a" }}>
                  {user?.name} (
                  {user?.role === UserRole.TEACHER
                    ? t("dashboard.roles.teacher")
                    : t("dashboard.roles.student")}
                  )
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "white",
            borderRadius: 16,
            minHeight: 280,
            overflow: "auto",
          }}
        >
          <Routes>
            <Route path="/" element={<DashboardHome user={user} t={t} />} />
            <Route path="/subjects" element={<Subjects user={user} />} />
            <Route path="/schedule" element={<ScheduleView user={user} />} />
            <Route path="/students" element={<StudentsList t={t} />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const DashboardHome: React.FC<{ user: any; t: any }> = ({ user, t }) => (
  <div>
    <Title level={3}>{t("dashboard.welcome", { name: user?.name })}</Title>
    <div
      style={{
        marginTop: 32,
        padding: 48,
        background: "linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)",
        borderRadius: 16,
        textAlign: "center",
      }}
    >
      <BookOutlined style={{ fontSize: 64, color: "#52c41a" }} />
      <Title level={4} style={{ marginTop: 16 }}>
        {user?.role === UserRole.TEACHER
          ? t("dashboard.teacherText")
          : t("dashboard.studentText")}
      </Title>
    </div>
  </div>
);

const StudentsList: React.FC<{ t: any }> = ({ t }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setStudents(
        response.data.filter((u: any) => u.role === UserRole.STUDENT),
      );
    } catch (error) {
      message.error(t("dashboard.errors.loadStudents"));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Имя", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Дата регистрации",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "Нет данных",
    },
  ];

  return (
    <Table
      dataSource={students}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default Dashboard;
