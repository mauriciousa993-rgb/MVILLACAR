import React from 'react';
import { Download, Bell, BellOff } from 'lucide-react';

interface PWAInstallButtonProps {
  showInstall: boolean;
  permission: NotificationPermission;
  onInstall: () => void;
  onRequestPermission: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  showInstall,
  permission,
  onInstall,
  onRequestPermission
}) => {
  // No mostrar nada si no hay nada que hacer
  if (!showInstall && permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {/* Botón de notificaciones */}
      {permission !== 'granted' && (
        <button
          onClick={onRequestPermission}
          className="flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 font-medium"
          title="Activar notificaciones"
        >
          {permission === 'denied' ? (
            <>
              <BellOff className="w-5 h-5" />
              <span className="hidden sm:inline">Notificaciones bloqueadas</span>
            </>
          ) : (
            <>
              <Bell className="w-5 h-5" />
              <span className="hidden sm:inline">Activar notificaciones</span>
            </>
          )}
        </button>
      )}

      {/* Botón de instalación */}
      {showInstall && (
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 font-medium"
          title="Instalar aplicación"
        >
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Instalar App</span>
        </button>
      )}
    </div>
  );
};
