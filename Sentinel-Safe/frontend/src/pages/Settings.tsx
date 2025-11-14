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
  <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
    <div className="text-sm font-medium text-gray-800 dark:text-gray-300">
      {label}
      <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">{description}</p>
    </div>
    <div className="mt-2 flex text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 items-center">
      {children}
    </div>
  </div>
);

function Settings() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Configurações</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="divide-y divide-gray-200 dark:divide-gray-700 px-6">

          {/* Seção de Aparência com o novo ThemeToggle */}
          <SettingRow
            label="Aparência"
            description={`Atualmente em modo ${theme === 'light' ? 'Claro' : 'Escuro'}.`}
          >
            <ThemeToggle />
          </SettingRow>

          {/* Seção da Conta */}
          <SettingRow
            label="Conta"
            description="Suas informações de usuário."
          >
            <div className="flex-1">
              <p className="font-medium">{user?.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
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