import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Space,
  Typography,
  Button,
  Dropdown,
} from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { profileApi } from "../services/api";
import LanguageSwitcher from "../components/LanguageSwitcher";
import NotificationsPopover from "../components/NotificationsPopover";
import DashboardHome from "../components/DashboardHome";
import Profile from "./Profile";
import Settings from "./Settings";
import MyStudents from "./MyStudents";
import Workload from "./Workload";
import BalanceModal from "../components/BalanceModal";
import styles from "../css/dashboard.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";
import Test from "./Test";
import Learning from "./Learning";
import ScheduleView from "./ScheduleView";
import AdminActivities from "./AdminActivities";
import AdminUsers from "./AdminUsers";
import AdminSchedule from "./AdminSchedule";
import { UserRole } from "../enums/UserRole.enums";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const DashboardRedirect: React.FC<{ user: any }> = ({ user }) => {
  const getDefaultPath = () => {
    if (user?.role === UserRole.ADMIN) {
      return "/dashboard/admin-activities";
    }
    if (user?.role === UserRole.TEACHER) {
      return "/dashboard/schedule";
    }
    if (user?.role === UserRole.STUDENT) {
      return "/dashboard/home";
    }
    return "/dashboard/home";
  };

  return <Navigate to={getDefaultPath()} replace />;
};

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const [collapsed, setCollapsed] = useState(false);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [currentUser, setCurrentUser] = useState(user);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();

  const isGuest = user?.isGuest || user?.role === "guest";
  const isStudent = user?.role === UserRole.STUDENT;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (isStudent && !isGuest && user?.id && user?.id !== "guest") {
      fetchBalance();
    }
  }, [isStudent, isGuest, user?.id]);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const fetchBalance = async () => {
    try {
      const response = await profileApi.getBalance();
      setUserBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleUserUpdate = (updatedUser: any) => {
    if (updatedUser) {
      const mergedUser = { ...currentUser, ...updatedUser };
      setCurrentUser(mergedUser);
      setAvatarKey(Date.now());
      localStorage.setItem("user", JSON.stringify(mergedUser));
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/dashboard/") return "dashboard";
    if (path.includes("/dashboard/home")) return "dashboard";
    if (path.includes("/dashboard/learning")) return "learning";
    if (path.includes("/dashboard/schedule")) return "schedule";
    if (path.includes("/dashboard/test")) return "test";
    if (path.includes("/dashboard/profile")) return "profile";
    if (path.includes("/dashboard/settings")) return "settings";
    if (path.includes("/dashboard/students")) return "students";
    if (path.includes("/dashboard/workload")) return "workload";
    if (path.includes("/dashboard/materials")) return "materials";
    if (path.includes("/dashboard/admin-activities")) return "admin-activities";
    if (path.includes("/dashboard/admin-users")) return "admin-users";
    if (path.includes("/dashboard/admin-schedule")) return "admin-schedule";
    if (path.includes("/dashboard/blacklist")) return "blacklist";
    return "dashboard";
  };

  const studentMenuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard/home">{t("dashboard.menu.main")}</Link>,
    },
    {
      key: "learning",
      icon: <BookOutlined />,
      label: <Link to="/dashboard/learning">{t("dashboard.menu.learning")}</Link>,
    },
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: <Link to="/dashboard/schedule">{t("dashboard.menu.schedule")}</Link>,
    },
    {
      key: "test",
      icon: <UserOutlined />,
      label: <Link to="/dashboard/test">{t("dashboard.menu.test")}</Link>,
    },
  ];

  const teacherMenuItems = [
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: <Link to="/dashboard/schedule">{t("dashboard.menu.schedule")}</Link>,
    },
    {
      key: "students",
      icon: <TeamOutlined />,
      label: <Link to="/dashboard/students">{t("dashboard.menu.students")}</Link>,
    },
    {
      key: "workload",
      icon: <ClockCircleOutlined />,
      label: <Link to="/dashboard/workload">{t("dashboard.menu.workload")}</Link>,
    },
  ];

  const adminMenuItems = [
    {
      key: "admin-activities",
      icon: <BookOutlined />,
      label: <Link to="/dashboard/admin-activities">{t("adminActivities.title")}</Link>,
    },
    {
      key: "admin-users",
      icon: <TeamOutlined />,
      label: <Link to="/dashboard/admin-users">{t("adminUsers.title")}</Link>,
    },
    {
      key: "admin-schedule",
      icon: <CalendarOutlined />,
      label: <Link to="/dashboard/admin-schedule">{t("adminSchedule.title")}</Link>,
    },
  ];

  const guestMenuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard/home">{t("dashboard.menu.main")}</Link>,
    },
    {
      key: "learning",
      icon: <BookOutlined />,
      label: <Link to="/dashboard/learning">{t("dashboard.menu.learning")}</Link>,
    },
    {
      key: "test",
      icon: <UserOutlined />,
      label: <Link to="/dashboard/test">{t("dashboard.menu.test")}</Link>,
    },
  ];

  let menuItems = studentMenuItems;
  if (isTeacher) {
    menuItems = teacherMenuItems;
  } else if (isAdmin) {
    menuItems = adminMenuItems;
  } else if (isGuest) {
    menuItems = guestMenuItems;
  }

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/dashboard/profile">{t("profile.title")}</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link to="/dashboard/settings">{t("settings.title")}</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("dashboard.menu.logout"),
      onClick: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isGuest");
        onLogout();
        navigate("/login");
      },
    },
  ];

  const getDisplayRole = () => {
    if (!currentUser) return t("common.guest");
    if (isTeacher) return t("profile.roles.teacher");
    if (isAdmin) return t("profile.roles.admin");
    if (isGuest) return t("common.guest");
    return t("profile.roles.student");
  };

  const canSeeHome = () => {
    return isStudent || isGuest || !currentUser;
  };

  const avatarUrl = currentUser?.avatar
    ? currentUser.avatar.startsWith("http")
      ? currentUser.avatar
      : `https://codezone1.vercel.app${currentUser.avatar}?t=${avatarKey}`
    : null;

  return (
    <Layout className={styles.layout}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className={styles.sider}
        theme="light"
        width={250}
        collapsedWidth={80}
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
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          className={styles.menu}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <Title level={getTitleLevel(4)} className={styles.headerTitle}>
            CodeZone
          </Title>

          <Space size="large" className={styles.userInfo}>
            <LanguageSwitcher />
            {!isGuest && <NotificationsPopover userId={currentUser?.id} />}
            {isStudent && !isGuest && currentUser?.id && currentUser?.id !== "guest" && (
              <Button
                type="text"
                onClick={() => setBalanceModalVisible(true)}
                className={styles.balanceButton}
              >
                <DollarOutlined /> {userBalance} BYN
              </Button>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className={styles.userAvatar}>
                <Avatar src={avatarUrl} icon={<UserOutlined />} key={avatarKey} />
                <span className={styles.userName}>
                  {currentUser?.name || t("common.guest")} ({getDisplayRole()})
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className={styles.content}>
          <Routes>
            <Route path="/" element={<DashboardRedirect user={currentUser} />} />
            <Route
              path="/dashboard"
              element={<DashboardRedirect user={currentUser} />}
            />

            {canSeeHome() ? (
              <Route
                path="/home"
                element={<DashboardHome user={currentUser} />}
              />
            ) : (
              <Route
                path="/home"
                element={<Navigate to="/dashboard/schedule" replace />}
              />
            )}

            <Route path="/learning" element={<Learning user={currentUser} />} />
            <Route path="/test" element={<Test />} />
            <Route
              path="/profile"
              element={
                <Profile
                  user={currentUser}
                  onUserUpdate={handleUserUpdate}
                />
              }
            />
            <Route path="/settings" element={<Settings user={currentUser} />} />

            <Route
              path="/schedule"
              element={
                !isGuest ? (
                  <ScheduleView user={currentUser} />
                ) : (
                  <Navigate to="/dashboard/home" replace />
                )
              }
            />

            <Route
              path="/students"
              element={
                isTeacher ? (
                  <MyStudents user={currentUser} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />
            <Route
              path="/workload"
              element={
                isTeacher ? (
                  <Workload user={currentUser} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />

            <Route
              path="/admin-activities"
              element={
                isAdmin ? (
                  <AdminActivities user={currentUser} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />
            <Route
              path="/admin-users"
              element={
                isAdmin ? (
                  <AdminUsers user={currentUser} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />
            <Route
              path="/admin-schedule"
              element={
                isAdmin ? (
                  <AdminSchedule user={currentUser} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />
          </Routes>
        </Content>
      </Layout>

      <BalanceModal
        visible={balanceModalVisible}
        onCancel={() => setBalanceModalVisible(false)}
        onSuccess={fetchBalance}
      />
    </Layout>
  );
};

export default Dashboard;