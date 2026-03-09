import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehiclesAPI } from '../services/api';
import { Vehicle } from '../types';
import Layout from '../components/Layout/Layout';

interface NotificationItem {
  vehicle: Vehicle;
  type: 'soat' | 'tecnomecanica';
  daysRemaining: number;
  severity: 'critical' | 'warning' | 'info' | 'expired';
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const vehicles = await vehiclesAPI.getVehiclesWithExpiringDocuments();
      
      const notificationsList: NotificationItem[] = [];
      const today = new Date();

      vehicles.forEach((vehicle) => {
        // Verificar SOAT
        if (vehicle.documentacion?.soat?.fechaVencimiento) {
          const soatDate = new Date(vehicle.documentacion.soat.fechaVencimiento);
          const daysRemaining = Math.ceil((soatDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Incluir documentos vencidos (daysRemaining < 0) y próximos a vencer (0-30 días)
          if (daysRemaining < 0 || (daysRemaining >= 0 && daysRemaining <= 30)) {
            notificationsList.push({
              vehicle,
              type: 'soat',
              daysRemaining,
              severity: daysRemaining < 0 ? 'expired' : daysRemaining <= 7 ? 'critical' : daysRemaining <= 15 ? 'warning' : 'info'
            });
          }
        }

        // Verificar Tecnomecánica
        if (vehicle.documentacion?.tecnomecanica?.fechaVencimiento) {
          const tecnoDate = new Date(vehicle.documentacion.tecnomecanica.fechaVencimiento);
          const daysRemaining = Math.ceil((tecnoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Incluir documentos vencidos (daysRemaining < 0) y próximos a vencer (0-30 días)
          if (daysRemaining < 0 || (daysRemaining >= 0 && daysRemaining <= 30)) {
            notificationsList.push({
              vehicle,
              type: 'tecnomecanica',
              daysRemaining,
              severity: daysRemaining < 0 ? 'expired' : daysRemaining <= 7 ? 'critical' : daysRemaining <= 15 ? 'warning' : 'info'
            });
          }
        }
      });

      // Ordenar por severidad y días restantes (los vencidos primero)
      notificationsList.sort((a, b) => {
        const severityOrder = { expired: 0, critical: 1, warning: 2, info: 3 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return a.daysRemaining - b.daysRemaining;
      });

      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'expired':
        return 'bg-red-200 border-red-700 text-red-900';
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'expired':
        return (
          <svg className="w-6 h-6 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return type === 'soat' ? 'SOAT' : 'Tecnomecánica';
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Notificaciones</h1>
          <p className="mt-2 text-sm text-ink-300">
            Documentos de vehículos vencidos y próximos a vencer
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-surface-800 rounded-lg shadow-md p-8 text-center border border-[#2f3238]">
            <svg
              className="mx-auto h-12 w-12 text-ink-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-white">
              No hay notificaciones
            </h3>
            <p className="mt-1 text-sm text-ink-300">
              Todos los documentos están al día
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen de notificaciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">Crítico</p>
                    <p className="text-2xl font-bold text-red-900">
                      {notifications.filter(n => n.severity === 'critical').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">Advertencia</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {notifications.filter(n => n.severity === 'warning').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Información</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {notifications.filter(n => n.severity === 'info').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de notificaciones */}
            {notifications.map((notification, index) => (
              <div
                key={index}
                className={`border-l-4 rounded-lg shadow-md p-6 ${getSeverityColor(notification.severity)}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getSeverityIcon(notification.severity)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {getDocumentTypeLabel(notification.type)} próximo a vencer
                      </h3>
                      <span className="text-sm font-medium">
                        {notification.daysRemaining === 0
                          ? 'Vence HOY'
                          : notification.daysRemaining === 1
                          ? 'Vence mañana'
                          : `Vence en ${notification.daysRemaining} días`}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>
                        <span className="font-medium">Vehículo:</span>{' '}
                        {notification.vehicle.marca} {notification.vehicle.modelo} {notification.vehicle.año}
                      </p>
                      <p>
                        <span className="font-medium">Placa:</span> {notification.vehicle.placa}
                      </p>
                      <p>
                        <span className="font-medium">Fecha de vencimiento:</span>{' '}
                        {formatDate(
                          notification.type === 'soat'
                            ? notification.vehicle.documentacion?.soat?.fechaVencimiento
                            : notification.vehicle.documentacion?.tecnomecanica?.fechaVencimiento
                        )}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/vehicles/${notification.vehicle._id}/edit`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Ver detalles del vehículo
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
