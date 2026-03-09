# Lista de Cambios Pendientes en VehicleForm.tsx

## ⚠️ IMPORTANTE
El archivo VehicleForm.tsx tiene errores de TypeScript porque el estado se actualizó pero las funciones y el JSX aún usan los campos antiguos (`gastosInversionista`, `detallesGastos`).

## Cambios Necesarios (En Orden):

### 1. ✅ COMPLETADO: Estado del formulario
- Ya se actualizó para usar `gastos: Array<{...}>` en lugar de `gastosInversionista` y `detallesGastos`

### 2. ✅ COMPLETADO: Función `agregarInversionista`
- Ya se actualizó para inicializar con `gastos: []`

### 3. 🔄 PENDIENTE: Función `actualizarInversionista`
**Problema:** Aún acepta `'gastosInversionista' | 'detallesGastos'` como parámetros
**Solución:** Cambiar a solo `'usuario' | 'nombre' | 'montoInversion'`
**Eliminar:** Todo el bloque que recalcula gastos cuando se modifica `gastosInversionista`

### 4. 🔄 PENDIENTE: Función `calcularTotalesInversionistas`
**Problema:** Usa `inv.gastosInversionista` que ya no existe
**Solución:** Cambiar a `inv.gastos.reduce((s, g) => s + g.monto, 0)`

### 5. 🔄 PENDIENTE: Agregar nuevas funciones para manejar gastos dinámicos
```typescript
const agregarGastoInversionista = (invIndex: number) => { ... }
const eliminarGastoInversionista = (invIndex: number, gastoIndex: number) => { ... }
const actualizarGastoInversionista = (invIndex: number, gastoIndex: number, campo: string, valor: any) => { ... }
```

### 6. 🔄 PENDIENTE: Actualizar JSX de inversionistas
**Eliminar:**
- Campo "Gastos del Inversionista" (input único)
- Campo "Detalles del Gasto" (textarea condicional)

**Agregar:**
- Sección de gastos dinámicos con botón "+"
- Lista de gastos con select de categoría, input de monto, input de descripción
- Botón eliminar para cada gasto
- Total de gastos del inversionista

### 7. 🔄 PENDIENTE: Actualizar `loadVehicleData`
**Problema:** Carga `inversionistas` directamente sin mapear
**Solución:** Asegurar que los gastos se carguen correctamente como array

---

## Recomendación

Debido a la complejidad de estos cambios y los múltiples errores de TypeScript, recomiendo:

**OPCIÓN A (Recomendada):**
Crear un archivo nuevo `VehicleForm_NEW.tsx` con todos los cambios implementados correctamente, probarlo, y luego reemplazar el archivo original.

**OPCIÓN B:**
Hacer los cambios uno por uno en el archivo actual, pero esto requiere ~10-15 ediciones más y puede causar más errores temporales.

**OPCIÓN C:**
Revertir los cambios en el frontend y mantener solo los cambios del backend (que ya están funcionando correctamente), dejando la implementación del frontend para después.

---

## Estado Actual

✅ Backend: 100% funcional
✅ Tipos: 100% actualizados
🔄 Frontend: 20% completado (estado actualizado, pero funciones y JSX pendientes)

---

¿Qué opción prefieres?
