import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import autoTechLogo from '../assets/autotech-logo.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/vehicles');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl border border-[#2f3238] bg-[#1b1d22] flex items-center justify-center shadow-[0_16px_32px_-24px_rgba(0,0,0,0.9)]">
              <img src={autoTechLogo} alt="AutoTech logo" className="h-14 w-14 object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AutoTech
          </h1>
          <p className="text-ink-200">
            Sistema de Gestion de Inventario
          </p>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Iniciar Sesion
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-[#2b1215] border border-primary-700 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-primary-300 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-primary-200">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-100 mb-1">
                Correo Electronico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-100 mb-1">
                Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink-300" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="��������"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-ink-300 text-sm">
          <p>� 2024 AutoTech</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
