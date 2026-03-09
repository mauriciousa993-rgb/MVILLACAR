# Sistema de Inversionistas - Documentación Completa

## 📋 Descripción General

El sistema de inversionistas permite registrar múltiples socios en la compra de un vehículo, calculando automáticamente:
- Porcentaje de participación de cada inversionista
- Utilidad correspondiente a cada uno según su inversión
- Distribución proporcional de ganancias

---

## ✨ Características Implementadas

### 1. **Modelo de Datos (Backend)**
- Campo `inversionistas[]` en el modelo Vehicle
- Cálculo automático mediante middleware pre-save
- Validaciones de montos y porcentajes

### 2. **Interfaz de Usuario (Frontend)**
- Sección dedicada en el formulario de vehículos
- Botón "Agregar Inversionista" para añadir socios
- Campos para nombre y monto de inversión
- Cálculos en tiempo real de participación y utilidades
- Resumen total de inversiones

### 3. **Cálculos Automáticos**
- **Porcentaje de Participación:** `(montoInversion / totalInversiones) × 100`
- **Utilidad Correspondiente:** `(porcentaje / 100) × utilidadTotal`
- **Utilidad Total:** `precioVenta - precioCompra - gastosTotal`

---

## 🎯 Cómo Usar el Sistema

### Paso 1: Crear o Editar un Vehículo
1. Ve a "Nuevo Vehículo" o edita uno existente
2. Llena los datos básicos, precios y gastos

### Paso 2: Agregar Inversionistas
1. Desplázate hasta la sección "Inversionistas"
2. Haz clic en el botón "Agregar Inversionista"
3. Ingresa el nombre del inversionista
4. Ingresa el monto de inversión

### Paso 3: Ver Cálculos Automáticos
El sistema mostrará automáticamente:
- **Participación:** Porcentaje que representa su inversión
- **Utilidad Estimada:** Ganancia que le corresponde

### Paso 4: Agregar Más Inversionistas (Opcional)
- Repite el proceso para cada socio
- Puedes eliminar inversionistas con el botón de basura (🗑️)

### Paso 5: Revisar Resumen
El panel morado muestra:
- Total invertido por todos los socios
- Número de socios
- Utilidad total a distribuir

---

## 📊 Ejemplo Práctico

### Escenario:
**Vehículo:** Toyota Corolla 2020
- **Precio de Compra:** $20,000,000
- **Gastos Totales:** $5,000,000
- **Precio de Venta:** $30,000,000
- **Utilidad Total:** $5,000,000

### Inversionistas:

#### Inversionista #1: Juan Pérez
- **Inversión:** $15,000,000
- **Participación:** 60%
- **Utilidad:** $3,000,000

#### Inversionista #2: María García
- **Inversión:** $10,000,000
- **Participación:** 40%
- **Utilidad:** $2,000,000

### Resumen:
- **Total Invertido:** $25,000,000
- **Número de Socios:** 2
- **Utilidad Total:** $5,000,000 ✓ (distribuida correctamente)

---

## 🔧 Detalles Técnicos

### Archivos Modificados:

#### Backend:
1. **`backend/src/models/Vehicle.ts`**
   - Interfaz `IInversionista`
   - Campo `inversionistas[]` en el schema
   - Campo `tieneInversionistas: boolean`
   - Middleware pre-save para cálculos automáticos

#### Frontend:
1. **`frontend/src/types/index.ts`**
   - Interfaz `Inversionista`
   - Actualización de interfaz `Vehicle`

2. **`frontend/src/pages/VehicleForm.tsx`**
   - Importación de iconos: `Plus`, `Trash2`, `Users`
   - Estado para inversionistas en `formData`
   - Funciones:
     - `agregarInversionista()`
     - `eliminarInversionista(index)`
     - `actualizarInversionista(index, campo, valor)`
     - `calcularTotalesInversionistas()`
   - Sección UI completa con:
     - Botón agregar
     - Lista de inversionistas
     - Campos de entrada
     - Cálculos en tiempo real
     - Resumen total

---

## 💡 Funcionalidades

### ✅ Implementadas:
- Agregar múltiples inversionistas
- Eliminar inversionistas
- Cálculo automático de porcentajes
- Cálculo automático de utilidades
- Formateo de números con separador de miles
- Validación de campos requeridos
- Resumen visual de inversiones
- Compatibilidad con vehículos sin inversionistas

### 🎨 Diseño:
- Tarjetas individuales para cada inversionista
- Código de colores:
  - **Azul:** Porcentaje de participación
  - **Verde:** Utilidad estimada
  - **Morado:** Resumen total
- Iconos intuitivos
- Responsive design

---

## 📝 Validaciones

### Frontend:
- Nombre del inversionista: requerido si hay inversionistas
- Monto de inversión: requerido si hay inversionistas
- Formato numérico con separador de miles

### Backend:
- `nombre`: String requerido, trim
- `montoInversion`: Number requerido, mínimo 0
- `porcentajeParticipacion`: 0-100%
- `utilidadCorrespondiente`: Calculado automáticamente

---

## 🚀 Deployment

### Estado Actual:
✅ Cambios subidos a GitHub
✅ Vercel se actualizará automáticamente
✅ Backend compatible (Render)

### Commits Realizados:
1. `Fix: Campo fecha de venta + Preparación sistema inversionistas`
2. `Feat: Sistema completo de inversionistas con cálculo automático de participación y utilidades`

---

## 📱 Cómo Se Ve

