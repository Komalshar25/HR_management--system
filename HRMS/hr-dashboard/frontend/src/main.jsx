import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { SnackbarProvider } from './components/common/SnackbarProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeModeProvider>
  </React.StrictMode>,
);
