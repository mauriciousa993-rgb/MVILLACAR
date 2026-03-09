import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

// Registrar nuevo usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'El email ya está registrado' });
      return;
    }

    // Crear nuevo usuario
    const user = new User({
      nombre,
      email,
      password,
      rol: rol || 'vendedor',
    });

    await user.save();

    // Generar token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está configurado en variables de entorno');
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, rol: user.rol },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      res.status(401).json({ message: 'Usuario inactivo' });
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // Generar token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está configurado en variables de entorno');
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, rol: user.rol },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.json({
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      activo: user.activo,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};

// Listar todos los usuarios (solo admin)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

// Actualizar usuario
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo, password } = req.body;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Actualizar campos básicos
    if (nombre) user.nombre = nombre;
    if (email) user.email = email;
    if (rol) user.rol = rol;
    if (activo !== undefined) user.activo = activo;
    
    // Solo actualizar password si se proporcionó uno nuevo
    if (password && password.trim() !== '') {
      user.password = password;
    }

    await user.save();

    // Retornar usuario sin password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'Usuario actualizado exitosamente', user: userResponse });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

// Eliminar usuario
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

// Crear nuevo usuario (solo admin)
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'El email ya está registrado' });
      return;
    }

    // Validar rol
    const rolesPermitidos = ['admin', 'vendedor', 'visualizador'];
    if (rol && !rolesPermitidos.includes(rol)) {
      res.status(400).json({ message: 'Rol inválido' });
      return;
    }

    // Crear nuevo usuario
    const user = new User({
      nombre,
      email,
      password,
      rol: rol || 'vendedor',
      activo: true,
    });

    await user.save();

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        activo: user.activo,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};
