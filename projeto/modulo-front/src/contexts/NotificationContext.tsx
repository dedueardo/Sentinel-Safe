import React, { createContext, useContext, useState, useCallback, useEffect, } from 'react'
import { connectWebSocket, onWebSocketMessage } from '../services/websocket'

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
  addNotification: (
    data: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextData | undefined>(
  undefined
)

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // A função addNotification permanece a mesma. Ela é a base para adicionar qualquer notificação.
  const addNotification = useCallback(
    (data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...data,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])

      // Opcional: Mostrar notificação do navegador
      if (Notification.permission === 'granted') {
        new Notification('Sentinel-safe', {
          body: data.message,
          icon: '/icon.png', // Adicione um ícone para seu app
        })
      }
    },
    []
  )

  // 3. Adicionar o useEffect para lidar com a lógica do WebSocket
  useEffect(() => {
    // Inicia a conexão com o WebSocket quando o provedor é montado
    connectWebSocket()

    // Função que será chamada quando uma nova notificação chegar via WebSocket
    const handleRealTimeNotification = (data: any) => {
      // Validamos se a mensagem recebida tem o formato esperado
      if (data.message && data.type) {
        addNotification({
          type: data.type,
          message: data.message,
          cameraId: data.cameraId,
          cameraName: data.cameraName,
        })
      }
    }

    // Registra a função para "ouvir" os eventos do tipo 'motion' e 'alert'
    const unsubscribeMotion = onWebSocketMessage(
      'motion',
      handleRealTimeNotification
    )
    const unsubscribeAlert = onWebSocketMessage(
      'alert',
      handleRealTimeNotification
    )
    const unsubscribePerson = onWebSocketMessage(
      'person',
      handleRealTimeNotification
    )

    // 4. Função de limpeza: É executada quando o componente é desmontado.
    // Isso evita memory leaks ao remover os "ouvintes" que não são mais necessários.
    return () => {
      unsubscribeMotion()
      unsubscribeAlert()
      unsubscribePerson()
    }
  }, [addNotification]) // A dependência [addNotification] garante que o efeito não seja recriado desnecessariamente

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

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
    throw new Error(
      'useNotifications deve ser usado dentro de um NotificationProvider'
    )
  }
  return context
}