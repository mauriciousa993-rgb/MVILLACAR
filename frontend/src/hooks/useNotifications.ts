import { useState, useEffect, useCallback } from 'react';

interface NotificationState {
  permission: NotificationPermission;
  isSubscribed: boolean;
  showInstallButton: boolean;
  deferredPrompt: any | null;
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSubscribed: false,
    showInstallButton: false,
    deferredPrompt: null
  });

  // Verificar permisos al montar
  useEffect(() => {
    if ('Notification' in window) {
      setState(prev => ({ ...prev, permission: Notification.permission }));
    }

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        deferredPrompt: e,
        showInstallButton: true
      }));
    };

    // Escuchar cuando la app es instalada
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        showInstallButton: false,
        deferredPrompt: null
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Solicitar permiso de notificaciones
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        // Programar recordatorio de inventario bajo
        scheduleInventoryReminder();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al solicitar permiso:', error);
      return false;
    }
  }, []);

  // Mostrar notificación local
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification.permission !== 'granted') {
      console.log('No hay permiso para notificaciones');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/autotech-logo.png',
      badge: '/autotech-logo.png',
      tag: 'autotech',
      requireInteraction: false,
      ...options
    };

    new Notification(title, defaultOptions);
  }, []);

  // Programar recordatorio de inventario bajo (ejemplo: cada lunes)
  const scheduleInventoryReminder = useCallback(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes
    
    // Solo mostrar los lunes
    if (dayOfWeek !== 1) {
      return;
    }

    // Verificar si ya se mostró hoy
    const lastShown = localStorage.getItem('inventoryReminderLastShown');
    const today = now.toDateString();

    if (lastShown === today) {
      return;
    }

    // Mostrar notificación después de 5 segundos
    setTimeout(() => {
      showNotification('📊 Revisión de Inventario - AutoTech', {
        body: 'Es lunes. Recuerda revisar el estado de tu inventario de vehículos.',
        tag: 'inventory-reminder',
        requireInteraction: true,
        data: { url: '/dashboard' }
      });
      localStorage.setItem('inventoryReminderLastShown', today);
    }, 5000);
  }, [showNotification]);

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (!state.deferredPrompt) {
      return false;
    }

    state.deferredPrompt.prompt();
    
    const { outcome } = await state.deferredPrompt.userChoice;
    
    setState(prev => ({
      ...prev,
      deferredPrompt: null,
      showInstallButton: outcome !== 'accepted'
    }));

    return outcome === 'accepted';
  }, [state.deferredPrompt]);

  return {
    ...state,
    requestPermission,
    showNotification,
    installPWA
  };
};
