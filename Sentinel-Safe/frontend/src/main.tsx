import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CameraProvider } from './contexts/CameraContext';
import { ThemeProvider } from './contexts/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Router
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <AuthProvider>
      <NotificationProvider>
        <CameraProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </CameraProvider>
      </NotificationProvider>
    </AuthProvider>
  </Router>
);