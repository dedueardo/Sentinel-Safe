import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationPanel from '../notifications/NotificationPanel';

function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (bellRef.current && bellRef.current.contains(target)) return;
      setOpen(false);
    }
    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const firstName = useMemo(() => {
    if (!user?.name) {
      return '';
    }
    return user.name.split(' ')[0];
  }, [user?.name]);

  return (
    <header className="h-16 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-full flex items-center justify-end px-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setOpen((v) => !v)}
              className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Abrir notificações"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {open && (
              <div ref={panelRef} className="absolute right-0">
                <NotificationPanel />
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
            Olá, {firstName}
          </span>

          <button
            onClick={logout}
            title="Sair da Conta"
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;