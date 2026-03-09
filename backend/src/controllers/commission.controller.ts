import { Request, Response } from 'express';
import Vehicle from '../models/Vehicle';
import { LiquidacionComision, ILiquidacionComision } from '../models/LiquidacionComision';
import mongoose from 'mongoose';
import { AuthRequest } from '../types';

// Obtener todas las liquidaciones con filtros opcionales
export const getAllLiquidaciones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { año, mes, vendedor } = req.query;
    
    const query: any = {};
    if (año) query.año = parseInt(año as string);
    if (mes) query.mes = parseInt(mes as string);
    if (vendedor) query.vendedor = { $regex: vendedor, $options: 'i' };

    const liquidaciones = await LiquidacionComision.find(query)
      .sort({ año: -1, mes: -1 })
      .limit(50);

    res.json(liquidaciones);
  } catch (error) {
    console.error('Error getting liquidaciones:', error);
    res.status(500).json({ message: 'Error al obtener liquidaciones', error });
  }
};

// Obtener resumen de comisiones por vendedor y período
export const getComisionesResumen = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { año, mes } = req.query;
    const añoNum = año ? parseInt(año as string) : new Date().getFullYear();
    const mesNum = mes ? parseInt(mes as string) : null;

    // Obtener vehículos vendidos con comisión
    const matchStage: any = {
      estado: 'vendido',
      'datosVenta.comision.monto': { $gt: 0 }
    };

    if (mesNum) {
      matchStage.fechaVenta = {
        $gte: new Date(añoNum, mesNum - 1, 1),
        $lt: new Date(añoNum, mesNum, 1)
      };
    } else {
      matchStage.fechaVenta = {
        $gte: new Date(añoNum, 0, 1),
        $lt: new Date(añoNum + 1, 0, 1)
      };
    }

    const vehicles = await Vehicle.aggregate([
      { $match: matchStage },
      {
        $project: {
          placa: 1,
          marca: 1,
          modelo: 1,
          año: 1,
          precioVenta: 1,
          fechaVenta: 1,
          'datosVenta.vendedor.nombre': 1,
          'datosVenta.comision.monto': 1,
          'datosVenta.comision.porcentaje': 1,
          'datosVenta.comision.descripcion': 1,
        }
      },
      {
        $group: {
          _id: '$datosVenta.vendedor.nombre',
          totalComisiones: { $sum: '$datosVenta.comision.monto' },
          cantidadVentas: { $sum: 1 },
          ventas: {
            $push: {
              placa: '$placa',
              vehiculo: { $concat: ['$marca', ' ', '$modelo', ' ', { $toString: '$año' }] },
              precioVenta: '$precioVenta',
              fechaVenta: '$fechaVenta',
              comision: '$datosVenta.comision.monto',
              porcentaje: '$datosVenta.comision.porcentaje',
              descripcion: '$datosVenta.comision.descripcion',
            }
          }
        }
      },
      {
        $sort: { totalComisiones: -1 }
      }
    ]);

    // Obtener liquidaciones existentes para el período
    const liquidacionesExistentes = await LiquidacionComision.find({
      año: añoNum,
      ...(mesNum && { mes: mesNum })
    });

    // Combinar datos de ventas con liquidaciones
    const resultado = vehicles.map((v: any) => {
      const liquidacion = liquidacionesExistentes.find(l => l.vendedor === v._id);
      const ventasConLiquidacion = v.ventas.map((venta: any) => {
        const liq = liquidacion?.Liquidaciones.find(l => l.placa === venta.placa);
        return {
          ...venta,
          liquidada: liq?.liquidada || false,
          fechaLiquidacion: liq?.fechaLiquidacion,
        };
      });
      
      const pagadas = ventasConLiquidacion.filter((v: any) => v.liquidada).reduce((sum: number, v: any) => sum + v.comision, 0);
      const pendientes = ventasConLiquidacion.filter((v: any) => !v.liquidada).reduce((sum: number, v: any) => sum + v.comision, 0);

      return {
        vendedor: v._id || 'Sin nombre',
        totalComisiones: v.totalComisiones,
        cantidadVentas: v.cantidadVentas,
        comisionesPagadas: pagadas,
        comisionesPendientes: pendientes,
        ventas: ventasConLiquidacion,
        liquidado: liquidacion?.estado === 'liquidado' || false,
        liquidacionId: liquidacion?._id,
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error getting comisiones resumen:', error);
    res.status(500).json({ message: 'Error al obtener resumen de comisiones', error });
  }
};

// Obtener vendedores únicos con ventas en un período
export const getVendedoresConComisiones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { año } = req.query;
    const añoNum = año ? parseInt(año as string) : new Date().getFullYear();

    const vendedores = await Vehicle.distinct('datosVenta.vendedor.nombre', {
      estado: 'vendido',
      'datosVenta.comision.monto': { $gt: 0 },
      fechaVenta: {
        $gte: new Date(añoNum, 0, 1),
        $lt: new Date(añoNum + 1, 0, 1)
      }
    });

    res.json(vendedores.filter((v: string) => v && v.trim()));
  } catch (error) {
    console.error('Error getting vendedores:', error);
    res.status(500).json({ message: 'Error al obtener vendedores', error });
  }
};

