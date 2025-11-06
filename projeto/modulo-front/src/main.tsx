import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CameraProvider } from './contexts/CameraContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <CameraProvider>
            <App />
          </CameraProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);