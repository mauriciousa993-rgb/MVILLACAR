# Plantilla de Control de Gastos en Excel

## Descripción

Nueva funcionalidad que permite descargar una plantilla de Excel para el control detallado de gastos de cada vehículo, organizada por categorías con formato profesional.

## Características

### 📊 Formato de la Plantilla

La plantilla incluye **7 secciones de gastos**, cada una con:
- **Título de sección** con color distintivo
- **Columnas:** Descripción, Encargado, Fecha
- **6 filas** para registrar gastos detallados
- **Bordes** en todas las celdas para fácil impresión

### 🎨 Secciones Incluidas

1. **LÁMINA Y PINTURA** (Verde claro - #92D050)
   - Para gastos de latonería y pintura
   - Reparaciones de carrocería
   - Trabajos de pintura

2. **MECÁNICA** (Naranja - #FFC000)
   - Reparaciones mecánicas
   - Cambio de piezas
   - Mantenimiento del motor

3. **ALISTAMIENTO** (Verde - #00B050)
   - Preparación del vehículo
   - Limpieza profunda
   - Detailing

4. **TAPICERÍA** (Rosa - #FF6B9D)
   - Reparación de asientos
   - Cambio de tapizado
   - Acabados interiores

5. **TRANSPORTE** (Cyan - #00B0F0)
   - Traslado del vehículo
   - Grúa
   - Gastos de movilización

6. **TRASPASO** (Morado - #7030A0)
   - Gastos de traspaso
   - Impuestos
   - Trámites legales

7. **VARIOS** (Gris - #C0C0C0)
   - Otros gastos no categorizados
   - Gastos misceláneos

## Cómo Usar

### Desde la Aplicación:

1. **Ir a "Inventario de Vehículos"**
2. **Expandir** el vehículo deseado (click en la tarjeta)
3. **Click en "Plantilla Gastos"** (botón morado)
4. Se descargará un archivo Excel: `gastos-[PLACA]-[TIMESTAMP].xlsx`

### En el Excel Descargado:

1. **Encabezado:** Muestra marca, modelo y placa del vehículo
2. **Para cada sección:**
   - Llenar la columna "DESCRIPCION" con el detalle del gasto
   - Llenar "ENCARGADO" con quién realizó o autorizó el gasto
   - Llenar "FECHA" con la fecha del gasto
3. **Imprimir o compartir** según necesidad

## Ejemplo de Uso

### Sección: LÁMINA Y PINTURA
| DESCRIPCION | ENCARGADO | FECHA |
|-------------|-----------|-------|
| Reparación puerta trasera | Juan Pérez | 15/01/2024 |
| Pintura completa | Taller ABC | 20/01/2024 |
| Pulida y encerado | María López | 22/01/2024 |

### Sección: MECÁNICA
| DESCRIPCION | ENCARGADO | FECHA |
|-------------|-----------|-------|
| Cambio de aceite | Mecánico Carlos | 10/01/2024 |
| Reparación frenos | Taller XYZ | 12/01/2024 |
| Alineación y balanceo | Serviteca | 14/01/2024 |

## Beneficios

✅ **Control Detallado:** Registro preciso de cada gasto
✅ **Trazabilidad:** Saber quién autorizó cada gasto
✅ **Organización:** Gastos categorizados por tipo
✅ **Profesional:** Formato listo para imprimir o compartir
✅ **Fácil de Usar:** Plantilla pre-formateada
✅ **Colores Distintivos:** Fácil identificación visual

## Diferencia con Reporte Completo

### Plantilla de Gastos:
- ✅ Formato para **llenar manualmente**
- ✅ Organizado por **categorías de gastos**
- ✅ Incluye columnas: Descripción, Encargado, Fecha
- ✅ **6 filas vacías** por categoría para completar
- ✅ Ideal para **control operativo**

### Reporte Completo:
- ✅ Información **completa del vehículo**
- ✅ Datos financieros calculados
- ✅ Inversionistas y distribución
- ✅ Documentación y estado
- ✅ Ideal para **presentación y análisis**

## Implementación Técnica

### Backend:
- **Archivo:** `backend/src/controllers/vehicle.controller.ts`
- **Función:** `exportExpensesTemplate`
- **Ruta:** `GET /api/vehicles/:id/expenses-template`
- **Librería:** ExcelJS

### Frontend:
- **Archivo:** `frontend/src/pages/VehicleList.tsx`
- **Botón:** "Plantilla Gastos" (morado)
- **Ubicación:** Sección de acciones en vista expandida

### Rutas:
- **Archivo:** `backend/src/routes/vehicle.routes.ts`
- **Endpoint:** `/:id/expenses-template`

## Estructura del Código

```typescript
// Crear sección con formato
const createSection = (title: string, color: string, rows: number = 6) => {
  // Título con color de fondo
  // Encabezados: DESCRIPCION, ENCARGADO, FECHA
  // Filas vacías con bordes
  // Espacio entre secciones
};

// Crear todas las secciones
createSection('LAMINA Y PINTURA', 'FF92D050', 6);
createSection('MECANICA', 'FFFFC000', 6);
createSection('ALISTAMIENTO', 'FF00B050', 6);
createSection('TAPICERIA', 'FFFF6B9D', 6);
createSection('TRANSPORTE', 'FF00B0F0', 6);
createSection('TRASPASO', 'FF7030A0', 6);
createSection('VARIOS', 'FFC0C0C0', 6);
```

## Casos de Uso

### 1. Control Operativo
- Registrar gastos diarios del taller
- Llevar control de quién autoriza cada gasto
- Fechas exactas de cada transacción

### 2. Auditoría
- Revisar gastos históricos
- Verificar autorizaciones
- Análisis de costos por categoría

### 3. Reportes a Inversionistas
- Mostrar transparencia en gastos
- Detallar en qué se invirtió
- Justificar costos

### 4. Planificación
- Estimar gastos futuros
- Comparar con vehículos similares
- Optimizar procesos

## Próximos Pasos

Para usar la plantilla:

1. **Descargar** la plantilla desde la lista de vehículos
2. **Llenar** los datos de gastos conforme ocurran
3. **Guardar** el archivo para referencia
4. **Compartir** con inversionistas o equipo si es necesario

## Notas Importantes

- La plantilla es **independiente** del sistema
- Los datos llenados **no se sincronizan** automáticamente
- Es una herramienta de **control manual**
- Complementa el registro de gastos en la aplicación
- Útil para **documentación física** o respaldo

## Fecha de Implementación
**Versión:** 2.1.0
**Fecha:** ${new Date().toLocaleDateString('es-CO')}
