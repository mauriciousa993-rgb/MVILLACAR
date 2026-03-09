import { Response } from 'express';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import Vehicle from '../models/Vehicle';
import FixedExpense from '../models/FixedExpense';
import { AuthRequest } from '../types';
import { ensureUploadsDir } from '../utils/uploads';

type ExpenseRow = {
  fecha: Date;
  tipo: string;
  categoria: string;
  referencia: string;
  proveedor: string;
  descripcion: string;
  valor: number;
  metodo: string;
  soporte: string;
  aprobado: string;
  responsable: string;
  fechaVencimiento: Date;
};

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const getVehicleYear = (vehicle: any): number | string =>
  vehicle?.['año'] ?? vehicle?.['aÃ±o'] ?? vehicle?.anio ?? '';

const getResponsibleName = (vehicle: any): string => {
  if (vehicle?.registradoPor && typeof vehicle.registradoPor === 'object') {
    return vehicle.registradoPor.nombre || vehicle.registradoPor.email || 'N/A';
  }
  return 'N/A';
};

const getFixedExpenseResponsibleName = (expense: any): string => {
  if (expense?.registradoPor && typeof expense.registradoPor === 'object') {
    return expense.registradoPor.nombre || expense.registradoPor.email || 'N/A';
  }
  return 'N/A';
};

const getDaysBetween = (start?: Date | string, end?: Date | string): number => {
  if (!start) return 0;
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  return Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
};

const calculateVehicleTotalExpenses = (vehicle: any): number => {
  const gastos = vehicle?.gastos || {};
  const gastosGenerales =
    (gastos.pintura || 0) +
    (gastos.mecanica || 0) +
    (gastos.traspaso || 0) +
    (gastos.alistamiento || 0) +
    (gastos.tapiceria || 0) +
    (gastos.transporte || 0) +
    (gastos.varios || 0);

  const gastosInversionistas = (vehicle?.inversionistas || []).reduce((sum: number, inv: any) => {
    const totalInv = (inv?.gastos || []).reduce((acc: number, g: any) => acc + (g?.monto || 0), 0);
    return sum + totalInv;
  }, 0);

  return gastosGenerales + gastosInversionistas;
};

const getVehicleCost = (vehicle: any): number => (vehicle?.precioCompra || 0) + calculateVehicleTotalExpenses(vehicle);
const getVehicleUtility = (vehicle: any): number => (vehicle?.precioVenta || 0) - getVehicleCost(vehicle);

const addTitle = (sheet: ExcelJS.Worksheet, title: string, subtitle: string, periodLabel: string) => {
  sheet.mergeCells('A1:H1');
  sheet.mergeCells('A2:H2');

  const titleCell = sheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' },
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  const subtitleCell = sheet.getCell('A2');
  subtitleCell.value = `${subtitle} | Periodo: ${periodLabel}`;
  subtitleCell.font = { size: 11, color: { argb: 'FF4B5563' } };
  subtitleCell.alignment = { horizontal: 'left', vertical: 'middle' };

  sheet.getRow(1).height = 26;
  sheet.getRow(2).height = 20;
};

const styleHeaderRow = (sheet: ExcelJS.Worksheet, rowNumber: number) => {
  const row = sheet.getRow(rowNumber);
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDC2626' },
  };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
  row.height = 20;

  row.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
};

