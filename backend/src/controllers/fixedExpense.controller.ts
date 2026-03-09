import { Response } from 'express';
import FixedExpense from '../models/FixedExpense';
import { AuthRequest } from '../types';

const toBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'si' || normalized === 'yes';
  }
  return Boolean(value);
};

export const getFixedExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const includeInactiveRequested = toBoolean(req.query.includeInactive);
    const canViewInactive = req.user?.rol === 'admin' || req.user?.rol === 'vendedor';
    const includeInactive = includeInactiveRequested && canViewInactive;
    const categoria = (req.query.categoria as string) || '';

    const filter: any = {};
    if (!includeInactive) {
      filter.activo = true;
    }
    if (categoria) {
      filter.categoria = categoria;
    }

    const expenses = await FixedExpense.find(filter)
      .populate('registradoPor', 'nombre email')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al obtener gastos fijos',
      error: error.message,
    });
  }
};

export const createFixedExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      categoria,
      monto,
      diaPago,
      proveedor,
      metodoPago,
      fechaInicio,
      fechaFin,
      observaciones,
      activo,
    } = req.body || {};

    const expense = new FixedExpense({
      nombre,
      categoria,
      monto,
      diaPago,
      proveedor,
      metodoPago,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      observaciones,
      activo: typeof activo === 'undefined' ? true : toBoolean(activo),
      registradoPor: req.user?.userId,
    });

    await expense.save();
    await expense.populate('registradoPor', 'nombre email');

    res.status(201).json({
      message: 'Gasto fijo creado exitosamente',
      expense,
    });
  } catch (error: any) {
    if (error?.name === 'ValidationError') {
      const errors = Object.values(error.errors || {}).map((err: any) => err.message);
      res.status(400).json({
        message: 'Error de validacion',
        errors,
      });
      return;
    }

    res.status(500).json({
      message: 'Error al crear gasto fijo',
      error: error.message,
    });
  }
};

export const updateFixedExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await FixedExpense.findById(id);

    if (!expense) {
      res.status(404).json({ message: 'Gasto fijo no encontrado' });
      return;
    }

    const {
      nombre,
      categoria,
      monto,
      diaPago,
      proveedor,
      metodoPago,
      fechaInicio,
      fechaFin,
      observaciones,
      activo,
    } = req.body || {};

    if (typeof nombre !== 'undefined') expense.nombre = nombre;
    if (typeof categoria !== 'undefined') expense.categoria = categoria;
    if (typeof monto !== 'undefined') expense.monto = monto;
    if (typeof diaPago !== 'undefined') expense.diaPago = diaPago;
    if (typeof proveedor !== 'undefined') expense.proveedor = proveedor;
    if (typeof metodoPago !== 'undefined') expense.metodoPago = metodoPago;
    if (typeof fechaInicio !== 'undefined') {
      expense.fechaInicio = fechaInicio ? new Date(fechaInicio) : expense.fechaInicio;
    }
    if (typeof fechaFin !== 'undefined') {
      expense.fechaFin = fechaFin ? new Date(fechaFin) : undefined;
    }
    if (typeof observaciones !== 'undefined') expense.observaciones = observaciones;
    if (typeof activo !== 'undefined') {
      expense.activo = toBoolean(activo);
      if (expense.activo) {
        expense.fechaFin = undefined;
      }
    }

    await expense.save();
    await expense.populate('registradoPor', 'nombre email');

    res.json({
      message: 'Gasto fijo actualizado exitosamente',
      expense,
    });
  } catch (error: any) {
    if (error?.name === 'ValidationError') {
      const errors = Object.values(error.errors || {}).map((err: any) => err.message);
      res.status(400).json({
        message: 'Error de validacion',
        errors,
      });
      return;
    }

    res.status(500).json({
      message: 'Error al actualizar gasto fijo',
      error: error.message,
    });
  }
};

export const deleteFixedExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await FixedExpense.findById(id);

    if (!expense) {
      res.status(404).json({ message: 'Gasto fijo no encontrado' });
      return;
    }

    expense.activo = false;
    if (!expense.fechaFin) {
      expense.fechaFin = new Date();
    }

    await expense.save();

    res.json({
      message: 'Gasto fijo archivado exitosamente',
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al archivar gasto fijo',
      error: error.message,
    });
  }
};
