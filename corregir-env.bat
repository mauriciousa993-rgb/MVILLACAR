@echo off
chcp 65001 >nul
echo ========================================
echo Corrigiendo archivo .env
echo ========================================
echo.

cd backend

(
echo # Puerto del servidor
echo PORT=5000
echo.
echo # MongoDB Atlas Connection String
echo MONGODB_URI=mongodb+srv://mvillacar:mvillacar123@mvillacar.1uocybr.mongodb.net/compraventa-vehiculos?retryWrites=true^&w=majority^&appName=mvillacar
echo.
echo # JWT Secret
echo JWT_SECRET=compraventa_vehiculos_secret_key_2024_super_segura
echo.
echo # Entorno
echo NODE_ENV=development
) > .env

cd ..

echo.
echo ========================================
echo ✅ Archivo .env corregido!
echo ========================================
echo.
echo Connection string actualizado correctamente.
echo.
echo NOTA: Si el backend sigue corriendo, presiona Ctrl+C
echo en esa ventana y vuelve a ejecutar: iniciar-backend.bat
echo.
pause
