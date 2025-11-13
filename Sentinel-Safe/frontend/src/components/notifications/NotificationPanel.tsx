import React from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import {
  BellIcon,
  ExclamationCircleIcon,
  VideoCameraIcon,
  UserIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications()

  const getIcon = (type: string) => {
    switch (type) {
      case 'motion':
        return <VideoCameraIcon className="h-5 w-5" />
      case 'person':
        return <UserIcon className="h-5 w-5" />
      case 'alert':
        return <ExclamationCircleIcon className="h-5 w-5" />
      default:
        return <InformationCircleIcon className="h-5 w-5" />
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'motion':
        return 'bg-blue-100 text-blue-800'
      case 'person':
        return 'bg-yellow-100 text-yellow-800'
      case 'alert':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Notificações
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {unreadCount} nova{unreadCount !== 1 && 's'}
              </span>
            )}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Marcar como lidas
            </button>
            <button
              onClick={clearNotifications}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nenhuma notificação
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${getTypeStyle(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.message}
                    </p>
                    {notification.cameraName && (
                      <p className="mt-1 text-sm text-gray-500">
                        Câmera: {notification.cameraName}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {format(new Date(notification.timestamp), "dd 'de' MMMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationPanel