"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { NotificationBanner } from "./NotificationBanner";

type NotificationType = "success" | "error" | "info" | "warning";

type Notification = {
  id: number;
  type: NotificationType;
  message: string;
};

type NotificationContextType = {
  notify: (type: NotificationType, message: string) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

let idCounter = 0;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((type: NotificationType, message: string) => {
    const id = ++idCounter;

    setNotifications((prev) => [...prev, { id, type, message }]);

    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <div className="fixed top-4 right-4 z-50 space-y-3 w-[90%] max-w-sm">
        {notifications.map((n) => (
          <NotificationBanner key={n.id} type={n.type} message={n.message} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }
  return ctx;
}
