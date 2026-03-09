@echo off
echo ========================================
echo   VERIFICAR DIAGNOSTICO DEL BACKEND
echo ========================================
echo.

set /p BACKEND_URL="Ingresa la URL de tu backend en Render (ej: https://app-compraventa.onrender.com): "

echo.
echo [1/2] Verificando conexion a MongoDB...
echo.

curl -s %BACKEND_URL%/api/auth/diagnostico | findstr /C:"estado" /C:"usuarios" /C:"uriConfigurada"

echo.
echo [2/2] Verificando endpoint de login...
echo.

curl -s -X POST %BACKEND_URL%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"test\"}" | findstr /C:"message" /C:"Credenciales"

echo.
echo ========================================
echo   INSTRUCCIONES
echo ========================================
echo.
echo 1. Si ves "estado: conectado" y usuarios listados, 
echo    la base de datos esta conectada correctamente.
echo.
echo 2. Si ves "uriConfigurada: NO CONFIGURADA", 
echo    debes configurar MONGODB_URI en Render.
echo.
echo 3. Si ves "usuarios: total: 0", la base de datos esta vacia
echo    y necesitas crear usuarios.
echo.
echo 4. Para crear el primer admin, ejecuta: crear-admin-render.bat
echo.
pause
