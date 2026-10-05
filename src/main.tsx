import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from '@/lib/auth';
import { PremiumProvider } from '@/lib/premium';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PremiumProvider>
        <App />
      </PremiumProvider>
    </AuthProvider>
  </StrictMode>
);
