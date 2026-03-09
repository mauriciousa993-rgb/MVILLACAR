@echo off
echo ========================================
echo CONFIGURAR MONGODB ATLAS
echo ========================================
echo.
echo Este script te ayudara a configurar MongoDB Atlas
echo.
echo PASOS A SEGUIR:
echo.
echo 1. Ve a https://cloud.mongodb.com
echo 2. Inicia sesion o crea una cuenta gratuita
echo 3. Crea un cluster (si no tienes uno):
echo    - Click en "Build a Database"
echo    - Selecciona "FREE" (M0)
echo    - Elige una region cercana
echo    - Click "Create"
echo.
echo 4. Configura acceso de red:
echo    - Ve a "Network Access"
echo    - Click "Add IP Address"
echo    - Click "Allow Access from Anywhere" (0.0.0.0/0)
echo    - Click "Confirm"
echo.
echo 5. Crea un usuario de base de datos:
echo    - Ve a "Database Access"
echo    - Click "Add New Database User"
echo    - Username: admin
echo    - Password: (crea una contrasena segura)
echo    - Database User Privileges: "Atlas admin"
echo    - Click "Add User"
echo.
echo 6. Obtener Connection String:
echo    - Ve a "Database"
echo    - Click "Connect" en tu cluster
echo    - Click "Connect your application"
echo    - Copia el connection string
echo.
echo ========================================
echo.
echo Ahora vamos a configurar el archivo .env
echo.
set /p MONGODB_URI="Pega aqui tu MongoDB Atlas connection string: "
echo.
echo Guardando configuracion...
echo.

cd backend

(
echo # Puerto del servidor
echo PORT=5000
echo.
echo # MongoDB Atlas Connection String
echo MONGODB_URI=%MONGODB_URI%
echo.
echo # JWT Secret
echo JWT_SECRET=tu_clave_secreta_super_segura_cambiala_123456
echo.
echo # Entorno
echo NODE_ENV=development
) > .env

echo.
echo ========================================
echo CONFIGURACION COMPLETADA
echo ========================================
echo.
echo El archivo backend/.env ha sido actualizado con:
echo - MongoDB Atlas URI
echo.
echo IMPORTANTE:
echo - Asegurate de reemplazar ^<password^> en el URI con tu contrasena real
echo - Asegurate de reemplazar ^<username^> si es necesario
echo.
echo Presiona cualquier tecla para reiniciar el backend...
pause > nul

echo.
echo Reiniciando backend...
cd ..
call reiniciar-backend.bat
