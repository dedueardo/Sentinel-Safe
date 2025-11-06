import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-gray-800 text-white flex items-center justify-end px-6 border-b border-gray-700">
      <div className="flex items-center gap-x-4">
        <button className="text-gray-400 hover:text-white">
          <Bell size={20} />
        </button>
        <span className="text-sm text-gray-300">Olá, {user?.name || 'Usuário'}</span>
        <button onClick={logout} className="text-gray-400 hover:text-white" title="Sair">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;