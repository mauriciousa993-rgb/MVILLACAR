# Sistema de Utilidades por Usuario

## 🎯 Funcionalidad Implementada

Cada usuario (admin o inversionista) ahora solo ve SUS propias utilidades en el dashboard, no las de otros inversionistas.

## 🔧 Cambios Implementados

### 1. Modelo de Datos (backend/src/models/Vehicle.ts)

**Antes:**
```typescript
export interface IInversionista {
  nombre: string;
  montoInversion: number;
  // ...
}
```

**Ahora:**
```typescript
export interface IInversionista {
  usuario: mongoose.Types.ObjectId; // ← NUEVO: Referencia al usuario
  nombre: string;
  montoInversion: number;
  // ...
}
```

Cada inversionista ahora está asociado a un usuario específico del sistema.

### 2. Función de Estadísticas (backend/src/controllers/vehicle.controller.ts)

La función `getStatistics()` ahora calcula las utilidades según el rol del usuario:

#### Para Administradores (rol: 'admin')
- ✅ Ve TODAS las utilidades del negocio
- ✅ Valor total del inventario
- ✅ Gastos totales
- ✅ Ganancias estimadas totales
- ✅ Ganancias reales totales

#### Para Inversionistas (usuarios con inversiones)
- ✅ Ve solo SUS utilidades
- ✅ Solo su inversión en el inventario
- ✅ Solo sus gastos
- ✅ Solo sus ganancias estimadas (proporcionales)
- ✅ Solo sus ganancias reales (de vehículos vendidos)

## 📊 Cálculo de Utilidades por Usuario

### Para Administrador

```javascript
// Vehículos en stock
valorInventario = Σ (precioCompra + gastos.total)
totalGastos = Σ gastos.total
gananciasEstimadas = Σ (precioVenta - precioCompra - gastos.total)

// Vehículos vendidos
gananciasReales = Σ (precioVenta - precioCompra - gastos.total)
```

### Para Inversionista

```javascript
// Solo vehículos donde el usuario es inversionista
Para cada vehículo en stock:
  Si usuario es inversionista en este vehículo:
    porcentaje = montoInversion / totalInversion
    valorInventario += montoInversion + gastosInversionista
    totalGastos += gastosInversionista
    gananciasEstimadas += utilidadTotal * porcentaje

// Solo vehículos vendidos donde es inversionista
Para cada vehículo vendido:
  Si usuario es inversionista en este vehículo:
    gananciasReales += utilidadCorrespondiente
```

## 🔐 Privacidad de Información

### Lo que ve cada usuario:

#### Administrador
- ✅ Todas las inversiones
- ✅ Todos los inversionistas
- ✅ Todas las utilidades
- ✅ Información completa del negocio

#### Inversionista (usuario con inversiones)
- ✅ Solo SUS inversiones
- ✅ Solo SUS utilidades
- ❌ NO ve inversiones de otros
- ❌ NO ve utilidades de otros
- ❌ NO ve información financiera completa

#### Vendedor/Visualizador
- ❌ NO ve información financiera
- ✅ Solo información básica de vehículos

## 📝 Flujo de Trabajo

### 1. Crear Inversionista

Cuando se agrega un inversionista a un vehículo:

```typescript
{
  usuario: "ID_DEL_USUARIO", // ← Seleccionar usuario del sistema
  nombre: "Juan Pérez",
  montoInversion: 10000000,
  gastosInversionista: 500000,
  detallesGastos: "Gastos de trámites"
}
```

### 2. Dashboard Personalizado

Cuando un usuario accede al dashboard:

**Si es Admin:**
```
Dashboard muestra:
- Total de vehículos: 22
- Valor inventario: $687.171.660 (TOTAL)
- Ganancias estimadas: $235.092.340 (TOTAL)
```

**Si es Inversionista (ej: Juan Pérez):**
```
Dashboard muestra:
- Total de vehículos: 22 (mismo número)
- Valor inventario: $15.500.000 (SOLO SU INVERSIÓN)
- Ganancias estimadas: $3.250.000 (SOLO SU PARTE)
```

## 🎯 Beneficios

1. **Privacidad**
   - Cada inversionista solo ve su información
   - No se exponen las inversiones de otros

2. **Transparencia**
   - Cada usuario ve claramente sus utilidades
   - Cálculos automáticos y precisos

3. **Control**
   - Admin ve todo el panorama
   - Inversionistas ven solo lo que les corresponde

4. **Seguridad**
   - Información financiera protegida
   - Acceso basado en roles

## 🔄 Ejemplo Práctico

### Vehículo con 2 Inversionistas

**Datos del vehículo:**
- Precio compra: $40.000.000
- Gastos totales: $5.000.000
- Precio venta: $60.000.000
- Utilidad total: $15.000.000

**Inversionista 1 (Admin):**
- Inversión: $30.000.000 (75%)
- Gastos: $3.000.000
- Utilidad: $11.250.000 (75% de $15M)

**Inversionista 2 (Usuario Juan):**
- Inversión: $10.000.000 (25%)
- Gastos: $1.000.000
- Utilidad: $3.750.000 (25% de $15M)

### Dashboard para cada usuario:

**Admin ve:**
- Valor inventario: $48.000.000 (total)
- Ganancias estimadas: $15.000.000 (total)

**Juan ve:**
- Valor inventario: $11.000.000 (solo su parte)
- Ganancias estimadas: $3.750.000 (solo su parte)

## 📋 Requisitos para Usar

### En el Frontend (VehicleForm)

Cuando se agregan inversionistas, ahora se debe:

1. Seleccionar el usuario del sistema
2. El nombre se puede autocompletar del usuario seleccionado
3. Ingresar monto de inversión
4. Ingresar gastos del inversionista (opcional)

### Validaciones

- ✅ El usuario debe existir en el sistema
- ✅ Un usuario puede ser inversionista en múltiples vehículos
- ✅ Los porcentajes se calculan automáticamente
- ✅ Las utilidades se distribuyen proporcionalmente

## 🚀 Próximos Pasos

Para completar la implementación en el frontend:

1. **Modificar VehicleForm.tsx**
   - Agregar selector de usuario para inversionistas
   - Cargar lista de usuarios disponibles
   - Asociar usuario seleccionado con inversionista

2. **Actualizar Dashboard.tsx**
   - Ya funciona automáticamente
   - Muestra utilidades según usuario logueado

3. **Testing**
   - Crear usuarios de prueba
   - Agregar inversionistas asociados a usuarios
   - Verificar que cada uno ve solo sus utilidades

## 💡 Notas Importantes

1. **Usuarios Inversionistas**
   - Pueden ser usuarios con rol 'admin'
   - También pueden ser usuarios especiales solo para inversiones
   - Se recomienda crear usuarios específicos para inversionistas

2. **Migración de Datos**
   - Vehículos existentes con inversionistas necesitarán actualización
   - Asignar un usuario a cada inversionista existente
   - Se puede hacer manualmente o con un script de migración

3. **Permisos**
   - Inversionistas pueden tener rol 'visualizador'
   - Solo verán sus utilidades, no podrán editar

---

**Versión:** 3.0.0 - Sistema de Utilidades por Usuario  
**Fecha:** ${new Date().toLocaleDateString('es-CO')}  
**Estado:** Backend Implementado ✅ | Frontend Pendiente ⏳
