// hooks/useWebSocket.ts
import { useEffect, useState } from "react";
import io from "socket.io-client";

// Определяем тип Socket самостоятельно
type SocketType = ReturnType<typeof io>;

export const useWebSocket = (userId: number | null) => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [lastNotification, setLastNotification] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("token");
    const newSocket = io("https://diploma-production-f729.up.railway.app", {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected");
    });

    newSocket.on("unread_count_update", (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    newSocket.on("new_notification", (notification: any) => {
      setLastNotification(notification);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  return { socket, unreadCount, lastNotification };
};