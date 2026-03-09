 @echo off
chcp 65001 >nul
echo ========================================
echo PROBANDO CREACIÓN DE VEHÍCULO
echo ========================================
echo.

echo 📋 Verificando que el backend esté corriendo...
curl -s http://localhost:5000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ El backend NO está corriendo
    echo.
    echo Ejecuta primero: .\iniciar-backend.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Backend está corriendo
echo.

echo 🔐 Paso 1: Registrando usuario de prueba...
echo.

curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Usuario Prueba\",\"email\":\"prueba@test.com\",\"password\":\"prueba123\"}" ^
  2>nul

echo.
echo.

echo 🔑 Paso 2: Iniciando sesión...
echo.

for /f "delims=" %%i in ('curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"prueba@test.com\",\"password\":\"prueba123\"}"') do set RESPONSE=%%i

echo Respuesta: %RESPONSE%
echo.

echo 🚗 Paso 3: Creando vehículo SIN VIN ni Color (para probar la solución)...
echo.

curl -X POST http://localhost:5000/api/vehicles ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TOKEN_AQUI" ^
  -d "{\"marca\":\"Peugeot\",\"modelo\":\"3008 Active\",\"año\":2025,\"placa\":\"TEST123\",\"vin\":\"\",\"color\":\"\",\"kilometraje\":8220,\"precioCompra\":50000000,\"precioVenta\":55000000}" ^
  2>nul

echo.
echo.

echo ========================================
echo PRUEBA COMPLETADA
echo ========================================
echo.
echo 📊 Para ver los resultados:
echo    1. Abre: http://localhost:3000
echo    2. Inicia sesión con:
echo       Email: prueba@test.com
echo       Password: prueba123
echo    3. Ve a "Vehículos" para ver el vehículo creado
echo.
echo O abre MongoDB Compass:
echo    - Conecta a: mongodb://localhost:27017
echo    - Base de datos: compraventa-vehiculos
echo    - Colección: vehicles
echo.
pause
