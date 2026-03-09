# Instrucciones para Preparar la Plantilla Word

## Pasos para Modificar el Contrato

Debes abrir el archivo `CONTRATO DE VENTA- SIN LOGO.docx` en Microsoft Word y reemplazar los campos variables con los siguientes marcadores:

### Reemplazos a Realizar:

**Encabezado:**
- Donde dice "LUGAR Y FECHA DE CELEBRACION DEL CONTRATO:" agregar debajo: `{{lugarCelebracion}}, {{fechaCelebracion}}`

**VENDEDOR(ES):**
- "Nombre e Identificación" → `{{vendedorNombre}} - {{vendedorIdentificacion}}`
- "DIRECCION" → `{{vendedorDireccion}}`
- "TELEFONO" → `{{vendedorTelefono}}`

**COMPRADOR(ES):**
- "Nombre e Identificación" → `{{compradorNombre}} - {{compradorIdentificacion}}`
- "DIRECCION" → `{{compradorDireccion}}`
- "TELEFONO" → `{{compradorTelefono}}`
- "Correo electrónico" → `{{compradorEmail}}`

**DOMICILIO CONTRACTUAL:**
- Agregar: `{{domicilioContractual}}`

**PRIMERA CLÁUSULA - Datos del Vehículo:**
- CLASE → `{{clase}}`
- MARCA → `{{marca}}`
- MODELO → `{{modelo}}`
- TIPO DE CARROCERIA → `{{tipoCarroceria}}`
- COLOR → `{{color}}`
- CAPACIDAD → `{{capacidad}}`
- CHASIS No. → `{{vin}}`
- SERIE No. → `{{vin}}`
- PUERTAS → `{{numeroPuertas}}`
- MOTOR No. → `{{numeroMotor}}`
- LINEA → `{{linea}}`
- ACTA O MANIFIESTO No. → `{{actaManifiesto}}`
- SITIO DE MATRICULA → `{{sitioMatricula}}`
- PLACA No. → `{{placa}}`
- SERVICIO → `{{tipoServicio}}`

**SEGUNDA CLÁUSULA - Precio:**
- "la suma de ___..." → `{{precioLetras}} ({{precioVenta}})`

**TERCERA CLÁUSULA - Forma de Pago:**
- "de la siguiente forma: ___..." → `{{formaPago}}`

**CUARTA CLÁUSULA - Vendedor Anterior:**
- "adquirió el vehículo antes descrito por compra a ___" → `{{vendedorAnterior}}`
- "identificado con CC___" → `{{cedulaVendedorAnterior}}`

**SEXTA CLÁUSULA - Traspaso:**
- "dentro de los ___ (___) días" → `{{diasTraspaso}} ({{diasTraspasoLetras}}) días`

**SÉPTIMA CLÁUSULA - Entrega:**
- "En la fecha ___ y hora ___" → `{{fechaEntrega}} y hora {{horaEntrega}}`

**CLAUSULAS ADICIONALES:**
- Agregar al final: `{{clausulasAdicionales}}`

**FIRMA - Fecha:**
- "en la ciudad de ___, el día ___ (___), del mes de ___, del año___ (___)" → 
  `en la ciudad de {{lugarCelebracion}}, el día {{diaFirma}} ({{diaFirmaLetras}}), del mes de {{mesFirma}}, del año {{añoFirma}} ({{añoFirmaLetras}})`

**FIRMAS:**
- Vendedor CC → `{{vendedorIdentificacion}}`
- Comprador CC → `{{compradorIdentificacion}}`

## Guardar Como:

Una vez realizados todos los reemplazos, guarda el archivo como:
`contrato-compraventa-template.docx`

en la misma carpeta `backend/templates/`

---

**Nota:** Los marcadores deben estar exactamente como se muestran, con dobles llaves `{{nombreVariable}}`
