import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppRoutes from './routes';
import store from './store';
import AdminPanel from './pages/AdminPanel';
import MainLayout from './components/MainLayout';
import { Navigate } from 'react-router-dom';
import Landing from './pages/Landing';

const PrivateRoute = ({ children, requireAdmin }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && !user.is_staff) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Landing />} />
                <Route path="*" element={<AppRoutes />} />
                <Route
                  path="admin"
                  element={
                    <PrivateRoute requireAdmin>
                      <AdminPanel />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </Provider>
  );
}

export default App; 