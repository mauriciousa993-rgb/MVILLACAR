 detalles # Funcionalidad: Gastos por Inversionista

## Descripción
Se ha implementado la capacidad de registrar gastos específicos para cada inversionista en un vehículo. Estos gastos se suman automáticamente a los gastos totales del vehículo.

## Cambios Implementados

### 1. Backend - Modelo de Datos

**Archivo:** `backend/src/models/Vehicle.ts`

#### Interfaz IInversionista
```typescript
export interface IInversionista {
  nombre: string;
  montoInversion: number;
  gastosInversionista: number;  // ← NUEVO CAMPO
  porcentajeParticipacion: number;
  utilidadCorrespondiente: number;
}
```

#### Schema de Mongoose
- Agregado campo `gastosInversionista` con valor por defecto 0
- Validación: no puede ser negativo

#### Middleware pre-save
El middleware ahora:
1. Suma todos los gastos de inversionistas
2. Los agrega al total de gastos del vehículo
3. Calcula la utilidad considerando estos gastos adicionales

**Fórmula:**
```
Total Gastos = Pintura + Mecánica + Traspaso + Varios + Σ(Gastos Inversionistas)
```

---

### 2. Frontend - Tipos

**Archivo:** `frontend/src/types/index.ts`

```typescript
export interface Inversionista {
  nombre: string;
  montoInversion: number;
  gastosInversionista: number;  // ← NUEVO CAMPO
  porcentajeParticipacion: number;
  utilidadCorrespondiente: number;
}
```

---

### 3. Frontend - Formulario de Vehículos

**Archivo:** `frontend/src/pages/VehicleForm.tsx`

#### Cambios en el Estado
- Agregado `gastosInversionista: number` al tipo de inversionistas

#### Nuevo Campo en el Formulario
- Campo de entrada para "Gastos del Inversionista"
- Formato de moneda con separador de miles
- Texto de ayuda: "Se suma a gastos totales"
- Ubicado junto a Nombre y Monto de Inversión (grid de 3 columnas)

#### Lógica de Actualización
Cuando se modifica el campo `gastosInversionista`:
1. Se actualiza el valor del inversionista
2. Se recalculan automáticamente los gastos totales
3. Se actualiza la utilidad estimada

#### Función `calcularTotalesInversionistas()`
Ahora considera los gastos de inversionistas en el cálculo de utilidad:
```typescript
const gastosInversionistas = formData.inversionistas.reduce(
  (sum, inv) => sum + (inv.gastosInversionista || 0), 0
);
const gastosTotales = gastos.pintura + gastos.mecanica + 
                      gastos.traspaso + gastos.varios + gastosInversionistas;
const utilidadTotal = precioVenta - precioCompra - gastosTotales;
```

---

## Flujo de Datos

### Al Crear/Editar un Vehículo:

1. **Usuario ingresa gastos del inversionista** en el formulario
2. **Frontend** actualiza el estado y recalcula gastos totales
3. **Al guardar**, se envía al backend con todos los datos
4. **Backend middleware** suma gastos de inversionistas al total
5. **Backend** calcula porcentajes y utilidades
6. **Se guarda** en MongoDB

### Cálculos Automáticos:

```
Gastos Totales = Pintura + Mecánica + Traspaso + Varios + Σ(Gastos Inversionistas)

Costo Total = Precio Compra + Gastos Totales

Utilidad = Precio Venta - Costo Total

Para cada inversionista:
  Porcentaje = (Monto Inversión / Total Inversiones) × 100
  Utilidad Correspondiente = (Porcentaje / 100) × Utilidad Total
```

---

## Ejemplo de Uso

### Escenario:
- **Vehículo:** Toyota Corolla 2020
- **Precio Compra:** $30,000,000
- **Precio Venta:** $40,000,000
- **Gastos Generales:**
  - Pintura: $1,000,000
  - Mecánica: $500,000
  - Traspaso: $300,000
  - Varios: $200,000

### Inversionistas:
1. **Juan Pérez**
   - Inversión: $15,000,000
   - Gastos: $500,000

2. **María García**
   - Inversión: $15,000,000
   - Gastos: $300,000

### Cálculos:

**Gastos Totales:**
```
= 1,000,000 + 500,000 + 300,000 + 200,000 + 500,000 + 300,000
= $2,800,000
```

**Costo Total:**
```
= 30,000,000 + 2,800,000
= $32,800,000
```

**Utilidad Total:**
```
= 40,000,000 - 32,800,000
= $7,200,000
```

**Distribución:**
- Juan Pérez: 50% → $3,600,000
- María García: 50% → $3,600,000

---

## Beneficios

✅ **Transparencia**: Cada inversionista puede registrar sus gastos específicos
✅ **Cálculo Automático**: Los gastos se suman automáticamente al total
✅ **Precisión**: La utilidad se calcula considerando todos los gastos
✅ **Trazabilidad**: Se mantiene registro de quién gastó qué
✅ **Flexibilidad**: Cada inversionista puede tener gastos diferentes

---

## Archivos Modificados

1. ✅ `backend/src/models/Vehicle.ts` - Modelo y middleware
2. ✅ `frontend/src/types/index.ts` - Tipos TypeScript
3. ✅ `frontend/src/pages/VehicleForm.tsx` - Formulario con nuevo campo

---

## Próximos Pasos Sugeridos

- [ ] Agregar desglose de gastos por inversionista en reportes
- [ ] Mostrar gastos de inversionistas en la vista de detalles
- [ ] Agregar validación para evitar gastos negativos
- [ ] Crear reporte de gastos por inversionista

---

## Fecha de Implementación
**Fecha:** ${new Date().toLocaleDateString('es-CO')}
**Versión:** 1.0.0
