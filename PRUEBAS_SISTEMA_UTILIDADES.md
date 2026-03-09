# Guía de Pruebas - Sistema de Utilidades por Usuario

## 🧪 Pruebas a Realizar

El servidor backend está corriendo en: http://localhost:5000

### Prueba 1: Login como Admin

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Request:**
```json
{
  "email": "admin@compraventa.com",
  "password": "admin123"
}
```

**Resultado Esperado:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "nombre": "Administrador",
    "email": "admin@compraventa.com",
    "rol": "admin"
  }
}
```

✅ **Acción:** Copiar el token para las siguientes pruebas

---

### Prueba 2: Estadísticas como Admin

**Endpoint:** `GET http://localhost:5000/api/vehicles/statistics`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Resultado Esperado:**
```json
{
  "totalVehiculos": 22,
  "vehiculosListos": 4,
  "vehiculosPendientes": 13,
  "vehiculosVendidos": 5,
  "valorInventario": 687171660,
  "totalGastos": 3036000,
  "gananciasEstimadas": 235092340,
  "gananciasReales": 50000000,
  "vehiculosEnStock": 17
}
```

✅ **Verificar:**
- Valores son totales completos del negocio
- Incluye todos los vehículos
- Incluye todas las inversiones

---

### Prueba 3: Crear Usuario Inversionista

**Endpoint:** `POST http://localhost:5000/api/auth/users/create`

**Headers:**
```
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@inversionista.com",
  "password": "juan123",
  "rol": "visualizador"
}
```

**Resultado Esperado:**
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "USER_ID_JUAN",
    "nombre": "Juan Pérez",
    "email": "juan@inversionista.com",
    "rol": "visualizador"
  }
}
```

✅ **Acción:** Guardar el ID del usuario Juan

---

### Prueba 4: Agregar Inversionista a Vehículo

**Endpoint:** `PUT http://localhost:5000/api/vehicles/VEHICLE_ID`

**Headers:**
```
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

**Request:**
```json
{
  "inversionistas": [
    {
      "usuario": "USER_ID_JUAN",
      "nombre": "Juan Pérez",
      "montoInversion": 10000000,
      "gastosInversionista": 500000,
      "detallesGastos": "Gastos de trámites"
    }
  ],
  "tieneInversionistas": true
}
```

**Resultado Esperado:**
```json
{
  "message": "Vehículo actualizado exitosamente",
  "vehicle": {
    // ... datos del vehículo
    "inversionistas": [
      {
        "usuario": "USER_ID_JUAN",
        "nombre": "Juan Pérez",
        "montoInversion": 10000000,
        "gastosInversionista": 500000,
        "porcentajeParticipacion": 100,
        "utilidadCorrespondiente": 5000000
      }
    ]
  }
}
```

✅ **Verificar:**
- Inversionista asociado correctamente
- Porcentajes calculados automáticamente
- Utilidad calculada correctamente

---

### Prueba 5: Login como Inversionista

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Request:**
```json
{
  "email": "juan@inversionista.com",
  "password": "juan123"
}
```

**Resultado Esperado:**
```json
{
  "message": "Login exitoso",
  "token": "TOKEN_JUAN",
  "user": {
    "id": "USER_ID_JUAN",
    "nombre": "Juan Pérez",
    "email": "juan@inversionista.com",
    "rol": "visualizador"
  }
}
```

✅ **Acción:** Copiar el token de Juan

---

### Prueba 6: Estadísticas como Inversionista

**Endpoint:** `GET http://localhost:5000/api/vehicles/statistics`

**Headers:**
```
Authorization: Bearer TOKEN_JUAN
```

**Resultado Esperado:**
```json
{
  "totalVehiculos": 22,
  "vehiculosListos": 4,
  "vehiculosPendientes": 13,
  "vehiculosVendidos": 5,
  "valorInventario": 10500000,  // ← SOLO SU INVERSIÓN
  "totalGastos": 500000,         // ← SOLO SUS GASTOS
  "gananciasEstimadas": 5000000, // ← SOLO SU UTILIDAD
  "gananciasReales": 0,          // ← Si no tiene vehículos vendidos
  "vehiculosEnStock": 17
}
```

✅ **Verificar:**
- Valores son SOLO de Juan
- NO incluye inversiones de otros
- Cálculos proporcionales correctos

---

