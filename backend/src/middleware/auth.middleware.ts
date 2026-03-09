import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    const authorization = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const token = authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'No se proporcionó token de autenticación' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'JWT_SECRET no está configurado' });
      return;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      rol: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    if (!roles.includes(req.user.rol)) {
      res.status(403).json({ 
        message: 'No tienes permisos para realizar esta acción' 
      });
      return;
    }

    next();
  };
};
