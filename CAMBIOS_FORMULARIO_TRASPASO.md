# Cambios Realizados - Formulario de Traspaso

## Resumen
Se ha actualizado la función `generateTransferForm` en `backend/src/controllers/vehicle.controller.ts` para generar el formulario de traspaso en formato PDF siguiendo el diseño oficial del Ministerio de Transporte (RUNT) con 21 secciones numeradas.

## Archivos Modificados

### 1. backend/src/controllers/vehicle.controller.ts
- **Agregada**: Función `generateTransferForm` completa (~300 líneas)
- **Formato**: PDF con diseño oficial del RUNT
- **Secciones incluidas** (21 secciones numeradas):
  1. Organismo de Tránsito
  2. Placa
  3. Trámite Solicitado (18 tipos de trámite con checkboxes)
  4. Marca
  5. Línea
  6. Combustible (8 tipos: Gasolina, Diesel, Gas, Mixto, Eléctrico, Hidrógeno, Etanol, Biodiesel)
  7. Colores
  8. Modelo (Año)
  9. Cilindrada
  10. Capacidad Kg/Psj
  11. Blindaje (SI/NO)
  12. Desmonte Blindaje (SI/NO)
  13. Potencia/HP
  14. Clase de Vehículo (Automóvil, Bus, Buseta, Camión, Camioneta, Campero, Microbus, Tractocamión, Motocicleta, Motocarro, Mototriciclo, Cuatrimoto, Volqueta, Otro)
  15. Carrocería
  16. Identificación Interna del Vehículo
  17. Importación o Remate
  18. Tipo de Servicio (Particular, Público, Diplomático, Oficial, Especial, Otros)
  19. Números de Motor, Chasis, Serie, VIN
  20. Datos del Propietario (Vendedor)
  21. Datos del Comprador (Nuevo Propietario)

## Características del Formulario

### Diseño
- Tamaño: Carta (Letter) - 612 x 792 puntos
- Márgenes: 30px arriba/abajo, 40px izquierda/derecha
- Fuente: Helvetica (tamaños 6-14 según importancia)
- Estructura: Cajas con bordes negros y líneas divisorias
- Grid layout con posiciones exactas para cada campo

### Datos del Vehículo que se Llenan
- Placa (sección 2, tamaño 14pt destacado)
- Marca, línea, modelo (año)
- Color del vehículo
- VIN (Número de Chasis)
- Número de motor
- Tipo de carrocería
- Capacidad (default: 5)
- Sitio de matrícula

### Datos de las Partes (Secciones 20 y 21)

**Estructura idéntica para Vendedor y Comprador:**
- Nombres y apellidos separados:
  - Primer apellido
  - Segundo apellido
  - Nombres
- Tipo de documento (8 opciones en grid):
  - C.C (seleccionado por defecto con "X")
  - NIT, N.N, Pasaporte, C.Extranj., T.Identi., NUIP, C.Diplomatico
- Número de documento
- Fecha (campos para día, mes, año)
- Dirección
- Ciudad
- Teléfono
- Espacio para firma

### Validaciones Implementadas
- Verifica que el vehículo exista (404 si no existe)
- Valida datos de venta completos:
  - `datosVenta.comprador.nombre`
  - `datosVenta.comprador.identificacion`
  - `datosVenta.vendedor.nombre`
  - `datosVenta.vendedor.identificacion`
- Retorna error 400 con mensaje descriptivo si faltan datos

## Ruta API
```
GET /api/vehicles/:id/transfer-form
```
- **Autorización**: Requiere rol 'admin' o 'vendedor'
- **Respuesta**: PDF descargable
- **Nombre archivo**: `formulario-traspaso-{placa}-{timestamp}.pdf`

## Datos Requeridos en el Vehículo

### Mínimos (obligatorios):
```javascript
datosVenta: {
  comprador: {
    nombre: string,
    identificacion: string
  },
  vendedor: {
    nombre: string,
    identificacion: string
  }
}
```

### Opcionales (mejoran el formulario):
```javascript
datosVenta: {
  vehiculoAdicional: {
    sitioMatricula: string,
    linea: string,
    tipoCarroceria: string,
    capacidad: string,
    numeroMotor: string
  }
}
```

## Valores por Defecto
El formulario selecciona automáticamente:
- **Trámite**: TRASPASO (checkbox marcado en sección 3)
- **Combustible**: GASOLINA (checkbox 1 marcado)
- **Clase**: AUTOMOVIL (checkbox marcado)
- **Servicio**: PARTICULAR (checkbox 1 marcado)
- **Documento**: C.C para ambas partes (marcado con "X")
- **Capacidad**: 5 (si no se especifica)

## Helpers de Dibujo
La función incluye helpers para mantener consistencia visual:
- `drawBox(x, y, width, height)`: Dibuja rectángulos con bordes
- `drawLine(x1, y1, x2, y2)`: Dibuja líneas divisorias

## Próximos Pasos
1. Probar la generación del formulario con un vehículo vendido
2. Verificar que todos los datos se muestren correctamente
3. Ajustar posiciones si es necesario según pruebas reales
4. Verificar compatibilidad con impresión

## Notas Técnicas
- Usa solo PDFKit (sin dependencias adicionales)
- Genera PDF de una sola página (diseño compacto RUNT)
- Código totalmente autónomo (no requiere archivos externos)
- Compatible con entornos serverless (Render, Vercel, etc.)
