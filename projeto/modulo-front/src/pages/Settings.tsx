import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';


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
    <div className="text-sm font-medium text-gray-300">
      {label}
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <div className="mt-1 flex text-sm text-white sm:mt-0 sm:col-span-2 items-center">
      {children}
    </div>
  </div>
);

// Componente para o switch de toggle
const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`${enabled ? 'bg-blue-600' : 'bg-gray-600'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
  >
    <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);


function Settings() {
  const { user, logout } = useAuth();
  // Estado para controlar a permissão de notificações do navegador
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  // Efeito que atualiza o estado se o usuário mudar a permissão nas configurações do navegador
  useEffect(() => {
    const checkPermission = () => setNotificationPermission(Notification.permission);
    // Navegadores modernos não têm um evento 'onchange' para permissões, então verificamos em intervalos
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
      <h1 className="text-3xl font-bold text-white mb-6">Configurações</h1>

      <div className="bg-gray-800 shadow-md rounded-lg">
        <div className="divide-y divide-gray-700 p-6">

          {/* Seção de Notificações */}
          <SettingRow
            label="Notificações no Navegador"
            description="Receba alertas quando um evento for detectado."
          >
            <div className="flex items-center gap-x-4">
              <ToggleSwitch enabled={notificationPermission === 'granted'} onChange={handleNotificationToggle} />
              <span className="text-gray-400 text-sm">
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
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </SettingRow>
        </div>

        {/* Rodapé com botão de Logout */}
        <div className="bg-gray-800/50 px-6 py-4 flex justify-end rounded-b-lg">
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