### Sin Inversionistas:
```
┌─────────────────────────────────────────┐
│ 👥 Inversionistas    [+ Agregar]        │
├─────────────────────────────────────────┤
│                                         │
│        👥                               │
│   No hay inversionistas agregados      │
│                                         │
│   Haz clic en "Agregar Inversionista"  │
│   para registrar socios                │
│                                         │
└─────────────────────────────────────────┘
```

### Con Inversionistas:
```
┌─────────────────────────────────────────┐
│ 👥 Inversionistas    [+ Agregar]        │
├─────────────────────────────────────────┤
│ Inversionista #1                    🗑️  │
│ Nombre: Juan Pérez                      │
│ Inversión: $15,000,000                  │
│ ┌──────────────┬──────────────────────┐ │
│ │ Participación│ Utilidad Estimada    │ │
│ │    60.00%    │   $3,000,000.00      │ │
│ └──────────────┴──────────────────────┘ │
├─────────────────────────────────────────┤
│ Inversionista #2                    🗑️  │
│ Nombre: María García                    │
│ Inversión: $10,000,000                  │
│ ┌──────────────┬──────────────────────┐ │
│ │ Participación│ Utilidad Estimada    │ │
│ │    40.00%    │   $2,000,000.00      │ │
│ └──────────────┴──────────────────────┘ │
├─────────────────────────────────────────┤
│ 📊 Resumen de Inversiones               │
│ Total Invertido: $25,000,000.00         │
│ Número de Socios: 2                     │
│ Utilidad Total: $5,000,000.00           │
└─────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### 1. Usuario Agrega Inversionista:
```
Click "Agregar" → agregarInversionista()
                → Agrega objeto vacío al array
                → tieneInversionistas = true
```

### 2. Usuario Ingresa Datos:
```
Escribe nombre → actualizarInversionista(index, 'nombre', valor)
Escribe monto  → actualizarInversionista(index, 'montoInversion', valor)
                → Actualiza array de inversionistas
```

### 3. Cálculos en Tiempo Real:
```
Cada render → calcularTotalesInversionistas()
            → Suma total de inversiones
            → Calcula porcentaje de cada uno
            → Calcula utilidad de cada uno
            → Retorna array con cálculos
```

### 4. Al Guardar:
```
Submit → formData enviado al backend
       → Middleware pre-save ejecuta cálculos
       → Guarda en MongoDB con valores calculados
```

---

## 🎓 Casos de Uso

### Caso 1: Vehículo Individual (Sin Inversionistas)
- No agregar inversionistas
- El sistema funciona normalmente
- Toda la utilidad es para el negocio

### Caso 2: Dos Socios con Inversión Igual
- Juan: $12,500,000 (50%)
- Pedro: $12,500,000 (50%)
- Utilidad se divide equitativamente

### Caso 3: Tres Socios con Inversión Diferente
- Ana: $15,000,000 (50%)
- Luis: $10,000,000 (33.33%)
- Carlos: $5,000,000 (16.67%)
- Utilidad proporcional a inversión

### Caso 4: Editar Vehículo Existente
- Los inversionistas se cargan automáticamente
- Se pueden agregar, editar o eliminar
- Los cálculos se actualizan en tiempo real

---

## ⚠️ Consideraciones Importantes

### 1. **Compatibilidad:**
- Vehículos antiguos sin inversionistas siguen funcionando
- Campo `tieneInversionistas` indica si hay socios
- Array vacío por defecto

### 2. **Cálculos:**
- Se realizan tanto en frontend (preview) como en backend (guardado)
- Frontend: función `calcularTotalesInversionistas()`
- Backend: middleware `pre('save')`

### 3. **Validaciones:**
- Nombres no pueden estar vacíos
- Montos deben ser mayores a 0
- Porcentajes se calculan automáticamente (no editables)

### 4. **Formato de Números:**
- Usa separador de miles (punto en Colombia)
- Formato: $15.000.000,00
- Parseo automático al guardar

---

## 🔮 Mejoras Futuras Sugeridas

1. **Validación de Suma Total:**
   - Advertir si suma de inversiones > precio de compra
   - Sugerir ajustes automáticos

2. **Reportes por Inversionista:**
   - Historial de inversiones por persona
   - Total de utilidades acumuladas
   - Vehículos en los que ha participado

3. **Exportar Distribución:**
   - PDF con detalle de participación
   - Comprobante para cada inversionista

4. **Dashboard de Inversionistas:**
   - Vista dedicada para cada socio
   - Resumen de sus inversiones activas
   - Proyección de utilidades

5. **Notificaciones:**
   - Alertar cuando un vehículo con inversionistas se vende
   - Enviar resumen de utilidades

---

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
1. Verifica que los datos estén completos
2. Revisa la consola del navegador para errores
3. Asegúrate de que el backend esté actualizado en Render

---

## ✅ Checklist de Verificación

Antes de usar el sistema, verifica:
- [ ] Backend desplegado en Render con modelo actualizado
- [ ] Frontend desplegado en Vercel con nueva UI
- [ ] Campos de inversionistas visibles en el formulario
- [ ] Botón "Agregar Inversionista" funcional
- [ ] Cálculos se muestran correctamente
- [ ] Se puede eliminar inversionistas
- [ ] Datos se guardan correctamente en MongoDB

---

## 🎉 Resultado Final

Ahora puedes:
1. ✅ Registrar vehículos con múltiples inversionistas
2. ✅ Ver automáticamente el porcentaje de participación
3. ✅ Calcular la utilidad de cada socio
4. ✅ Tener transparencia total en la distribución de ganancias
5. ✅ Generar reportes con información de inversionistas

---

**Fecha de Implementación:** 2024
**Versión:** 1.0
**Estado:** ✅ Completamente Funcional
