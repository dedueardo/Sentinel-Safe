import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { connectWebSocket, onWebSocketMessage } from '../services/websocket';

// Tipos de notificação
export type NotificationType =
  | 'motion'
  | 'person'
  | 'alert'
  | 'info'
  | 'error'
  | 'camera_added'
  | 'camera_updated'
  | 'camera_deleted';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  cameraId?: string;
  cameraName?: string;
  read: boolean;
}

interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...data,
        // CORREÇÃO: ID um pouco mais robusto para evitar colisões
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Lógica para notificação do navegador (já estava correta)
      if (Notification.permission === 'granted') {
        new Notification('Sentinel-safe', {
          body: data.message,
          icon: '/icon.png',
        });
      }
    },
    []
  );

  useEffect(() => {
    connectWebSocket();

    // CORREÇÃO: Criamos uma função "factory" que gera um handler para cada tipo de notificação.
    // Isso garante que o 'type' da notificação seja o do canal do WebSocket que a enviou.
    const createNotificationHandler = (type: NotificationType) => (payload: any) => {
      // Validamos se o payload recebido tem a estrutura esperada
      if (payload && payload.message) {
        addNotification({
          type, // Usa o tipo do canal (ex: 'motion')
          message: payload.message,
          cameraId: payload.cameraId,
          cameraName: payload.cameraName,
        });
      }
    };

    // Registra os handlers para cada tipo de evento do WebSocket
    const unsubscribeMotion = onWebSocketMessage('motion', createNotificationHandler('motion'));
    const unsubscribeAlert = onWebSocketMessage('alert', createNotificationHandler('alert'));
    const unsubscribePerson = onWebSocketMessage('person', createNotificationHandler('person'));

    // Função de limpeza para remover os listeners quando o componente for desmontado
    return () => {
      unsubscribeMotion();
      unsubscribeAlert();
      unsubscribePerson();
    };
  }, [addNotification]); // A dependência [addNotification] está correta

  // As funções abaixo já estavam corretas e não precisam de alteração.
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
}