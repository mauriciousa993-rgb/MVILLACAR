# Retribución de Gastos a Inversionistas

## Cambio Implementado

Se ha modificado el sistema de cálculo de utilidades para que **cada inversionista recupere sus gastos ADEMÁS de recibir su porcentaje de utilidad**.

---

## Problema Anterior

Cuando un inversionista gastaba dinero en el vehículo (ej: $500,000 en mecánica), ese gasto:
- Se sumaba a los gastos totales del vehículo
- Reducía la utilidad total
- La utilidad reducida se distribuía proporcionalmente
- **El inversionista NO recuperaba su gasto**, sino que lo compartía con todos

### Ejemplo del Problema:
```
Vehículo: $40M venta, $30M compra, $2M gastos generales
Inversionista A: $15M inversión, $500K gastos (50%)
Inversionista B: $15M inversión, $300K gastos (50%)

❌ CÁLCULO ANTERIOR (INCORRECTO):
- Gastos totales = $2M + $500K + $300K = $2.8M
- Utilidad = $40M - $30M - $2.8M = $7.2M
- A recibe: 50% × $7.2M = $3.6M (perdió $500K)
- B recibe: 50% × $7.2M = $3.6M (perdió $300K)
```

---

## Solución Implementada

Ahora los gastos de inversionistas se manejan por separado y se retribuyen a cada uno:

### Nuevo Cálculo:
```
✅ CÁLCULO NUEVO (CORRECTO):
- Gastos generales = $2M (sin incluir gastos de inversionistas)
- Utilidad bruta = $40M - $30M - $2M = $8M
- Gastos de inversionistas = $500K + $300K = $800K
- Utilidad neta a distribuir = $8M - $800K = $7.2M

- A recibe: (50% × $7.2M) + $500K = $3.6M + $500K = $4.1M ✓
- B recibe: (50% × $7.2M) + $300K = $3.6M + $300K = $3.9M ✓

Total distribuido: $8M ✓
```

---

## Archivos Modificados

### 1. **backend/src/models/Vehicle.ts**

**Cambios en el middleware `pre-save`:**

```typescript
// ANTES:
const utilidadTotal = this.precioVenta - this.precioCompra - this.gastos.total;
inv.utilidadCorrespondiente = (inv.porcentajeParticipacion / 100) * utilidadTotal;

// AHORA:
const gastosGenerales = this.gastos.pintura + this.gastos.mecanica + ... // SIN gastos de inversionistas
const utilidadBruta = this.precioVenta - this.precioCompra - gastosGenerales;
const utilidadNeta = utilidadBruta - gastosInversionistas;

const utilidadPorParticipacion = (inv.porcentajeParticipacion / 100) * utilidadNeta;
inv.utilidadCorrespondiente = utilidadPorParticipacion + (inv.gastosInversionista || 0);
```

**Explicación:**
- Los gastos generales NO incluyen gastos de inversionistas
- La utilidad bruta se calcula sin considerar gastos de inversionistas
- La utilidad neta se obtiene restando los gastos de inversionistas
- Cada inversionista recibe: (su % de utilidad neta) + (sus gastos)

---

### 2. **frontend/src/pages/VehicleForm.tsx**

**Cambios en la función `calcularTotalesInversionistas()`:**

```typescript
// ANTES:
const gastosTotales = formData.gastos.pintura + ... + gastosInversionistas;
const utilidadTotal = formData.precioVenta - formData.precioCompra - gastosTotales;
const utilidad = (porcentaje / 100) * utilidadTotal;

// AHORA:
const gastosGenerales = formData.gastos.pintura + ... // SIN gastos de inversionistas
const utilidadBruta = formData.precioVenta - formData.precioCompra - gastosGenerales;
const utilidadNeta = utilidadBruta - gastosInversionistas;

const utilidadPorParticipacion = (porcentaje / 100) * utilidadNeta;
const utilidad = utilidadPorParticipacion + (inv.gastosInversionista || 0);
```

**Explicación:**
- Los cálculos en tiempo real ahora reflejan el mismo comportamiento del backend
- El inversionista ve inmediatamente que recuperará sus gastos

---

## Beneficios

