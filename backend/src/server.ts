import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import fixedExpenseRoutes from './routes/fixedExpense.routes';
import commissionRoutes from './routes/commission.routes';
import { ensureUploadsDir } from './utils/uploads';

// Configurar variables de entorno
// REDEPLOY_TRIGGER: 2025-01-13-v4-marketplace-fotos
dotenv.config();


// Crear aplicación Express
const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const hasExplicitAllowedOrigins = allowedOrigins.length > 0;

// Configurar CORS para permitir acceso desde móviles
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sin origin (apps móviles/Postman) y lista explícita
    if (!origin) {
      callback(null, true);
      return;
    }

    const isLocalNetwork =
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('192.168.') ||
      origin.includes('10.');

    if (process.env.NODE_ENV !== 'production' && isLocalNetwork) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Fallback para no romper despliegues donde ALLOWED_ORIGINS no esté configurado aún.
    if (!hasExplicitAllowedOrigins) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (fotos)
app.use('/uploads', express.static(ensureUploadsDir()));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/fixed-expenses', fixedExpenseRoutes);
app.use('/api/commissions', commissionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API de Compraventa de Vehículos',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      fixedExpenses: '/api/fixed-expenses',
    },
  });
});

// Health check para Render
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Error handler global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token inválido', error: err.message });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expirado', error: err.message });
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'La imagen es demasiado pesada para procesarla. Toma otra foto con menor peso.',
      error: 'LIMIT_FILE_SIZE',
    });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Conectar a la base de datos y arrancar servidor
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces (móvil, localhost, LAN)

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(Number(PORT), HOST, () => {
      const getLocalIP = () => {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
          for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
              return iface.address;
            }
          }
        }
        return 'localhost';
      };
      
      const localIP = getLocalIP();
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 URLs:`);
      console.log(`   - Local: http://localhost:${PORT}`);
      console.log(`   - Red/Móvil: http://${localIP}:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n✅ El servidor está listo para recibir conexiones desde móviles y otros dispositivos.\n`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
