import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BellIcon,
  UserCircleIcon,
  HomeIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { useNotifications } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import NotificationPanel from '../notifications/NotificationPanel'
import { format } from 'date-fns'

function Navbar() {
  const location = useLocation()
  const { unreadCount } = useNotifications()
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Câmeras', href: '/cameras', icon: VideoCameraIcon },
    { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
  ]

  // Atualiza o horário a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  // Fecha os menus quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.notification-menu') && !target.closest('.user-menu')) {
        setShowNotifications(false)
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">Sentinel-safe</h1>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActivePath(item.href)
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  } inline-flex items-center px-3 py-2 text-sm font-medium border-b-2`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Data e Hora */}
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm text-gray-500">
                {format(currentDateTime, 'dd/MM/yyyy')}
              </span>
              <span className="text-sm text-gray-500">
                {format(currentDateTime, 'HH:mm:ss')}
              </span>
            </div>

            {/* Notificações */}
            <div className="relative notification-menu">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowUserMenu(false)
                }}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Ver notificações</span>
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs text-center leading-5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && <NotificationPanel />}
            </div>

            {/* Menu do Usuário */}
            <div className="relative user-menu">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu)
                  setShowNotifications(false)
                }}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-6 w-6" />
                )}
                <span className="ml-2 text-sm font-medium">{user?.login || 'Gaius Van Baelsar'}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    {user?.name || 'Usuário'}
                  </div>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Configurações
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu móvel */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                isActivePath(item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
            >
              <item.icon className="h-6 w-6 mr-3" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar