import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Video, Settings } from 'lucide-react';

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-x-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${isActive ? 'bg-blue-600 text-white' : ''
      }`
    }
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </NavLink>
);

function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center px-6 text-xl font-semibold border-b border-gray-700">
        Sentinel-safe
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavItem to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
        <NavItem to="/cameras" icon={<Video size={20} />} label="Câmeras" />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Configurações" />
      </nav>
    </aside>
  );
}

export default Sidebar;