✅ **Justicia Financiera**: Cada inversionista recupera lo que gastó
✅ **Transparencia**: Los cálculos son claros y justos
✅ **Incentivo**: Los inversionistas pueden gastar en mejoras sin perder dinero
✅ **Precisión**: La distribución de utilidades es matemáticamente correcta

---

## Ejemplo Completo

### Escenario:
- **Vehículo:** Toyota Corolla 2020
- **Precio Compra:** $30,000,000
- **Precio Venta:** $40,000,000
- **Gastos Generales:**
  - Pintura: $1,000,000
  - Mecánica: $500,000
  - Traspaso: $300,000
  - Varios: $200,000
  - **Total Generales: $2,000,000**

### Inversionistas:
1. **Juan Pérez**
   - Inversión: $15,000,000 (50%)
   - Gastos: $500,000 (pagó mecánica adicional)

2. **María García**
   - Inversión: $15,000,000 (50%)
   - Gastos: $300,000 (pagó pintura de detalles)

### Cálculos:

**Paso 1: Gastos Totales**
```
Gastos Generales = $2,000,000
Gastos de Inversionistas = $500,000 + $300,000 = $800,000
Total Gastos = $2,800,000
```

**Paso 2: Utilidad Bruta**
```
Utilidad Bruta = $40,000,000 - $30,000,000 - $2,000,000 = $8,000,000
```

**Paso 3: Utilidad Neta a Distribuir**
```
Utilidad Neta = $8,000,000 - $800,000 = $7,200,000
```

**Paso 4: Distribución**
```
Juan Pérez:
  - Participación: 50%
  - Utilidad por participación: 50% × $7,200,000 = $3,600,000
  - Gastos a recuperar: $500,000
  - TOTAL A RECIBIR: $3,600,000 + $500,000 = $4,100,000 ✓

María García:
  - Participación: 50%
  - Utilidad por participación: 50% × $7,200,000 = $3,600,000
  - Gastos a recuperar: $300,000
  - TOTAL A RECIBIR: $3,600,000 + $300,000 = $3,900,000 ✓

Verificación:
  Total distribuido: $4,100,000 + $3,900,000 = $8,000,000 ✓
  Utilidad bruta: $8,000,000 ✓
```

---

## Impacto en el Sistema

### ✅ Compatibilidad
- Vehículos sin inversionistas: funcionan igual que antes
- Vehículos con inversionistas sin gastos: funcionan igual que antes
- Vehículos existentes: se recalcularán automáticamente con la nueva fórmula

### ✅ Interfaz de Usuario
- El formulario muestra los cálculos correctos en tiempo real
- La sección "Utilidad Estimada" refleja el monto que recibirá cada inversionista
- Incluye sus gastos en el total mostrado

### ✅ Base de Datos
- No se requieren cambios en el esquema
- Los cálculos se actualizan automáticamente al guardar

---

## Fecha de Implementación
**Fecha:** ${new Date().toLocaleDateString('es-CO')}
**Versión:** 2.0.0

---

## Notas Técnicas

### Fórmulas Matemáticas:

```
Gastos Generales = Σ(gastos del vehículo) [SIN gastos de inversionistas]

Gastos de Inversionistas = Σ(gastosInversionista de cada inversionista)

Gastos Totales = Gastos Generales + Gastos de Inversionistas

Utilidad Bruta = Precio Venta - Precio Compra - Gastos Generales

Utilidad Neta = Utilidad Bruta - Gastos de Inversionistas

Para cada inversionista:
  Porcentaje = (Monto Inversión / Total Inversiones) × 100
  Utilidad por Participación = (Porcentaje / 100) × Utilidad Neta
  Utilidad Correspondiente = Utilidad por Participación + Gastos del Inversionista
```

---

## Pruebas Recomendadas

1. ✅ Crear vehículo con inversionistas y gastos
2. ✅ Verificar cálculos en tiempo real en el formulario
3. ✅ Guardar y verificar que los valores se calculan correctamente
4. ✅ Editar vehículo existente y verificar recálculo
5. ✅ Verificar dashboard y reportes

---

## Soporte

Si tienes dudas sobre esta funcionalidad, revisa los ejemplos en este documento o consulta los archivos modificados.
