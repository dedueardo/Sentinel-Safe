import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';

// Componente SettingRow com classes para modo claro E escuro
const SettingRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
    <div className="text-sm font-medium text-gray-800 dark:text-gray-300">
      {label}
      <p className="text-xs text-gray-600 dark:text-gray-500">{description}</p>
    </div>
    <div className="mt-1 flex text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 items-center">
      {children}
    </div>
  </div>
);

// Componente ToggleSwitch com classes para modo claro E escuro
const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`${enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
  >
    <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);

function Settings() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  useEffect(() => {
    const checkPermission = () => setNotificationPermission(Notification.permission);
    const interval = setInterval(checkPermission, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationToggle = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } else if (Notification.permission === 'denied') {
      alert("As notificações foram bloqueadas. Você precisa habilitá-las nas configurações do seu navegador.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Configurações</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="divide-y divide-gray-200 dark:divide-gray-700 p-6">

          {/* Seção de Aparência com o novo ThemeToggle */}
          <SettingRow
            label="Aparência"
            description={`Atualmente em modo ${theme === 'light' ? 'Claro' : 'Escuro'}.`}
          >
            <ThemeToggle />
          </SettingRow>

          {/* Seção de Notificações */}
          <SettingRow
            label="Notificações no Navegador"
            description="Receba alertas quando um evento for detectado."
          >
            <div className="flex items-center gap-x-4">
              <ToggleSwitch enabled={notificationPermission === 'granted'} onChange={handleNotificationToggle} />
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {notificationPermission === 'granted' && 'Ativadas'}
                {notificationPermission === 'denied' && 'Bloqueadas'}
                {notificationPermission === 'default' && 'Permissão necessária'}
              </span>
            </div>
          </SettingRow>

          {/* Seção da Conta */}
          <SettingRow
            label="Conta"
            description="Suas informações de usuário."
          >
            <div className="flex-1">
              <p className="font-medium">{user?.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </SettingRow>
        </div>

        {/* Rodapé com botão de Logout */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end rounded-b-lg">
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;