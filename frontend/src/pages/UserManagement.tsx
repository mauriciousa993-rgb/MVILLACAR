import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { authAPI } from '../services/api';
import { User } from '../types';
import { UserPlus, Edit2, Trash2, Check, X, Shield, Eye, ShoppingCart } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'visualizador' as User['rol'],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await authAPI.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      setError('Error al cargar usuarios');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        // Actualizar usuario
        const updateData: any = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
        };
        
        // Solo incluir password si se proporcionó uno nuevo
        if (formData.password) {
          updateData.password = formData.password;
        }

        await authAPI.updateUser(editingUser.id, updateData);
        setSuccess('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await authAPI.createUser(formData);
        setSuccess('Usuario creado exitosamente');
      }

      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '',
      rol: user.rol,
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
      return;
    }

    try {
      await authAPI.deleteUser(userId);
      setSuccess('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await authAPI.updateUser(user.id, { activo: !user.activo });
      setSuccess(`Usuario ${!user.activo ? 'activado' : 'desactivado'} exitosamente`);
      loadUsers();
    } catch (error: any) {
      setError('Error al cambiar estado del usuario');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'visualizador',
    });
    setEditingUser(null);
  };

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'vendedor':
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'visualizador':
        return <Eye className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getRolBadgeColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'vendedor':
        return 'bg-blue-100 text-blue-800';
      case 'visualizador':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Tabla de usuarios */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {user.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getRolIcon(user.rol)}
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRolBadgeColor(user.rol)}`}>
                          {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {user.activo ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                        title="Editar usuario"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay usuarios registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de crear/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingUser && '(dejar en blanco para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                  className="input-field"
                  required
                >
                  <option value="visualizador">Visualizador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.rol === 'admin' && '• Acceso completo al sistema'}
                  {formData.rol === 'vendedor' && '• Puede gestionar vehículos sin ver información financiera'}
                  {formData.rol === 'visualizador' && '• Solo puede ver información básica de vehículos'}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingUser ? 'Actualizar' : 'Crear'} Usuario
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagement;
