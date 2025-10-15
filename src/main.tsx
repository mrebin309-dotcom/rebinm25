import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './AppWrapper.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  </StrictMode>
);