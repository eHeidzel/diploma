// components/NotificationsPopover.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  Popover,
  List,
  Button,
  Space,
  Typography,
  Empty,
  Tag,
  message,
  Modal,
  Divider,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  MailOutlined,
  CalendarOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { notificationsApi, settingsApi } from "../services/api";
import { io, Socket } from "socket.io-client";
import styles from "../css/notifications.module.css";

const { Text, Paragraph } = Typography;

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "booking" | "reminder" | "message" | "system";
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationsPopoverProps {
  userId?: number;
}

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  userId,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  const fetchSettings = async () => {
    try {
      const response = await settingsApi.get();
      const enabled = response.data.notificationsEnabled !== false;
      setNotificationsEnabled(enabled);
      
      // Если уведомления отключены, обнуляем счетчик
      if (!enabled) {
        setUnreadCount(0);
      } else {
        // Если включены - загружаем количество
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    if (!userId || !notificationsEnabled) {
      // Если уведомления отключены - обнуляем счетчик
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, skipping WebSocket connection");
      return;
    }

    const socket = io("http://localhost:8080", {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("WebSocket connected for notifications");
    });

    socket.on("unread_count_update", (data: { count: number }) => {
      console.log("Unread count update:", data.count);
      // Обновляем счетчик только если уведомления включены
      if (notificationsEnabled) {
        setUnreadCount(data.count);
      }
    });

    socket.on("new_notification", (notification: Notification) => {
      console.log("New notification:", notification);
      // Добавляем уведомление только если они включены
      if (notificationsEnabled) {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId, notificationsEnabled]);

  useEffect(() => {
    if (open && notificationsEnabled) {
      fetchNotifications();
    }
  }, [open, notificationsEnabled]);

  useEffect(() => {
    if (userId && notificationsEnabled) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [userId, notificationsEnabled]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsApi.getAll();
      setNotifications(response.data);
      const unread = response.data.filter(
        (n: Notification) => !n.isRead,
      ).length;
      setUnreadCount(notificationsEnabled ? unread : 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!notificationsEnabled) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await notificationsApi.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (id: number) => {
    if (!notificationsEnabled) return;
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!notificationsEnabled) return;
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      message.success("Все уведомления отмечены как прочитанные");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    if (!notificationsEnabled) return;
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      const deletedNotif = notifications.find((n) => n.id === id);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      message.success("Уведомление удалено");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notificationsEnabled) return;
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
    setModalVisible(true);
    setOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <CalendarOutlined className={styles.iconBooking} />;
      case "reminder":
        return <BellOutlined className={styles.iconReminder} />;
      case "message":
        return <MessageOutlined className={styles.iconMessage} />;
      default:
        return <MailOutlined className={styles.iconSystem} />;
    }
  };

  const getTypeTag = (type: string) => {
    switch (type) {
      case "booking":
        return (
          <Tag color="blue" className={styles.typeTag}>
            Запись
          </Tag>
        );
      case "reminder":
        return (
          <Tag color="orange" className={styles.typeTag}>
            Напоминание
          </Tag>
        );
      case "message":
        return (
          <Tag color="purple" className={styles.typeTag}>
            Сообщение
          </Tag>
        );
      default:
        return (
          <Tag color="default" className={styles.typeTag}>
            Система
          </Tag>
        );
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Только что";
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    return created.toLocaleDateString();
  };

  const content = (
    <div className={styles.notificationsPopover}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <BellOutlined className={styles.headerIcon} />
          <Text strong className={styles.headerTitle}>
            Уведомления
          </Text>
          {notificationsEnabled && unreadCount > 0 && (
            <Badge count={unreadCount} className={styles.headerBadge} />
          )}
        </div>
        {notificationsEnabled && unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={markAllAsRead}
            className={styles.markAllBtn}
          >
            <CheckOutlined /> Все
          </Button>
        )}
      </div>

      {notificationsEnabled ? (
        <List
          className={styles.list}
          loading={loading}
          dataSource={notifications}
          locale={{
            emptyText: (
              <Empty
                description="Нет уведомлений"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className={styles.empty}
              />
            ),
          }}
          renderItem={(item) => (
            <List.Item
              className={`${styles.notificationItem} ${!item.isRead ? styles.unread : ""}`}
              onClick={() => handleNotificationClick(item)}
            >
              <div className={styles.notificationContent}>
                <div className={styles.notificationIcon}>
                  {getIcon(item.type)}
                </div>
                <div className={styles.notificationBody}>
                  <div className={styles.notificationHeader}>
                    <Text strong className={styles.notificationTitle}>
                      {item.title}
                    </Text>
                    {getTypeTag(item.type)}
                  </div>
                  <Text className={styles.notificationMessage}>
                    {item.message}
                  </Text>
                  <div className={styles.notificationFooter}>
                    <ClockCircleOutlined className={styles.timeIcon} />
                    <Text type="secondary" className={styles.notificationTime}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </div>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                />
              </div>
            </List.Item>
          )}
        />
      ) : (
        <div className={styles.notificationsDisabled}>
          <Empty
            description="Уведомления отключены"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
            Включите уведомления в настройках
          </Text>
        </div>
      )}
    </div>
  );

  // Если уведомления отключены - не показываем иконку с бейджем
  if (!userId || !notificationsEnabled) {
    return (
      <Popover
        content={content}
        trigger="click"
        open={open}
        onOpenChange={(visible) => {
          setOpen(visible);
          if (visible && notificationsEnabled) {
            fetchNotifications();
          }
        }}
        placement="bottomRight"
        overlayClassName={styles.popover}
        destroyTooltipOnHide
      >
        <Button
          type="text"
          icon={<BellOutlined />}
          className={styles.bellButton}
        />
      </Popover>
    );
  }

  return (
    <>
      <Popover
        content={content}
        trigger="click"
        open={open}
        onOpenChange={(visible) => {
          setOpen(visible);
          if (visible && notificationsEnabled) {
            fetchNotifications();
          }
        }}
        placement="bottomRight"
        overlayClassName={styles.popover}
        destroyTooltipOnHide
      >
        <Badge
          count={unreadCount}
          size="small"
          offset={[-5, 5]}
          className={styles.bellBadge}
        >
          <Button
            type="text"
            icon={<BellOutlined />}
            className={styles.bellButton}
          />
        </Badge>
      </Popover>

      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={450}
        centered
        className={styles.notificationModal}
        closeIcon={<CloseOutlined />}
      >
        {selectedNotification && (
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                {getIcon(selectedNotification.type)}
              </div>
              <div className={styles.modalHeaderRight}>
                <Text strong className={styles.modalTitle}>
                  {selectedNotification.title}
                </Text>
                {getTypeTag(selectedNotification.type)}
              </div>
            </div>
            <Divider className={styles.modalDivider} />
            <Paragraph className={styles.modalMessage}>
              {selectedNotification.message}
            </Paragraph>
            <div className={styles.modalFooter}>
              <ClockCircleOutlined className={styles.modalTimeIcon} />
              <Text type="secondary">
                {new Date(selectedNotification.createdAt).toLocaleString()}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default NotificationsPopover;