## 📊 Comparación de Resultados

### Escenario: Vehículo con 2 Inversionistas

**Datos del Vehículo:**
- Precio Compra: $40.000.000
- Gastos: $5.000.000
- Precio Venta: $60.000.000
- Utilidad Total: $15.000.000

**Inversionista 1 (Admin - 60%):**
- Inversión: $24.000.000
- Gastos: $3.000.000
- Utilidad: $9.000.000

**Inversionista 2 (Juan - 40%):**
- Inversión: $16.000.000
- Gastos: $2.000.000
- Utilidad: $6.000.000

### Estadísticas Esperadas:

**Admin ve:**
```json
{
  "valorInventario": 50000000,    // Total: 40M + 5M + 3M + 2M
  "totalGastos": 10000000,        // Total: 5M + 3M + 2M
  "gananciasEstimadas": 15000000  // Total completo
}
```

**Juan ve:**
```json
{
  "valorInventario": 18000000,    // Solo Juan: 16M + 2M
  "totalGastos": 2000000,         // Solo Juan: 2M
  "gananciasEstimadas": 6000000   // Solo Juan: 40% de 15M
}
```

---

## ✅ Checklist de Pruebas

### Backend API
- [ ] Login como admin funciona
- [ ] Login como inversionista funciona
- [ ] Crear usuario inversionista funciona
- [ ] Agregar inversionista a vehículo funciona
- [ ] Estadísticas como admin muestran totales
- [ ] Estadísticas como inversionista muestran solo sus datos
- [ ] Cálculos matemáticos son correctos
- [ ] Porcentajes se calculan automáticamente

### Validaciones
- [ ] Campo `usuario` es requerido en inversionistas
- [ ] Usuario debe existir en el sistema
- [ ] Utilidades se distribuyen proporcionalmente
- [ ] Gastos de inversionistas se suman correctamente

### Casos Edge
- [ ] Vehículo sin inversionistas
- [ ] Usuario sin inversiones
- [ ] Usuario con inversiones en múltiples vehículos
- [ ] Vehículo con 3+ inversionistas
- [ ] Inversionista con 0% de participación

---

## 🔧 Herramientas para Testing

### Opción 1: Postman
1. Importar colección de endpoints
2. Configurar variables de entorno
3. Ejecutar pruebas secuencialmente

### Opción 2: cURL (Línea de comandos)
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@compraventa.com","password":"admin123"}'

# Estadísticas
curl -X GET http://localhost:5000/api/vehicles/statistics \
  -H "Authorization: Bearer TU_TOKEN"
```

### Opción 3: Frontend (Recomendado)
1. Iniciar frontend: `cd frontend && npm run dev`
2. Ir a http://localhost:5173
3. Login y verificar dashboard
4. Crear usuarios y probar

---

## 📝 Registro de Pruebas

### Fecha: _____________

**Prueba 1 - Login Admin:**
- [ ] Exitoso
- [ ] Token recibido
- Notas: _______________

**Prueba 2 - Estadísticas Admin:**
- [ ] Exitoso
- [ ] Valores correctos
- Notas: _______________

**Prueba 3 - Crear Inversionista:**
- [ ] Exitoso
- [ ] Usuario creado
- Notas: _______________

**Prueba 4 - Agregar a Vehículo:**
- [ ] Exitoso
- [ ] Asociación correcta
- Notas: _______________

**Prueba 5 - Login Inversionista:**
- [ ] Exitoso
- [ ] Token recibido
- Notas: _______________

**Prueba 6 - Estadísticas Inversionista:**
- [ ] Exitoso
- [ ] Solo sus datos
- Notas: _______________

---

## 🐛 Problemas Conocidos

1. **Error de TypeScript en vehicle.routes.ts**
   - Temporal, se resuelve al reiniciar el servidor
   - No afecta funcionalidad

2. **Advertencias de Mongoose**
   - Índices duplicados en placa y vin
   - No afecta funcionalidad, solo advertencias

---

## 📞 Soporte

Si encuentras problemas durante las pruebas:

1. Verificar que MongoDB esté corriendo
2. Verificar que el backend esté en puerto 5000
3. Revisar logs del servidor
4. Verificar que el usuario admin existe

---

**Estado:** Listo para Testing ✅  
**Servidor:** Corriendo en http://localhost:5000  
**Documentación:** Completa
