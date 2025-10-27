import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  VideoCameraIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Câmeras', href: '/cameras', icon: VideoCameraIcon },
    { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
  ]

  return (
    <div className="w-64 bg-gray-800 min-h-screen p-4">
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                } mr-3 flex-shrink-0 h-6 w-6`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar