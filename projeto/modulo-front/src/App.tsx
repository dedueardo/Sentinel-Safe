import React from 'react';
import { Routes, Route, Navigate, Outlet, } from 'react-router-dom';

// Importe os contextos e hooks necessários
import { useAuth } from './contexts/AuthContext';

// Importe seus componentes e páginas
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Cameras from './pages/Cameras';
import Settings from './pages/Settings';
import Login from './pages/Login';
import CameraManagement from './pages/CameraManagement';

// Componente que combina a lógica de proteção E o layout
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Mostra um spinner enquanto a autenticação é verificada
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza o Layout, e o <Outlet> renderizará a página filha
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// O componente App agora contém apenas as rotas
function App() {
  return (
    <Routes>
      {/* Rota Pública para o Login */}
      <Route path="/login" element={<Login />} />

      {/* Grupo de Rotas Protegidas */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cameras" element={<Cameras />} />
        <Route path="/camera-management" element={<CameraManagement />} />
        <Route path="/settings" element={<Settings />} />

        {/* Rota padrão para usuários logados */}
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Redirecionamento para qualquer rota não encontrada */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;