// Crear o actualizar una liquidación
export const createOrUpdateLiquidacion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vendedor, mes, año, Liquidaciones, notas } = req.body;
    const userId = req.user?.userId;

    if (!vendedor || !mes || !año) {
      res.status(400).json({ message: 'Faltan datos requeridos' });
      return;
    }

    // Calcular totales
    const totalComisiones = Liquidaciones.reduce((sum: number, l: any) => sum + l.comision, 0);
    const comisionesPagadas = Liquidaciones.filter((l: any) => l.liquidada).reduce((sum: number, l: any) => sum + l.comision, 0);
    const comisionesPendientes = totalComisiones - comisionesPagadas;

    let estado: 'pendiente' | 'parcial' | 'liquidado' = 'pendiente';
    if (comisionesPendientes === 0 && totalComisiones > 0) {
      estado = 'liquidado';
    } else if (comisionesPagadas > 0) {
      estado = 'parcial';
    }

    // Buscar liquidación existente
    let liquidacion = await LiquidacionComision.findOne({ vendedor, mes, año });

    if (liquidacion) {
      // Actualizar
      liquidacion.Liquidaciones = Liquidaciones.map((l: any) => ({
        ...l,
        vehiculoId: l.vehiculoId ? new mongoose.Types.ObjectId(l.vehiculoId) : undefined,
        fechaLiquidacion: l.liquidada ? new Date() : undefined,
      }));
      liquidacion.totalComisiones = totalComisiones;
      liquidacion.comisionesPagadas = comisionesPagadas;
      liquidacion.comisionesPendientes = comisionesPendientes;
      liquidacion.estado = estado;
      liquidacion.notas = notas || '';
      liquidacion.fechaActualizacion = new Date();
    } else {
      // Crear nueva
      liquidacion = new LiquidacionComision({
        vendedor,
        mes,
        año,
        Liquidaciones: Liquidaciones.map((l: any) => ({
          ...l,
          vehiculoId: l.vehiculoId ? new mongoose.Types.ObjectId(l.vehiculoId) : undefined,
          fechaVenta: l.fechaVenta ? new Date(l.fechaVenta) : undefined,
          fechaLiquidacion: l.liquidada ? new Date() : undefined,
        })),
        totalComisiones,
        comisionesPagadas,
        comisionesPendientes,
        estado,
        notas: notas || '',
        creadoPor: userId!,
      });
    }

    await liquidacion.save();
    res.json(liquidacion);
  } catch (error) {
    console.error('Error creating liquidacion:', error);
    res.status(500).json({ message: 'Error al crear liquidación', error });
  }
};

// Liquidar una comisión específica
export const liquidarComision = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { liquidacionId, vehiculoId, placa } = req.body;

    const liquidacion = await LiquidacionComision.findById(liquidacionId);
    if (!liquidacion) {
      res.status(404).json({ message: 'Liquidación no encontrada' });
      return;
    }

    const item = liquidacion.Liquidaciones.find(l => 
      (vehiculoId && l.vehiculoId?.toString() === vehiculoId) || 
      (placa && l.placa === placa)
    );

    if (!item) {
      res.status(404).json({ message: 'Comisión no encontrada' });
      return;
    }

    item.liquidada = true;
    item.fechaLiquidacion = new Date();

    // Recalcular totales
    liquidacion.comisionesPagadas = liquidacion.Liquidaciones
      .filter(l => l.liquidada)
      .reduce((sum, l) => sum + l.comision, 0);
    liquidacion.comisionesPendientes = liquidacion.Liquidaciones
      .filter(l => !l.liquidada)
      .reduce((sum, l) => sum + l.comision, 0);

    if (liquidacion.comisionesPendientes === 0 && liquidacion.totalComisiones > 0) {
      liquidacion.estado = 'liquidado';
    } else if (liquidacion.comisionesPagadas > 0) {
      liquidacion.estado = 'parcial';
    }

    await liquidacion.save();
    res.json(liquidacion);
  } catch (error) {
    console.error('Error liquidando comision:', error);
    res.status(500).json({ message: 'Error al liquidar comisión', error });
  }
};

// Obtener una liquidación específica
export const getLiquidacionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const liquidacion = await LiquidacionComision.findById(id);
    
    if (!liquidacion) {
      res.status(404).json({ message: 'Liquidación no encontrada' });
      return;
    }

    res.json(liquidacion);
  } catch (error) {
    console.error('Error getting liquidacion:', error);
    res.status(500).json({ message: 'Error al obtener liquidación', error });
  }
};
