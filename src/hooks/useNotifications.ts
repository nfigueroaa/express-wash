'use client';

import { useEffect, useState, useCallback } from 'react';
import { Notification } from '@/lib/notifications';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let eventSource: EventSource | null = null;

    // Connect to SSE endpoint
    eventSource = new EventSource(`/api/admin/notifications?userId=${userId}`);

    eventSource.addEventListener('notification', (event: Event) => {
      const customEvent = event as MessageEvent;
      const notification = JSON.parse(customEvent.data) as Notification;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    eventSource.onerror = () => {
      eventSource?.close();
    };

    return () => {
      eventSource?.close();
    };
  }, [userId]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return { notifications, unreadCount, markAsRead };
}
