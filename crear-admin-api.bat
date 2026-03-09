@echo off
echo ========================================
echo CREAR ADMIN USANDO LA API
echo ========================================
echo.
echo Este script creara el admin usando la API de Render
echo.
echo IMPORTANTE: Asegurate de que:
echo 1. Ya ejecutaste: habilitar-registro-temporal.bat
echo 2. Ya ejecutaste: subir-cambios-github.bat
echo 3. Render termino el redeploy (2-3 minutos)
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo Creando admin...
echo.

curl -X POST https://app-compraventa.onrender.com/api/auth/register -H "Content-Type: application/json" -d "{\"nombre\":\"Administrador\",\"email\":\"admin@compraventa.com\",\"password\":\"admin123\",\"rol\":\"admin\"}"

echo.
echo.
echo ========================================
echo RESULTADO:
echo ========================================
echo.
echo Si ves un mensaje con "token" y "user", el admin se creo correctamente.
echo.
echo Credenciales:
echo Email: admin@compraventa.com
echo Password: admin123
echo.
echo ========================================
echo SIGUIENTE PASO:
echo ========================================
echo.
echo Ejecuta: deshabilitar-registro.bat
echo (Para volver a deshabilitar el registro por seguridad)
echo.
echo ========================================
pause
