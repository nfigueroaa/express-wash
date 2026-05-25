'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationsCenterProps {
  userId: string;
}

export function NotificationsCenter({ userId }: NotificationsCenterProps) {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:opacity-80"
        style={{ backgroundColor: 'rgba(192,193,255,0.1)' }}
        title="Notificaciones"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#ef4444' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg border shadow-lg max-h-96 overflow-y-auto z-50"
          style={{
            backgroundColor: 'var(--indigo-surface)',
            borderColor: 'var(--indigo-border)',
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'var(--indigo-border)' }}>
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--indigo-primary)' }}
            >
              Notificaciones
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--indigo-text-muted)' }}>
              No hay notificaciones
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className="p-3 border-b cursor-pointer transition-colors hover:opacity-80"
                  style={{
                    borderColor: 'var(--indigo-border)',
                    backgroundColor: notification.read ? 'transparent' : 'rgba(192,193,255,0.05)',
                  }}
                >
                  <div className="flex gap-2">
                    <span className="text-lg flex-shrink-0">
                      {notification.type === 'new_order' ? '📦' : '⚙️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--indigo-primary)' }}>
                        {notification.title}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--indigo-text-muted)' }}
                      >
                        {notification.message}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--indigo-text-faint)' }}
                      >
                        {new Date(notification.timestamp).toLocaleTimeString('es-CL')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
