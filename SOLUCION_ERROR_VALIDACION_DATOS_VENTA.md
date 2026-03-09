# Solución al Error de Validación al Actualizar Datos de Venta

## Problema
La aplicación presentaba un error de validación al intentar actualizar los datos de venta de un vehículo ya vendido. El error ocurría porque el esquema de Mongoose tenía validaciones estrictas que no permitían la actualización parcial de datos.

## Causa Raíz
1. El esquema de `datosVenta` en el modelo Vehicle no estaba configurado para permitir actualizaciones parciales
2. La lógica de merge de datos no manejaba correctamente los valores undefined/null
3. Faltaban valores por defecto en algunos campos obligatorios

## Solución Implementada

### 1. Modificación del Modelo Vehicle (`backend/src/models/Vehicle.ts`)

**Cambios realizados:**
- Se agregó `type: { ... }` explícito al esquema de `datosVenta` para mejor validación
- Se agregaron valores por defecto a todos los campos:
  - `numeroPuertas`: default 4 (antes 0)
  - `tipoServicio`: default 'PARTICULAR'
  - `fechaCelebracion`: default Date.now
  - `fechaEntrega`: default Date.now
  - `diasTraspaso`: default 30 con min: 1, max: 365
- Se agregó `default: undefined` al campo completo para permitir que sea opcional inicialmente

### 2. Mejora del Controlador (`backend/src/controllers/vehicle.controller.ts`)

**Cambios en la función `saveSaleData`:**
- Se mejoró la función `normalizeNumber` para manejar undefined/null
- Se mejoró la función `normalizeDate` para siempre retornar una fecha válida
- Se mejoró la función `sanitizeText` para manejar valores no-string
- Se implementó una función `mergeObject` que:
  - Toma valores por defecto
  - Aplica datos existentes (si hay)
  - Aplica nuevos datos (sobrescribiendo solo los que no son vacíos)
- Se agregó sanitización de texto a todos los campos antes de guardar
- Se mejoró el manejo de errores para mostrar información más detallada

### 3. Script de Prueba (`backend/scripts/test-update-sale-data.js`)

Se creó un script completo que permite:
- Probar el guardado de datos completos
- Probar la actualización parcial de datos
- Verificar que el merge funcione correctamente
- Validar que los datos existentes se preserven

## Cómo Probar

### Opción 1: Usar el script de prueba
```bash
cd backend
node scripts/test-update-sale-data.js <VEHICLE_ID>
```

### Opción 2: Probar manualmente
1. Abrir la aplicación en el navegador
2. Ir a la lista de vehículos
3. Seleccionar un vehículo vendido
4. Click en "Ver/Editar Datos de Venta"
5. Modificar algunos campos (no todos)
6. Guardar cambios
7. Verificar que:
   - Los campos modificados se actualizaron
   - Los campos no modificados se preservaron
   - No hay errores de validación

## Cambios en el Comportamiento

### Antes
- ❌ Error de validación al actualizar datos parciales
- ❌ Se perdían datos existentes si no se enviaban todos los campos
- ❌ Fechas podían quedar en null causando errores

### Después
- ✅ Se pueden actualizar campos individuales sin perder los demás
- ✅ El merge de datos funciona correctamente
- ✅ Todos los campos tienen valores por defecto válidos
- ✅ Mejor manejo de errores con mensajes descriptivos

## Archivos Modificados
1. `backend/src/models/Vehicle.ts` - Esquema de datos de venta
2. `backend/src/controllers/vehicle.controller.ts` - Lógica de guardado
3. `backend/scripts/test-update-sale-data.js` - Script de prueba (nuevo)

## Notas de Implementación
- La solución es retrocompatible con datos existentes
- No requiere migración de base de datos
- Los valores por defecto solo se aplican a nuevos documentos o actualizaciones
- La fecha de venta solo se establece en la primera venta, no en actualizaciones
