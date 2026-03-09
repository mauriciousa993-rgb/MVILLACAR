@echo off
echo ========================================
echo PRUEBA DE UTILIDADES POR USUARIO
echo ========================================
echo.

echo [1/4] Creando usuario admin inicial...
cd backend
node scripts/crear-admin-inicial.js
echo.

echo [2/4] Obteniendo token de admin...
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@compraventa.com\",\"password\":\"admin123\"}" > temp-login.json
echo.

echo [3/4] Probando endpoint de estadisticas como admin...
echo (Debe mostrar totales completos)
curl -X GET http://localhost:5000/api/vehicles/statistics -H "Authorization: Bearer TOKEN_AQUI"
echo.

echo [4/4] Instrucciones para prueba completa:
echo.
echo 1. Copia el token del archivo temp-login.json
echo 2. Reemplaza TOKEN_AQUI en el comando curl
echo 3. Ejecuta: curl -X GET http://localhost:5000/api/vehicles/statistics -H "Authorization: Bearer TU_TOKEN"
echo.
echo Para probar como inversionista:
echo 1. Crea un usuario inversionista desde el admin
echo 2. Agrega ese usuario como inversionista en un vehiculo
echo 3. Haz login con ese usuario
echo 4. Prueba el endpoint de estadisticas
echo.

pause
