@echo off
chcp 65001 >nul
echo ========================================
echo Configurando archivo .env
echo ========================================
echo.

cd backend

echo # Puerto del servidor > .env
echo PORT=5000 >> .env
echo. >> .env
echo # MongoDB Atlas Connection String >> .env
echo MONGODB_URI=mongodb+srv://mvillacar:mvillacar123@mvillacar.1uocybr.mongodb.net/compraventa-vehiculos?retryWrites=true^&w=majority^&appName=mvillacar >> .env
echo. >> .env
echo # JWT Secret (cambia esto por una clave segura y única) >> .env
echo JWT_SECRET=compraventa_vehiculos_secret_key_2024_super_segura >> .env
echo. >> .env
echo # Entorno >> .env
echo NODE_ENV=development >> .env

cd ..

echo.
echo ========================================
echo ✅ Archivo .env configurado exitosamente!
echo ========================================
echo.
echo El archivo backend/.env ha sido actualizado con:
echo - MongoDB URI: mongodb+srv://mvillacar:mvillacar123@mvillacar.1uocybr.mongodb.net/...
echo - Puerto: 5000
echo - JWT Secret configurado
echo.
echo SIGUIENTE PASO:
echo 1. Ejecuta: iniciar-backend.bat
echo 2. Ejecuta: iniciar-frontend.bat
echo 3. Abre: http://localhost:3000
echo.
pause
