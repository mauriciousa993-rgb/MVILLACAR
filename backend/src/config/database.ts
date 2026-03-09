import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || '';
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

// Eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose desconectado de MongoDB');
});

// Cerrar conexión cuando la app se cierra
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 Conexión de Mongoose cerrada debido a la terminación de la aplicación');
  process.exit(0);
});
