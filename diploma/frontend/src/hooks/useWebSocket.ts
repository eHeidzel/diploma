
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useWebSocket = (userId: number | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [lastNotification, setLastNotification] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("token");
    const newSocket = io("http://localhost:8080", {
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
