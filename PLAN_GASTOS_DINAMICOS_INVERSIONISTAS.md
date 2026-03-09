# Plan: Sistema Dinámico de Gastos por Inversionista

## Objetivo
Eliminar la sección "Gastos del Vehículo" y trasladar toda la funcionalidad de gastos a cada inversionista, permitiendo agregar gastos dinámicamente con botón "+" y lista desplegable de categorías.

---

## Cambios Realizados

### ✅ 1. Backend - Modelo de Datos (backend/src/models/Vehicle.ts)

**Cambios:**
- ✅ Creada interfaz `IGastoInversionista` con:
  - `categoria`: enum con opciones (pintura, mecánica, traspaso, etc.)
  - `monto`: número
  - `descripcion`: string
  - `fecha`: Date
  
- ✅ Modificada interfaz `IInversionista`:
  - ❌ Eliminado: `gastosInversionista: number`
  - ❌ Eliminado: `detallesGastos: string`
  - ✅ Agregado: `gastos: IGastoInversionista[]`

- ✅ Actualizado middleware `pre-save`:
  - Calcula gastos de inversionistas sumando todos los gastos individuales
  - Mantiene compatibilidad con gastos detallados existentes
  - Cada inversionista recupera la suma de sus gastos

### ✅ 2. Frontend - Tipos (frontend/src/types/index.ts)

**Cambios:**
- ✅ Creada interfaz `GastoInversionista`
- ✅ Actualizada interfaz `Inversionista` para usar array de gastos

---

## Cambios Pendientes

### 🔄 3. Frontend - Formulario de Vehículos (frontend/src/pages/VehicleForm.tsx)

**Cambios Necesarios:**

#### A. Actualizar Estado del Formulario
```typescript
inversionistas: Array<{
  usuario: string;
  nombre: string;
  montoInversion: number;
  gastos: Array<{
    categoria: string;
    monto: number;
    descripcion: string;
    fecha: string;
  }>;
  porcentajeParticipacion: number;
  utilidadCorrespondiente: number;
}>
```

#### B. Eliminar Sección "Gastos del Vehículo"
- Remover todo el bloque de gastos del vehículo del JSX
- Mantener solo los campos de gastos detallados (para compatibilidad)

#### C. Agregar Funcionalidad de Gastos Dinámicos por Inversionista

**Funciones a crear:**
1. `agregarGastoInversionista(invIndex: number)` - Agrega un gasto vacío al inversionista
2. `eliminarGastoInversionista(invIndex: number, gastoIndex: number)` - Elimina un gasto
3. `actualizarGastoInversionista(invIndex, gastoIndex, campo, valor)` - Actualiza un gasto

**UI a implementar:**
```jsx
Para cada inversionista:
  - Botón "+ Agregar Gasto" (verde)
  - Lista de gastos:
    - Select de categoría (pintura, mecánica, etc.)
    - Input de monto (con formato de miles)
    - Input de descripción
    - Botón eliminar (🗑️)
  - Total de gastos del inversionista
```

#### D. Actualizar Función `calcularTotalesInversionistas()`
```typescript
const calcularTotalesInversionistas = () => {
  // Para cada inversionista:
  // 1. Sumar todos sus gastos individuales
  // 2. Calcular utilidad = (% × utilidad neta) + total gastos
  
  const gastosGenerales = formData.gastos.pintura + ... // desde gastosDetallados
  const gastosInversionistas = formData.inversionistas.reduce((sum, inv) => {
    const totalGastosInv = inv.gastos.reduce((s, g) => s + g.monto, 0);
    return sum + totalGastosInv;
  }, 0);
  
  const utilidadBruta = precioVenta - precioCompra - gastosGenerales;
  const utilidadNeta = utilidadBruta - gastosInversionistas;
  
  // Distribuir...
}
```

---

## Estructura UI Propuesta

```
┌─────────────────────────────────────────────────────────┐
│ Inversionista #1                                    [🗑️] │
├─────────────────────────────────────────────────────────┤
│ Usuario del Sistema: [Dropdown ▼]                       │
│ Nombre: [Auto-completado]                               │
│ Monto de Inversión: [15,000,000]                        │
│                                                          │
│ ┌─ Gastos del Inversionista ──────────────────────┐    │
│ │                                                   │    │
│ │ [+ Agregar Gasto]                                │    │
│ │                                                   │    │
│ │ Gasto #1:                                   [🗑️] │    │
│ │ Categoría: [Mecánica ▼]                          │    │
│ │ Monto: [500,000]                                 │    │
│ │ Descripción: [Cambio de motor...]               │    │
│ │                                                   │    │
│ │ Gasto #2:                                   [🗑️] │    │
│ │ Categoría: [Pintura ▼]                           │    │
│ │ Monto: [300,000]                                 │    │
│ │ Descripción: [Pintura completa...]              │    │
│ │                                                   │    │
│ │ Total Gastos: $800,000                           │    │
│ └───────────────────────────────────────────────────┘    │
│                                                          │
│ Participación: 50.00%                                    │
│ Utilidad Estimada: $4,100,000                           │
│ (Incluye recuperación de $800,000 en gastos)            │
└─────────────────────────────────────────────────────────┘
```

---

## Categorías de Gastos Disponibles

1. **Pintura** - Trabajos de pintura y carrocería
2. **Mecánica** - Reparaciones mecánicas
3. **Traspaso** - Gastos de traspaso y documentación
4. **Alistamiento** - Preparación del vehículo
5. **Tapicería** - Trabajos de tapicería interior
6. **Transporte** - Costos de transporte
7. **Varios** - Otros gastos

---

## Lógica de Cálculo

### Fórmula Final:
```
Gastos Generales = Σ(gastos detallados del vehículo)

Para cada inversionista:
  Total Gastos Inversionista = Σ(gastos individuales del inversionista)

Gastos Totales del Vehículo = Gastos Generales + Σ(Total Gastos de todos los inversionistas)

Utilidad Bruta = Precio Venta - Precio Compra - Gastos Generales

Utilidad Neta = Utilidad Bruta - Σ(Total Gastos de todos los inversionistas)

Para cada inversionista:
  Porcentaje = (Monto Inversión / Total Inversiones) × 100
  Utilidad por Participación = (Porcentaje / 100) × Utilidad Neta
  Utilidad Correspondiente = Utilidad por Participación + Total Gastos Inversionista
```

---

## Compatibilidad

### Vehículos Existentes:
- Los gastos detallados existentes se mantienen
- Se calculan como "gastos generales"
- Los inversionistas existentes sin gastos funcionarán normalmente

### Migración:
- No se requiere migración de datos
- Los vehículos antiguos seguirán funcionando
- Los nuevos vehículos usarán el sistema de gastos por inversionista

---

## Próximos Pasos

1. ✅ Actualizar modelo backend
2. ✅ Actualizar tipos frontend
3. 🔄 Modificar VehicleForm.tsx:
   - Eliminar sección de gastos del vehículo
   - Agregar sistema dinámico de gastos por inversionista
   - Actualizar funciones de cálculo
4. 🔄 Probar funcionalidad completa
5. 🔄 Actualizar documentación

---

## Fecha de Creación
${new Date().toLocaleDateString('es-CO')}