const addInstructionsSheet = (workbook: ExcelJS.Workbook, title: string, instructions: string[]) => {
  const sheet = workbook.addWorksheet('Instrucciones');
  sheet.columns = [
    { header: 'Campo', key: 'campo', width: 28 },
    { header: 'Recomendacion', key: 'recomendacion', width: 90 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' },
  };

  sheet.addRow({ campo: 'Plantilla', recomendacion: title });
  instructions.forEach((item, index) => {
    sheet.addRow({ campo: `Paso ${index + 1}`, recomendacion: item });
  });
};

const getWeekKey = (date: Date): string => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.ceil((dayOfYear + firstDay.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

export const exportBusinessTemplate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const rawType = (req.params.templateType || '').toString().trim().toLowerCase();
    const templateType = rawType
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');

    const selectedYear = Number.parseInt((req.query.year as string) || `${new Date().getFullYear()}`, 10);
    const selectedMonthInput = ((req.query.month as string) || '').toString().trim();

    let monthIndex: number | null = null;
    if (selectedMonthInput) {
      const maybeNumber = Number.parseInt(selectedMonthInput, 10);
      if (!Number.isNaN(maybeNumber) && maybeNumber >= 1 && maybeNumber <= 12) {
        monthIndex = maybeNumber - 1;
      } else {
        const normalizedMonth = normalizeText(selectedMonthInput);
        const idx = MONTH_NAMES.findIndex((month) => normalizeText(month) === normalizedMonth);
        monthIndex = idx >= 0 ? idx : null;
      }
    }

    const periodStart = monthIndex !== null
      ? new Date(selectedYear, monthIndex, 1)
      : new Date(selectedYear, 0, 1);
    const periodEnd = monthIndex !== null
      ? new Date(selectedYear, monthIndex + 1, 0, 23, 59, 59, 999)
      : new Date(selectedYear, 11, 31, 23, 59, 59, 999);

    const isDateInPeriod = (value?: Date | string): boolean => {
      if (!value) return false;
      const date = new Date(value);
      return date >= periodStart && date <= periodEnd;
    };

    const periodLabel = monthIndex !== null
      ? `${MONTH_NAMES[monthIndex]} ${selectedYear}`
      : `Ano ${selectedYear}`;

    const allVehicles = await Vehicle.find({})
      .populate('registradoPor', 'nombre email')
      .sort({ fechaIngreso: -1 })
      .lean();
    const allFixedExpenses = await FixedExpense.find({
      fechaInicio: { $lte: periodEnd },
      $or: [
        { activo: true },
        { fechaFin: { $gte: periodStart } },
      ],
    })
      .populate('registradoPor', 'nombre email')
      .sort({ createdAt: -1 })
      .lean();

    const soldVehiclesInPeriod = allVehicles.filter((vehicle: any) =>
      vehicle.estado === 'vendido' && isDateInPeriod(vehicle.fechaVenta)
    );

    const buildVehicleExpenseRows = (): ExpenseRow[] => {
      const result: ExpenseRow[] = [];
      const categories = ['pintura', 'mecanica', 'traspaso', 'alistamiento', 'tapiceria', 'transporte', 'varios'];

      allVehicles.forEach((vehicle: any) => {
        let hasDetailed = false;

        categories.forEach((category) => {
          const details = vehicle?.gastosDetallados?.[category] || [];
          if (details.length > 0) hasDetailed = true;

          details.forEach((item: any) => {
            const date = item?.fecha ? new Date(item.fecha) : new Date(vehicle.fechaIngreso || Date.now());
            result.push({
              fecha: date,
              tipo: 'Variable',
              categoria: category,
              referencia: vehicle?.placa || 'N/A',
              proveedor: item?.encargado || 'No definido',
              descripcion: item?.descripcion || `${category} ${vehicle?.placa || ''}`,
              valor: item?.monto || 0,
              metodo: 'Pendiente',
              soporte: '',
              aprobado: '',
              responsable: getResponsibleName(vehicle),
              fechaVencimiento: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 15),
            });
          });
        });

        if (!hasDetailed) {
          categories.forEach((category) => {
            const value = vehicle?.gastos?.[category] || 0;
            if (value > 0) {
              const date = new Date(vehicle.fechaIngreso || Date.now());
              result.push({
                fecha: date,
                tipo: 'Variable',
                categoria: category,
                referencia: vehicle?.placa || 'N/A',
                proveedor: 'No definido',
                descripcion: `Gasto resumido ${category}`,
                valor: value,
                metodo: 'Pendiente',
                soporte: '',
                aprobado: '',
                responsable: getResponsibleName(vehicle),
                fechaVencimiento: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 15),
              });
            }
          });
        }
      });

      return result.filter((row) => isDateInPeriod(row.fecha));
    };

    const buildFixedExpenseRows = (): ExpenseRow[] => {
      const result: ExpenseRow[] = [];
      const monthIndexes = monthIndex !== null ? [monthIndex] : Array.from({ length: 12 }, (_, index) => index);

      allFixedExpenses.forEach((expense: any) => {
        const startDate = expense?.fechaInicio ? new Date(expense.fechaInicio) : periodStart;
        const endDate = expense?.fechaFin ? new Date(expense.fechaFin) : null;
        const paymentDay = Math.max(1, Math.min(31, Number(expense?.diaPago || 1)));

        monthIndexes.forEach((monthToProcess) => {
          const maxDay = new Date(selectedYear, monthToProcess + 1, 0).getDate();
          const dueDate = new Date(selectedYear, monthToProcess, Math.min(paymentDay, maxDay));

          if (dueDate < startDate) return;
          if (endDate && dueDate > endDate) return;
          if (!isDateInPeriod(dueDate)) return;

          result.push({
            fecha: dueDate,
            tipo: 'Fijo',
            categoria: expense?.categoria || 'otros',
            referencia: 'OPERACION',
            proveedor: expense?.proveedor || 'No definido',
            descripcion: expense?.nombre || 'Gasto fijo',
            valor: Number(expense?.monto || 0),
            metodo: expense?.metodoPago || 'Pendiente',
            soporte: '',
            aprobado: '',
            responsable: getFixedExpenseResponsibleName(expense),
            fechaVencimiento: new Date(
              dueDate.getFullYear(),
              dueDate.getMonth(),
              Math.min(dueDate.getDate() + 5, maxDay)
            ),
          });
        });
      });

      return result;
    };

    const variableExpensesInPeriod = buildVehicleExpenseRows();
    const fixedExpensesInPeriod = buildFixedExpenseRows();
    const expensesInPeriod = [...variableExpensesInPeriod, ...fixedExpensesInPeriod]
      .filter((row) => isDateInPeriod(row.fecha))
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AutoTech';
    workbook.created = new Date();

    let fileBaseName = 'plantilla-autotech';

    switch (templateType) {
      case 'inventario':
      case 'inventario-maestro': {
        fileBaseName = 'plantilla-inventario-maestro';
        const sheet = workbook.addWorksheet('Inventario Maestro');
        addTitle(sheet, 'PLANTILLA INVENTARIO MAESTRO', 'Datos reales del inventario de la aplicacion', periodLabel);
        sheet.columns = [
          { header: 'ID Interno', key: 'idInterno', width: 14 },
          { header: 'Fecha Ingreso', key: 'fechaIngreso', width: 14 },
          { header: 'Placa', key: 'placa', width: 12 },
          { header: 'Marca', key: 'marca', width: 14 },
          { header: 'Modelo', key: 'modelo', width: 16 },
          { header: 'Ano', key: 'anio', width: 8 },
          { header: 'Color', key: 'color', width: 12 },
          { header: 'Kilometraje', key: 'km', width: 14 },
          { header: 'Precio Compra', key: 'precioCompra', width: 16 },
          { header: 'Gasto Total', key: 'gastoTotal', width: 14 },
          { header: 'Costo Total', key: 'costoTotal', width: 14 },
          { header: 'Precio Venta', key: 'precioVenta', width: 16 },
          { header: 'Utilidad Proyectada', key: 'utilidad', width: 18 },
          { header: 'Estado', key: 'estado', width: 16 },
          { header: 'Dias en Inventario', key: 'dias', width: 16 },
          { header: 'Responsable', key: 'responsable', width: 18 },
          { header: 'Observaciones', key: 'obs', width: 32 },
        ];

        const headerRow = sheet.getRow(4);
        headerRow.values = sheet.columns.map((col: any) => col.header);
        styleHeaderRow(sheet, 4);

        allVehicles.forEach((vehicle: any, index) => {
          const gastosTotal = calculateVehicleTotalExpenses(vehicle);
          const costoTotal = (vehicle?.precioCompra || 0) + gastosTotal;
          sheet.addRow([
            `AT-${String(index + 1).padStart(4, '0')}`,
            vehicle?.fechaIngreso ? new Date(vehicle.fechaIngreso).toLocaleDateString('es-CO') : '',
            vehicle?.placa || '',
            vehicle?.marca || '',
            vehicle?.modelo || '',
            getVehicleYear(vehicle),
            vehicle?.color || '',
            vehicle?.kilometraje || 0,
            vehicle?.precioCompra || 0,
            gastosTotal,
            costoTotal,
            vehicle?.precioVenta || 0,
            (vehicle?.precioVenta || 0) - costoTotal,
            vehicle?.estado || '',
            getDaysBetween(vehicle?.fechaIngreso, vehicle?.estado === 'vendido' ? vehicle?.fechaVenta : undefined),
            getResponsibleName(vehicle),
            vehicle?.observaciones || '',
          ]);
        });

        ['precioCompra', 'gastoTotal', 'costoTotal', 'precioVenta', 'utilidad'].forEach((key) => {
          sheet.getColumn(key).numFmt = '"$"#,##0';
        });
        sheet.views = [{ state: 'frozen', ySplit: 4 }];

        addInstructionsSheet(workbook, 'Inventario Maestro', [
          'La hoja llega precargada con todos los vehiculos de tu aplicacion.',
          'Descarga nuevamente para reflejar cambios en tiempo real.',
          'Filtra por estado y responsable para seguimiento operativo.',
        ]);
        break;
      }

      case 'ventas':
      case 'registro-ventas': {
        fileBaseName = 'plantilla-registro-ventas';
        const sheet = workbook.addWorksheet('Registro Ventas');
        addTitle(sheet, 'PLANTILLA REGISTRO DE VENTAS', 'Ventas reales del periodo seleccionado', periodLabel);
        sheet.columns = [
          { header: 'Fecha Venta', key: 'fechaVenta', width: 14 },
          { header: 'Placa', key: 'placa', width: 12 },
          { header: 'Cliente', key: 'cliente', width: 24 },
          { header: 'Canal', key: 'canal', width: 16 },
          { header: 'Asesor', key: 'asesor', width: 18 },
          { header: 'Precio Venta', key: 'precioVenta', width: 16 },
          { header: 'Costo Total', key: 'costoTotal', width: 16 },
          { header: 'Utilidad', key: 'utilidad', width: 14 },
          { header: 'Forma Pago', key: 'pago', width: 16 },
          { header: 'Comision', key: 'comision', width: 14 },
          { header: 'Utilidad Neta', key: 'utilidadNeta', width: 16 },
          { header: 'Observaciones', key: 'obs', width: 30 },
        ];

        const headerRow = sheet.getRow(4);
        headerRow.values = sheet.columns.map((col: any) => col.header);
        styleHeaderRow(sheet, 4);

        soldVehiclesInPeriod.forEach((vehicle: any) => {
          const costoTotal = getVehicleCost(vehicle);
          const utilidad = getVehicleUtility(vehicle);
          const comision = 0;
          sheet.addRow([
            vehicle?.fechaVenta ? new Date(vehicle.fechaVenta).toLocaleDateString('es-CO') : '',
            vehicle?.placa || '',
            vehicle?.datosVenta?.comprador?.nombre || 'No registrado',
            'Directo',
            getResponsibleName(vehicle),
            vehicle?.precioVenta || 0,
            costoTotal,
            utilidad,
            vehicle?.datosVenta?.transaccion?.formaPago || 'No especificado',
            comision,
            utilidad - comision,
            vehicle?.observaciones || '',
          ]);
        });

        ['precioVenta', 'costoTotal', 'utilidad', 'comision', 'utilidadNeta'].forEach((key) => {
          sheet.getColumn(key).numFmt = '"$"#,##0';
        });
        sheet.views = [{ state: 'frozen', ySplit: 4 }];

        addInstructionsSheet(workbook, 'Registro de Ventas', [
          'Se incluyen solo vehiculos vendidos en el periodo filtrado.',
          'Puedes complementar comision y notas comerciales.',
        ]);
        break;
      }

      case 'gastos':
      case 'control-gastos': {
        fileBaseName = 'plantilla-control-gastos';
        const sheet = workbook.addWorksheet('Control Gastos');
        addTitle(sheet, 'PLANTILLA CONTROL DE GASTOS', 'Gastos registrados en la aplicacion', periodLabel);
        sheet.columns = [
          { header: 'Fecha', key: 'fecha', width: 14 },
          { header: 'Tipo Gasto', key: 'tipo', width: 18 },
          { header: 'Categoria', key: 'categoria', width: 18 },
          { header: 'Centro Costo', key: 'centro', width: 16 },
          { header: 'Vehiculo/Proyecto', key: 'referencia', width: 18 },
          { header: 'Proveedor', key: 'proveedor', width: 24 },
          { header: 'Descripcion', key: 'descripcion', width: 32 },
          { header: 'Valor', key: 'valor', width: 14 },
          { header: 'Metodo Pago', key: 'metodo', width: 14 },
          { header: 'Soporte', key: 'soporte', width: 14 },
          { header: 'Aprobado Por', key: 'aprobado', width: 16 },
        ];

        const headerRow = sheet.getRow(4);
        headerRow.values = sheet.columns.map((col: any) => col.header);
        styleHeaderRow(sheet, 4);

        expensesInPeriod.forEach((expense) => {
          sheet.addRow([
            expense.fecha ? new Date(expense.fecha).toLocaleDateString('es-CO') : '',
            expense.tipo,
            expense.categoria,
            'Operacion',
            expense.referencia,
            expense.proveedor,
            expense.descripcion,
            expense.valor,
            expense.metodo,
            expense.soporte,
            expense.aprobado,
          ]);
        });

        sheet.getColumn('valor').numFmt = '"$"#,##0';
        sheet.views = [{ state: 'frozen', ySplit: 4 }];

        addInstructionsSheet(workbook, 'Control de Gastos', [
          'Se alimenta con gastos variables por vehiculo y gastos fijos mensuales.',
          'Filtra por categoria para encontrar sobrecostos.',
        ]);
        break;
      }

      case 'flujo-caja':
      case 'flujo-de-caja': {
        fileBaseName = 'plantilla-flujo-caja';
        const sheet = workbook.addWorksheet('Flujo Caja');
        addTitle(sheet, 'PLANTILLA FLUJO DE CAJA', 'Ingresos y egresos semanales del periodo', periodLabel);
        sheet.columns = [
          { header: 'Semana', key: 'semana', width: 16 },
          { header: 'Saldo Inicial', key: 'saldoInicial', width: 16 },
          { header: 'Ingresos', key: 'ingresos', width: 14 },
          { header: 'Egresos', key: 'egresos', width: 14 },
          { header: 'Saldo Final', key: 'saldoFinal', width: 16 },
          { header: 'Meta Minima Caja', key: 'meta', width: 18 },
          { header: 'Desviacion', key: 'desviacion', width: 14 },
          { header: 'Accion', key: 'accion', width: 26 },
        ];

        const headerRow = sheet.getRow(4);
        headerRow.values = sheet.columns.map((col: any) => col.header);
        styleHeaderRow(sheet, 4);

        const weeklyMap = new Map<string, { ingresos: number; egresos: number }>();

        soldVehiclesInPeriod.forEach((vehicle: any) => {
          if (!vehicle?.fechaVenta) return;
          const key = getWeekKey(new Date(vehicle.fechaVenta));
          const current = weeklyMap.get(key) || { ingresos: 0, egresos: 0 };
          current.ingresos += vehicle?.precioVenta || 0;
          weeklyMap.set(key, current);
        });

        expensesInPeriod.forEach((expense) => {
          const key = getWeekKey(new Date(expense.fecha));
          const current = weeklyMap.get(key) || { ingresos: 0, egresos: 0 };
          current.egresos += expense?.valor || 0;
          weeklyMap.set(key, current);
        });

        const sortedWeeks = Array.from(weeklyMap.keys()).sort();
        let runningBalance = 0;

        if (sortedWeeks.length === 0) {
          sheet.addRow(['Sin datos', 0, 0, 0, 0, 0, 0, 'Sin movimiento en el periodo']);
        } else {
          sortedWeeks.forEach((weekKey) => {
            const values = weeklyMap.get(weekKey)!;
            const saldoInicial = runningBalance;
            const saldoFinal = saldoInicial + values.ingresos - values.egresos;
            const meta = Math.max(0, values.egresos);
            const desviacion = saldoFinal - meta;
            const accion = desviacion < 0 ? 'Reducir egresos / acelerar cobros' : 'Operacion estable';
            sheet.addRow([weekKey, saldoInicial, values.ingresos, values.egresos, saldoFinal, meta, desviacion, accion]);
            runningBalance = saldoFinal;
          });
        }

        ['saldoInicial', 'ingresos', 'egresos', 'saldoFinal', 'meta', 'desviacion'].forEach((key) => {
          sheet.getColumn(key).numFmt = '"$"#,##0';
        });
        sheet.views = [{ state: 'frozen', ySplit: 4 }];

        addInstructionsSheet(workbook, 'Flujo de Caja', [
          'Ingresos: ventas de vehiculos vendidos en el periodo.',
          'Egresos: gastos variables y gastos fijos registrados en el periodo.',
          'Desviacion negativa indica riesgo de liquidez.',
        ]);
        break;
      }

      case 'kpi':
      case 'kpi-gerencial': {
        fileBaseName = 'plantilla-kpi-gerencial';
        const sheet = workbook.addWorksheet('KPI Gerencial');
        addTitle(sheet, 'PLANTILLA KPI GERENCIAL', 'Indicadores calculados con la informacion real', periodLabel);
        sheet.columns = [
          { header: 'Mes', key: 'mes', width: 14 },
          { header: 'Vehiculos Comprados', key: 'comprados', width: 18 },
          { header: 'Vehiculos Vendidos', key: 'vendidos', width: 18 },
          { header: 'Rotacion (dias)', key: 'rotacion', width: 16 },
          { header: 'Ticket Promedio', key: 'ticket', width: 16 },
          { header: 'Margen Bruto %', key: 'margen', width: 14 },
          { header: 'Gasto Operativo %', key: 'gasto', width: 16 },
          { header: 'Cumplimiento Meta %', key: 'cumplimiento', width: 18 },
          { header: 'Alertas', key: 'alertas', width: 34 },
        ];

        const headerRow = sheet.getRow(4);
        headerRow.values = sheet.columns.map((col: any) => col.header);
        styleHeaderRow(sheet, 4);

        const monthsToProcess = monthIndex !== null ? [monthIndex] : Array.from({ length: 12 }, (_, i) => i);
        const getFixedExpensesForMonth = (monthToProcess: number): number =>
          fixedExpensesInPeriod
            .filter((expense) =>
              expense.fecha.getFullYear() === selectedYear && expense.fecha.getMonth() === monthToProcess
            )
            .reduce((sum, expense) => sum + (expense.valor || 0), 0);

        monthsToProcess.forEach((mIndex) => {
          const monthStart = new Date(selectedYear, mIndex, 1);
          const monthEnd = new Date(selectedYear, mIndex + 1, 0, 23, 59, 59, 999);
          const inMonth = (value?: Date | string) => {
            if (!value) return false;
            const date = new Date(value);
            return date >= monthStart && date <= monthEnd;
          };

          const purchased = allVehicles.filter((v: any) => inMonth(v.fechaIngreso));
          const sold = allVehicles.filter((v: any) => v.estado === 'vendido' && inMonth(v.fechaVenta));

          const totalSales = sold.reduce((sum: number, v: any) => sum + (v?.precioVenta || 0), 0);
          const totalCost = sold.reduce((sum: number, v: any) => sum + getVehicleCost(v), 0);
          const fixedCost = getFixedExpensesForMonth(mIndex);
          const totalUtility = sold.reduce((sum: number, v: any) => sum + getVehicleUtility(v), 0);
          const avgRotation = sold.length > 0
            ? sold.reduce((sum: number, v: any) => sum + getDaysBetween(v.fechaIngreso, v.fechaVenta), 0) / sold.length
            : 0;
          const avgTicket = sold.length > 0 ? totalSales / sold.length : 0;
          const grossMargin = totalSales > 0 ? totalUtility / totalSales : 0;
          const expenseRate = totalSales > 0 ? (totalCost + fixedCost) / totalSales : 0;
          const compliance = purchased.length > 0 ? sold.length / purchased.length : 0;

          let alertMessage = 'Indicadores dentro de rango';
          if (avgRotation > 60) alertMessage = 'Rotacion alta: revisar inventario y pricing';
          else if (grossMargin < 0.08) alertMessage = 'Margen bajo: controlar costos';

          sheet.addRow([
            MONTH_NAMES[mIndex],
            purchased.length,
            sold.length,
            Math.round(avgRotation),
            avgTicket,
            grossMargin,
            expenseRate,
            compliance,
            alertMessage,
          ]);
        });

        sheet.getColumn('ticket').numFmt = '"$"#,##0';
        ['margen', 'gasto', 'cumplimiento'].forEach((key) => {
          sheet.getColumn(key).numFmt = '0.00%';
        });
        sheet.views = [{ state: 'frozen', ySplit: 4 }];

        addInstructionsSheet(workbook, 'KPI Gerencial', [
          'Calculado automaticamente desde compras, ventas, gastos variables y gastos fijos.',
          'Usa el filtro de mes para analizar cierres puntuales.',
        ]);
        break;
      }

      case 'cuentas':
      case 'cuentas-cobrar-pagar': {
        fileBaseName = 'plantilla-cuentas-cobrar-pagar';
        const sheet = workbook.addWorksheet('CxC - CxP');
        addTitle(sheet, 'PLANTILLA CUENTAS POR COBRAR Y PAGAR', 'Cartera alimentada desde ventas y gastos', periodLabel);
        sheet.columns = [
          { header: 'Tipo', key: 'tipo', width: 12 },
          { header: 'Fecha Documento', key: 'fechaDoc', width: 16 },
          { header: 'Fecha Vencimiento', key: 'fechaVenc', width: 18 },
          { header: 'Tercero', key: 'tercero', width: 26 },
          { header: 'Concepto', key: 'concepto', width: 30 },
          { header: 'Valor', key: 'valor', width: 14 },
          { header: 'Estado', key: 'estado', width: 12 },
          { header: 'Dias Vencido', key: 'dias', width: 14 },
          { header: 'Responsable', key: 'responsable', width: 18 },
        ];

        const headerRow = sheet.getRow(4);
        headerRow.values = sheet.columns.map((col: any) => col.header);
        styleHeaderRow(sheet, 4);

        const now = new Date();

        soldVehiclesInPeriod.forEach((vehicle: any) => {
          const saleDate = vehicle?.fechaVenta ? new Date(vehicle.fechaVenta) : new Date();
          const dueDate = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate() + 30);
          const paymentMethod = (vehicle?.datosVenta?.transaccion?.formaPago || '').toLowerCase();
          const isPending = paymentMethod.includes('credito') || paymentMethod.includes('financi');
          const status = isPending ? 'Pendiente' : 'Pagado';
          const overdueDays = isPending && dueDate < now
            ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          sheet.addRow([
            'CxC',
            saleDate.toLocaleDateString('es-CO'),
            dueDate.toLocaleDateString('es-CO'),
            vehicle?.datosVenta?.comprador?.nombre || 'Cliente no registrado',
            `Venta vehiculo ${vehicle?.placa || ''}`,
            vehicle?.precioVenta || 0,
            status,
            overdueDays,
            getResponsibleName(vehicle),
          ]);
        });

        expensesInPeriod.forEach((expense) => {
          const overdueDays = expense.fechaVencimiento < now
            ? Math.floor((now.getTime() - expense.fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          sheet.addRow([
            'CxP',
            new Date(expense.fecha).toLocaleDateString('es-CO'),
            expense.fechaVencimiento.toLocaleDateString('es-CO'),
            expense.proveedor,
            `${expense.categoria} - ${expense.referencia}`,
            expense.valor,
            'Pendiente',
            overdueDays,
            expense.responsable,
          ]);
        });

        sheet.getColumn('valor').numFmt = '"$"#,##0';
        sheet.views = [{ state: 'frozen', ySplit: 4 }];

        addInstructionsSheet(workbook, 'CxC / CxP', [
          'CxC se carga desde ventas del periodo.',
          'CxP se carga desde gastos variables y gastos fijos del periodo.',
          'Prioriza gestion por dias vencidos.',
        ]);
        break;
      }

      default: {
        res.status(400).json({
          message: 'Tipo de plantilla no soportado',
          supportedTemplates: [
            'inventario',
            'ventas',
            'gastos',
            'flujo-caja',
            'kpi-gerencial',
            'cuentas-cobrar-pagar',
          ],
        });
        return;
      }
    }

    const fileName = `${fileBaseName}-${Date.now()}.xlsx`;
    const filePath = path.join(ensureUploadsDir(), fileName);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error al descargar plantilla:', err);
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al exportar plantilla profesional',
      error: error.message,
    });
  }
};
