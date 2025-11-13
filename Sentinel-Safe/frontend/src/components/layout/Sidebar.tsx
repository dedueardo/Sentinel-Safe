import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Câmeras', to: '/cameras', icon: Video },
  { name: 'Configurações', to: '/settings', icon: Settings },
];

function Sidebar() {
  return (
    <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sentinel-safe</h1>
      </div>
      <nav className="p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors my-1 ${isActive
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-white font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;