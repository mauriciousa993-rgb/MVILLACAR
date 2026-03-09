@echo off
chcp 65001 >nul
echo ========================================
echo ACTUALIZANDO MONGODB URI
echo ========================================
echo.

cd backend

echo Creando backup del archivo .env actual...
if exist .env (
    copy .env .env.backup >nul
    echo ✅ Backup creado: .env.backup
) else (
    echo ⚠️  No existe archivo .env, se creará uno nuevo
)

echo.
echo Actualizando MONGODB_URI...

(
echo PORT=5000
echo JWT_SECRET=tu-secreto-jwt-super-seguro-cambialo-en-produccion
echo MONGODB_URI=mongodb+srv://mvillacar:mvillacar123@mvillacar.1uocybr.mongodb.net/compraventa-vehiculos?retryWrites=true^&w=majority^&appName=mvillacar
) > .env

echo.
echo ✅ Archivo .env actualizado correctamente
echo.
echo 📋 Configuración aplicada:
echo    - Puerto: 5000
echo    - MongoDB: Atlas (mvillacar cluster)
echo    - Base de datos: compraventa-vehiculos
echo.
echo ========================================
echo SIGUIENTE PASO: Reiniciar el backend
echo ========================================
echo.
echo Ejecuta: .\reiniciar-backend.bat
echo.
pause
