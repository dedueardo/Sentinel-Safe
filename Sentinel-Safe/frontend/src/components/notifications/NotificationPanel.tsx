import React from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import {
  ExclamationCircleIcon,
  VideoCameraIcon,
  UserIcon,
  InformationCircleIcon,
  CheckCircleIcon,
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
      case 'camera_added':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'camera_updated':
        return <InformationCircleIcon className="h-5 w-5" />
      case 'camera_deleted':
        return <ExclamationCircleIcon className="h-5 w-5" />
      default:
        return <InformationCircleIcon className="h-5 w-5" />
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'motion':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
      case 'person':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
      case 'alert':
        return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
      case 'camera_added':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
      case 'camera_updated':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400'
      case 'camera_deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
    }
  }

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificações
          </h3>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-blue-500 dark:bg-blue-600 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="flex-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-md transition-colors"
          >
            Marcar como lidas
          </button>
          <button
            onClick={clearNotifications}
            className="flex-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-3 py-1.5 rounded-md transition-colors"
          >
            Limpar tudo
          </button>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma notificação
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!notification.read
                  ? 'bg-blue-50 dark:bg-blue-500/5 border-l-4 border-blue-500 dark:border-blue-400'
                  : ''
                  }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Ícone */}
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg ${getTypeStyle(
                      notification.type
                    )}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                      {notification.message}
                    </p>
                    {notification.cameraName && (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                        📹 {notification.cameraName}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {format(
                        new Date(notification.timestamp),
                        "dd 'de' MMM 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>

                  {/* Indicador de não lida */}
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    </div>
                  )}
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