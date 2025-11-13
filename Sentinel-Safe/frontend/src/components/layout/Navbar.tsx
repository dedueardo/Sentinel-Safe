import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();

  // 👇 2. Adicione a lógica para obter o primeiro nome
  const firstName = useMemo(() => {
    // Se não houver usuário ou nome, retorna uma string vazia
    if (!user?.name) {
      return '';
    }
    // Divide o nome completo pelos espaços e pega o primeiro item
    return user.name.split(' ')[0];
  }, [user?.name]); // Recalcula apenas quando o nome do usuário mudar

  return (
    <header className="h-16 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-full flex items-center justify-end px-6">
        <div className="flex items-center gap-4">
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <Bell size={20} />
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

          {/* 👇 3. Use a variável 'firstName' e adicione 'capitalize' */}
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
            Olá, {firstName}
          </span>

          <button
            onClick={logout}
            title="Sair da Conta"
            className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;