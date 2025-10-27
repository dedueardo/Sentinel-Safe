import React, { createContext, useContext, useState, useCallback } from 'react'

export type NotificationType = 'motion' | 'person' | 'alert' | 'info' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: string
  cameraId?: string
  cameraName?: string
  read: boolean
}

interface NotificationContextData {
  notifications: Notification[]
  unreadCount: number
  addNotification: (data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev])

    // Opcional: Mostrar notificação do navegador
    if (Notification.permission === 'granted') {
      new Notification('Sentinel-safe', {
        body: data.message,
        icon: '/icon.png', // Adicione um ícone para seu app
      })
    }
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

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
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider')
  }
  return context
}