# Cómo Vender un Vehículo y Generar Contrato

## 📋 Flujo Actual del Sistema

El sistema tiene **DOS formas** de marcar un vehículo como vendido e ingresar los datos del contrato:

### Opción 1: Desde el Formulario de Edición (VehicleForm)
1. Editar el vehículo
2. Cambiar estado a "Vendido"
3. Ingresar fecha de venta
4. Guardar

**NOTA:** Esta opción solo marca el vehículo como vendido, pero NO permite ingresar los datos del contrato directamente.

### Opción 2: Desde la Lista de Vehículos (RECOMENDADO) ✅
1. Ir a la lista de vehículos
2. Buscar el vehículo que quieres vender
3. Click en el botón verde **"Vender Vehículo"** (ícono de dólar $)
4. Se abre un modal completo con todos los campos del contrato:
   - Datos del vendedor
   - Datos del comprador
   - Datos adicionales del vehículo
   - Datos de la transacción
5. Llenar todos los campos
6. Click en "Guardar y Marcar como Vendido"
7. El vehículo se marca automáticamente como vendido con todos los datos

## 🎯 Flujo Recomendado

```
1. Crear/Editar Vehículo
   ↓
2. Guardar con estado "Listo para Venta" o "En Negociación"
   ↓
3. Cuando se venda, ir a Lista de Vehículos
   ↓
4. Click en "Vender Vehículo" (botón verde con $)
   ↓
5. Llenar formulario completo del contrato
   ↓
6. Guardar → Vehículo marcado como vendido + datos guardados
   ↓
7. Generar contrato (botón "Generar Contrato")
```

## 📝 Campos del Formulario de Venta

### Datos del Vendedor
- Nombre completo *
- Cédula/NIT *
- Dirección *
- Teléfono *

### Datos del Comprador
- Nombre completo *
- Cédula/NIT *
- Dirección *
- Teléfono *
- Email *

### Datos Adicionales del Vehículo
- Tipo de carrocería
- Capacidad
- Número de puertas
- Número de motor
- Línea
- Acta/Manifiesto
- Sitio de matrícula
- Tipo de servicio (PARTICULAR/PÚBLICO/OFICIAL/DIPLOMÁTICO)

### Datos de la Transacción
- Lugar de celebración *
- Fecha de celebración *
- Precio en letras * (Ej: CINCUENTA MILLONES DE PESOS)
- Forma de pago * (Ej: Pago de contado en efectivo)
- Vendedor anterior
- Cédula vendedor anterior
- Días para traspaso * (default: 30)
- Fecha de entrega *
- Hora de entrega
- Domicilio contractual *
- Cláusulas adicionales

## 🔧 Ubicación de los Botones

### En la Lista de Vehículos:

**Para vehículos NO vendidos:**
- Botón verde "Vender Vehículo" (con ícono $)

**Para vehículos vendidos:**
- Botón morado "Generar Contrato" (con ícono de documento)

## ⚠️ Importante

- Los campos marcados con * son obligatorios
- El precio en letras debe escribirse en MAYÚSCULAS
- La fecha de venta se usa para reportes mensuales
- Una vez guardados los datos de venta, se puede generar el contrato en Word

## 🎨 Mejora Futura (Opcional)

Si quieres poder ingresar los datos del contrato directamente desde VehicleForm cuando cambias el estado a "vendido", se puede agregar, pero haría el formulario muy largo. 

La solución actual (usar el modal desde VehicleList) es más limpia y mantiene el formulario de edición más simple.

## 📊 Resumen

**Flujo Actual:**
1. VehicleForm → Cambiar estado a "vendido" + fecha → Guardar
2. VehicleList → Click "Vender Vehículo" → Llenar datos → Guardar
3. VehicleList → Click "Generar Contrato" → Descargar Word

**Ventajas:**
- ✅ Formulario de edición más simple
- ✅ Modal dedicado para datos de venta
- ✅ Mejor experiencia de usuario
- ✅ Menos scroll en el formulario principal
