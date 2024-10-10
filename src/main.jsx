// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';  // Importa el AuthProvider
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* Envuelve App con AuthProvider */}
      <App />
    </AuthProvider>
  </StrictMode>,
);
