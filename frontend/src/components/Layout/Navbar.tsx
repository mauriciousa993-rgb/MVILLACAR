import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  User,
  BarChart3,
  Menu,
  X,
  Store,
  Receipt,
  Bell,
  Search,
  DollarSign,
  ClipboardCheck,
} from 'lucide-react';
import autoTechLogo from '../../assets/autotech-logo.png';
import { vehiclesAPI } from '../../services/api';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadNotificationCount();
    const interval = setInterval(loadNotificationCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificationCount = async () => {
    try {
      const vehicles = await vehiclesAPI.getVehiclesWithExpiringDocuments();
      let count = 0;
      const today = new Date();

      vehicles.forEach((vehicle) => {
        // Verificar SOAT - incluye vencidos y próximos a vencer
        if (vehicle.documentacion?.soat?.fechaVencimiento) {
          const soatDate = new Date(vehicle.documentacion.soat.fechaVencimiento);
          const daysRemaining = Math.ceil((soatDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysRemaining < 0 || (daysRemaining >= 0 && daysRemaining <= 30)) count++;
        }

        // Verificar Tecnomecánica - incluye vencidos y próximos a vencer
        if (vehicle.documentacion?.tecnomecanica?.fechaVencimiento) {
          const tecnoDate = new Date(vehicle.documentacion.tecnomecanica.fechaVencimiento);
          const daysRemaining = Math.ceil((tecnoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysRemaining < 0 || (daysRemaining >= 0 && daysRemaining <= 30)) count++;
        }
      });

      setNotificationCount(count);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinkClass =
    'text-ink-100 hover:text-white hover:bg-[#23252a] transition-colors rounded-lg px-3 py-2';

  return (
    <nav className="sticky top-0 z-40 border-b border-[#2f3238] bg-[#121212]/95 text-white backdrop-blur-md shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 min-w-0">
            <img src={autoTechLogo} alt="AutoTech logo" className="h-11 w-11 flex-shrink-0 object-contain" />
            <div className="min-w-0">
              <span className="hidden sm:block text-xl leading-none font-bold tracking-wide truncate">
                <span className="text-white">Auto</span>
                <span className="text-primary-400">Tech</span>
              </span>
              <span className="sm:hidden text-base leading-none font-bold truncate">
                <span className="text-white">Auto</span>
                <span className="text-primary-400">Tech</span>
              </span>
              <span className="hidden sm:block text-xs text-ink-300 mt-1">
                Gestion de vehiculos
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Usuario y logout siempre visibles en pantallas grandes */}
            <div className="hidden lg:flex items-center space-x-4 border-l border-[#343840] pl-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary-400" />
                <div className="text-sm">
                  <div className="font-medium">{user?.nombre}</div>
                  <div className="text-ink-300 text-xs capitalize">{user?.rol}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center space-x-1 text-ink-100 hover:text-primary-300 transition-colors"
                title="Cerrar sesion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            {/* Menu hamburguesa siempre visible */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center gap-2 p-2 bg-[#1f2126] hover:bg-[#292c32] rounded-lg transition-colors flex-shrink-0 border border-[#343840]"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="text-sm font-semibold">Menu</span>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-[#343840] py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                to="/vehicles"
                onClick={closeMobileMenu}
                className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg"
              >
                Vehiculos
              </Link>
              <Link
                to="/notifications"
                onClick={closeMobileMenu}
                className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg flex items-center space-x-2 relative"
              >
                <Bell className="h-4 w-4 text-primary-400" />
                <span>Notificaciones</span>
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
              <Link
                to="/marketplace"
                onClick={closeMobileMenu}
                className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg flex items-center space-x-2"
              >
                <Store className="h-4 w-4 text-primary-400" />
                <span>Marketplace</span>
              </Link>
              <Link
                to="/consulta-tramite"
                onClick={closeMobileMenu}
                className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg flex items-center space-x-2"
              >
                <Search className="h-4 w-4 text-primary-400" />
                <span>Consulta Trámite</span>
              </Link>
              <Link
                to="/reports"
                onClick={closeMobileMenu}
                className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4 text-primary-400" />
                <span>Reportes</span>
              </Link>
              {(user?.rol === 'admin' || user?.rol === 'vendedor') && (
                <Link
                  to="/vehicles/inspection"
                  onClick={closeMobileMenu}
                  className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg flex items-center space-x-2"
                >
                  <ClipboardCheck className="h-4 w-4 text-primary-400" />
                  <span>Checklist</span>
                </Link>
              )}
              <Link
                to="/fixed-expenses"
                onClick={closeMobileMenu}
                className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg flex items-center space-x-2"
              >
                <Receipt className="h-4 w-4 text-primary-400" />
                <span>Gastos Fijos</span>
              </Link>
              <Link
                to="/commissions"
                onClick={closeMobileMenu}
                className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg flex items-center space-x-2"
              >
                <DollarSign className="h-4 w-4 text-primary-400" />
                <span>Comisiones</span>
              </Link>
              {user?.rol === 'admin' && (
                <Link
                  to="/users"
                  onClick={closeMobileMenu}
                  className="text-ink-100 hover:text-white transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg"
                >
                  Usuarios
                </Link>
              )}

              <div className="border-t border-[#343840] pt-4 mt-2">
                <div className="flex items-center space-x-2 px-4 py-2">
                  <User className="h-5 w-5 text-primary-400" />
                  <div className="text-sm">
                    <div className="font-medium">{user?.nombre}</div>
                    <div className="text-ink-300 text-xs capitalize">{user?.rol}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 text-ink-100 hover:text-primary-300 transition-colors py-2 px-4 hover:bg-[#23252a] rounded-lg text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar sesion</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
