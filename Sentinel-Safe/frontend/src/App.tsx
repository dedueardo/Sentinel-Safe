import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Cameras from './pages/Cameras';
import Settings from './pages/Settings';
import Login from './pages/Login';
import CameraManagement from './pages/CameraManagement';
import Register from './pages/Register';
import AnimatedPage from './components/common/AnimatedPage';


function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  // OBTER A LOCALIZAÇÃO ATUAL PARA USAR COMO CHAVE DE ANIMAÇÃO
  const location = useLocation();

  return (
    <>
      {/* O Toaster fica fora do AnimatePresence para não ser reanimado a cada mudança de rota */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />

      {/* 5. ENVOLVER O <Routes> COM <AnimatePresence> */}
      <AnimatePresence mode="wait">
        {/* 6. PASSAR 'location' E 'key' PARA O <Routes> */}
        <Routes location={location} key={location.pathname}>

          {/* --- ROTAS PÚBLICAS --- */}
          <Route
            path="/login"
            element={
              <AnimatedPage>
                <Login />
              </AnimatedPage>
            }
          />
          <Route
            path="/register"
            element={
              <AnimatedPage>
                <Register />
              </AnimatedPage>
            }
          />

          {/* --- GRUPO DE ROTAS PROTEGIDAS --- */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/camera-management" element={<CameraManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* --- REDIRECIONAMENTO --- */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;