@echo off
chcp 65001 >nul
echo ========================================
echo PROBANDO BACKEND EN RENDER
echo ========================================
echo.

echo 🌐 URL del Backend: https://app-compraventa.onrender.com
echo.

echo 📡 Prueba 1: Verificando que el backend responde...
echo.
curl -s https://app-compraventa.onrender.com
echo.
echo.

echo ========================================
echo.

echo 🔐 Prueba 2: Intentando registrar un usuario...
echo.
curl -X POST https://app-compraventa.onrender.com/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"test123\"}"
echo.
echo.

echo ========================================
echo.

echo 📊 Resultados:
echo.
echo Si viste un JSON en la Prueba 1: ✅ Backend funcionando
echo Si viste "message": "Usuario registrado" en Prueba 2: ✅ MongoDB conectado
echo.
echo Si viste errores: ❌ Hay problemas de configuración
echo.
pause
