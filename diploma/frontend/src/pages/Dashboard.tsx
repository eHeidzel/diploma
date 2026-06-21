
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
  FileTextOutlined,
  ClockCircleOutlined,
  BlockOutlined,
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
import Materials from "./Materials";
import BalanceModal from "../components/BalanceModal";
import styles from "../css/dashboard.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";
import { UserRole } from "@libs/shared";
import Test from "./Test";
import Learning from "./Learning";
import ScheduleView from "./ScheduleView";
import AdminActivities from "./AdminActivities";
import AdminUsers from "./AdminUsers";
import AdminSchedule from "./AdminSchedule";
import Blacklist from "./Blacklist";

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


const RoleRoute: React.FC<{
  children: React.ReactNode;
  user: any;
  allowedRoles?: UserRole[];
}> = ({ children, user, allowedRoles }) => {
  if (!allowedRoles) return <>{children}</>;

  const userRole = user?.role;
  const isGuest = user?.isGuest || userRole === "guest";

  
  if ((!userRole && !isGuest) || isGuest) {
    
    if (allowedRoles.includes(UserRole.GUEST)) {
      return <>{children}</>;
    }
    return <Navigate to="/dashboard/home" replace />;
  }

  
  if (!allowedRoles.includes(userRole)) {
    
    if (userRole === UserRole.ADMIN) {
      return <Navigate to="/dashboard/admin-activities" replace />;
    }
    if (userRole === UserRole.TEACHER) {
      return <Navigate to="/dashboard/schedule" replace />;
    }
    return <Navigate to="/dashboard/home" replace />;
  }

  return <>{children}</>;
};

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const { getTitleLevel } = useAdaptiveLevel();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isGuest = user?.isGuest || user?.role === "guest";
  const isStudent = user?.role === UserRole.STUDENT;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    
    if (isStudent && !isGuest && user?.id && user?.id !== "guest") {
      fetchBalance();
    }
  }, [isStudent, isGuest, user?.id]);

  const fetchBalance = async () => {
    try {
      const response = await profileApi.getBalance();
      setUserBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      
      if (!isGuest) {
        
      }
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
      label: <Link to="/dashboard/home">Главная</Link>,
    },
    {
      key: "learning",
      icon: <BookOutlined />,
      label: <Link to="/dashboard/learning">Обучение</Link>,
    },
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: <Link to="/dashboard/schedule">Расписание</Link>,
    },
    {
      key: "test",
      icon: <UserOutlined />,
      label: <Link to="/dashboard/test">Тест</Link>,
    },
  ];

  
  const teacherMenuItems = [
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: <Link to="/dashboard/schedule">Расписание</Link>,
    },
    {
      key: "students",
      icon: <TeamOutlined />,
      label: <Link to="/dashboard/students">Ученики</Link>,
    },
    {
      key: "materials",
      icon: <FileTextOutlined />,
      label: <Link to="/dashboard/materials">Учебные материалы</Link>,
    },
    {
      key: "workload",
      icon: <ClockCircleOutlined />,
      label: <Link to="/dashboard/workload">Нагрузка</Link>,
    },
  ];

  
  const adminMenuItems = [
    {
      key: "admin-activities",
      icon: <BookOutlined />,
      label: (
        <Link to="/dashboard/admin-activities">Управление активностями</Link>
      ),
    },
    {
      key: "admin-users",
      icon: <TeamOutlined />,
      label: <Link to="/dashboard/admin-users">Управление пользователями</Link>,
    },
    {
      key: "admin-schedule",
      icon: <CalendarOutlined />,
      label: <Link to="/dashboard/admin-schedule">Управление расписанием</Link>,
    },
    {
      key: "blacklist",
      icon: <BlockOutlined />,
      label: <Link to="/dashboard/blacklist">Черный список</Link>,
    },
  ];

  
  const guestMenuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard/home">Главная</Link>,
    },
    {
      key: "learning",
      icon: <BookOutlined />,
      label: <Link to="/dashboard/learning">Обучение</Link>,
    },
    {
      key: "test",
      icon: <UserOutlined />,
      label: <Link to="/dashboard/test">Тест</Link>,
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
      label: <Link to="/dashboard/profile">Профиль</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link to="/dashboard/settings">Настройки</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Выйти",
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
    if (!user) return "Гость";
    if (isTeacher) return "Преподаватель";
    if (isAdmin) return "Администратор";
    if (isGuest) return "Гость";
    return "Ученик";
  };

  
  const canSeeHome = () => {
    return isStudent || isGuest || !user;
  };

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
            {!isGuest && <NotificationsPopover userId={user?.id} />}
            {isStudent && !isGuest && user?.id && user?.id !== "guest" && (
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
                <Avatar src={user?.avatar} icon={<UserOutlined />} />
                <span className={styles.userName}>
                  {user?.name || "Гость"} ({getDisplayRole()})
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className={styles.content}>
          <Routes>
            {/* Редирект для корневого пути в зависимости от роли */}
            <Route path="/" element={<DashboardRedirect user={user} />} />
            <Route
              path="/dashboard"
              element={<DashboardRedirect user={user} />}
            />

            {/* Маршрут главной страницы - для учеников и гостей */}
            {canSeeHome() ? (
              <Route
                path="/home"
                element={<DashboardHome user={user} t={t} />}
              />
            ) : (
              <Route
                path="/home"
                element={<Navigate to="/dashboard/schedule" replace />}
              />
            )}

            {/* Общие маршруты */}
            <Route path="/learning" element={<Learning user={user} />} />
            <Route path="/test" element={<Test />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/settings" element={<Settings user={user} />} />

            {/* Расписание - только для учеников, преподавателей и администраторов */}
            <Route
              path="/schedule"
              element={
                !isGuest ? (
                  <ScheduleView user={user} />
                ) : (
                  <Navigate to="/dashboard/home" replace />
                )
              }
            />

            {/* Маршруты преподавателя */}
            <Route
              path="/students"
              element={
                isTeacher ? (
                  <MyStudents user={user} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />
            <Route
              path="/workload"
              element={
                isTeacher ? (
                  <Workload user={user} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />

            {/* Учебные материалы - доступны всем авторизованным */}
            <Route path="/materials" element={<Materials user={user} />} />

            {/* Админ-маршруты */}
            <Route
              path="/admin-activities"
              element={
                isAdmin ? (
                  <AdminActivities user={user} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />
            <Route
              path="/admin-users"
              element={
                isAdmin ? (
                  <AdminUsers user={user} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />
            <Route
              path="/admin-schedule"
              element={
                isAdmin ? (
                  <AdminSchedule user={user} />
                ) : (
                  <Navigate to="/dashboard/schedule" replace />
                )
              }
            />
            <Route
              path="/blacklist"
              element={
                isAdmin ? (
                  <Blacklist user={user} />
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
