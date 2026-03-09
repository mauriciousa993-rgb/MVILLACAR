# Sistema de Generación de Contratos de Compraventa

## Estado Actual: EN PROGRESO ⚙️

### ✅ Completado

1. **Dependencias Instaladas**
   - `docxtemplater` - Para generar documentos Word desde plantillas
   - `pizzip` - Requerido por docxtemplater

2. **Modelo de Datos Actualizado**
   - Interfaz `IDatosVenta` creada con todos los campos necesarios
   - Campo `datosVenta` agregado al modelo Vehicle
   - Schema de MongoDB actualizado

3. **Plantilla Recibida**
   - Archivo: `backend/templates/CONTRATO DE VENTA- SIN LOGO.docx`
   - Analizado y campos identificados

### 📋 Campos a Capturar

#### Datos del Vendedor:
- Nombre e Identificación
- Dirección
- Teléfono

#### Datos del Comprador:
- Nombre e Identificación
- Dirección
- Teléfono
- Correo electrónico

#### Datos Adicionales del Vehículo:
- Tipo de carrocería
- Capacidad
- Número de puertas
- Número de motor
- Línea
- Acta/Manifiesto
- Sitio de matrícula
- Tipo de servicio

#### Datos de la Transacción:
- Lugar de celebración
- Fecha de celebración
- Precio en letras
- Forma de pago
- Vendedor anterior (de quien se compró)
- Cédula vendedor anterior
- Días para traspaso
- Fecha y hora de entrega
- Domicilio contractual
- Cláusulas adicionales

### 🔄 Pendiente de Implementar

1. **Backend:**
   - [ ] Crear función para generar contrato Word con docxtemplater
   - [ ] Crear endpoint para generar contrato
   - [ ] Crear endpoint para guardar datos de venta
   - [ ] Agregar ruta en vehicle.routes.ts

2. **Frontend:**
   - [ ] Crear interfaz DatosVenta en types
   - [ ] Crear componente modal para capturar datos de venta
   - [ ] Integrar modal al marcar vehículo como "vendido"
   - [ ] Agregar botón "Generar Contrato" en lista de vehículos
   - [ ] Implementar descarga del contrato

3. **Plantilla Word:**
   - [ ] Convertir plantilla a formato compatible con docxtemplater
   - [ ] Agregar marcadores de posición (placeholders) en el documento

### 📝 Flujo de Usuario Propuesto

1. Usuario marca vehículo como "vendido"
2. Se abre modal para capturar datos de venta
3. Usuario llena formulario con datos del comprador, vendedor y transacción
4. Al guardar, los datos se almacenan en `vehicle.datosVenta`
5. Aparece botón "Generar Contrato" en la lista
6. Al hacer clic, se descarga contrato Word con todos los datos

### 🔧 Próximos Pasos

1. Preparar plantilla Word con marcadores
2. Implementar función de generación en backend
3. Crear componente modal en frontend
4. Integrar todo el flujo

---

**Fecha de inicio:** ${new Date().toLocaleDateString('es-CO')}
**Estado:** En desarrollo
