@echo off
echo ========================================
echo   CREAR ADMINISTRADOR INICIAL EN RENDER
echo ========================================
echo.

echo [IMPORTANTE] Asegurate de que:
echo 1. El backend en Render este completamente desplegado
echo 2. Tengas la URL de tu backend en Render
echo.
echo Ejemplo de URL: https://app-compraventa.onrender.com
echo.

set /p BACKEND_URL="Ingresa la URL de tu backend en Render: "

echo.
echo [1/2] Creando administrador inicial...
echo.

curl -X POST %BACKEND_URL%/api/auth/setup-admin ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Administrador\",\"email\":\"admin@compraventa.com\",\"password\":\"admin123\"}"

echo.
echo.
echo [2/2] Verificando respuesta...
echo.

echo ========================================
echo   RESULTADO
echo ========================================
echo.
echo Si ves un mensaje de exito arriba, el admin se creo correctamente.
echo.
echo Credenciales de prueba:
echo   Email: admin@compraventa.com
echo   Password: admin123
echo.
echo [IMPORTANTE] Cambia esta contrasena despues del primer login.
echo.
echo Si ves un error 403, significa que ya existe un admin.
echo Si ves un error de conexion, espera 2-3 minutos a que Render termine el deploy.
echo.
pause
