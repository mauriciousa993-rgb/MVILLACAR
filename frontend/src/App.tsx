import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNotifications } from './hooks/useNotifications';
import { PWAInstallButton } from './components/PWAInstallButton';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VehicleList = lazy(() => import('./pages/VehicleList'));
const VehicleForm = lazy(() => import('./pages/VehicleForm'));
const Reports = lazy(() => import('./pages/Reports'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const FixedExpenses = lazy(() => import('./pages/FixedExpenses'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ConsultaTramite = lazy(() => import('./pages/ConsultaTramite'));
const CommissionLiquidation = lazy(() => import('./pages/CommissionLiquidation'));
const VehicleInspectionChecklist = lazy(() => import('./pages/VehicleInspectionChecklist'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando modulo...</p>
    </div>
  </div>
);

// Componente para proteger rutas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/consulta-tramite" element={<ConsultaTramite />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />


      <Route
        path="/vehicles"
        element={
          <PrivateRoute>
            <VehicleList />
          </PrivateRoute>
        }
      />
      <Route
        path="/vehicles/new"
        element={
          <PrivateRoute>
            <VehicleForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/vehicles/:id/edit"
        element={
          <PrivateRoute>
            <VehicleForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/vehicles/inspection"
        element={
          <PrivateRoute>
            <VehicleInspectionChecklist />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        }
      />
      <Route
        path="/fixed-expenses"
        element={
          <PrivateRoute>
            <FixedExpenses />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <UserManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/commissions"
        element={
          <PrivateRoute>
            <CommissionLiquidation />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/marketplace" />} />
    </Routes>
  );
}

function App() {
  const { showInstallButton, permission, installPWA, requestPermission } = useNotifications();

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
        <PWAInstallButton
          showInstall={showInstallButton}
          permission={permission}
          onInstall={installPWA}
          onRequestPermission={requestPermission}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
