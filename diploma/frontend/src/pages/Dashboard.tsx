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
  QuestionOutlined,
} from "@ant-design/icons";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Subjects from "./Subjects";
import ScheduleView from "./ScheduleView";
import api from "../services/api";
import LanguageSwitcher from "../components/LanguageSwitcher";
import styles from "../css/dashboard.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";
import { User, UserRole } from "@libs/shared";
import Test from "./Test";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { getTitleLevel } = useAdaptiveLevel();

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

  if (user?.role === UserRole.STUDENT) {
    menuItems.push({
      key: "test",
      icon: <QuestionOutlined />,
      label: <Link to="/dashboard/test">{t("dashboard.menu.test")}</Link>,
    });
  }

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
    <Layout className={styles.layout}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className={styles.sider}
        theme="light"
        breakpoint="md"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <div
          className={`${styles.logo} ${collapsed ? styles.collapsedLogo : ""}`}
        >
          <BookOutlined className={styles.logoIcon} />
          {!collapsed && (
            <Title level={getTitleLevel(4)} className={styles.logoText}>
              CodeZone
            </Title>
          )}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          className={styles.menu}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <Title level={getTitleLevel(4)} className={styles.headerTitle}>
            {t("dashboard.title")}
          </Title>

          <Space size="large" className={styles.userInfo}>
            <LanguageSwitcher />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space className={styles.userAvatar}>
                <Avatar className={styles.avatar} icon={<UserOutlined />} />
                <span className={styles.userName}>
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

        <Content className={styles.content}>
          <Routes>
            <Route path="/" element={<DashboardHome user={user} t={t} />} />
            <Route path="/subjects" element={<Subjects user={user} />} />
            <Route path="/schedule" element={<ScheduleView user={user} />} />
            <Route path="/students" element={<StudentsList t={t} />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const DashboardHome: React.FC<{ user: User; t: any }> = ({ user, t }) => {
  const { getTitleLevel } = useAdaptiveLevel();

  return (
    <div>
      <Title level={getTitleLevel(3)}>
        {t("dashboard.welcome", { name: user?.name })}
      </Title>
      <div className={styles.welcomeBlock}>
        <BookOutlined className={styles.welcomeIcon} />
        <Title level={getTitleLevel(4)} className={styles.dashboardTitle}>
          {user?.role === UserRole.TEACHER
            ? t("dashboard.teacherText")
            : t("dashboard.studentText")}
        </Title>
      </div>
    </div>
  );
};

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
    { title: t("dashboard.name"), dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: t("dashboard.registrationDate"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : t("dashboard.noData"),
    },
  ];

  return (
    <Table
      dataSource={students}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, responsive: true }}
      scroll={{ x: true }}
    />
  );
};

export default Dashboard;
