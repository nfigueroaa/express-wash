export interface Notification {
  id: string;
  type: 'new_order' | 'order_status' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

export interface NotificationEvent {
  type: 'new_order' | 'order_status' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

// In-memory queue for notifications (in production, use Redis or similar)
const notificationQueues = new Map<string, Notification[]>();
const notificationSubscribers = new Map<
  string,
  Set<(notification: Notification) => void>
>();

export function createNotification(
  userId: string,
  event: NotificationEvent
): Notification {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: event.type,
    title: event.title,
    message: event.message,
    timestamp: new Date(),
    read: false,
    data: event.data,
  };

  // Store notification
  if (!notificationQueues.has(userId)) {
    notificationQueues.set(userId, []);
  }
  notificationQueues.get(userId)!.push(notification);

  // Notify subscribers
  const subscribers = notificationSubscribers.get(userId);
  if (subscribers) {
    subscribers.forEach((callback) => callback(notification));
  }

  return notification;
}

export function subscribe(
  userId: string,
  callback: (notification: Notification) => void
): () => void {
  if (!notificationSubscribers.has(userId)) {
    notificationSubscribers.set(userId, new Set());
  }
  notificationSubscribers.get(userId)!.add(callback);

  // Return unsubscribe function
  return () => {
    notificationSubscribers.get(userId)?.delete(callback);
  };
}

export function getNotifications(userId: string): Notification[] {
  return notificationQueues.get(userId) || [];
}

export function markAsRead(userId: string, notificationId: string): void {
  const notifications = notificationQueues.get(userId);
  if (notifications) {
    const notif = notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
  }
}
