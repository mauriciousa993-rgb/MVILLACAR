@echo off
chcp 65001 >nul
echo ========================================
echo CONFIGURAR MONGODB LOCAL
echo ========================================
echo.

echo 📋 Verificando si MongoDB está instalado...
echo.

where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB NO está instalado en tu sistema
    echo.
    echo 📥 NECESITAS INSTALAR MONGODB:
    echo.
    echo 1. Ve a: https://www.mongodb.com/try/download/community
    echo 2. Descarga MongoDB Community Edition para Windows
    echo 3. Ejecuta el instalador
    echo 4. Marca "Install MongoDB as a Service"
    echo 5. Vuelve a ejecutar este script
    echo.
    echo O lee la guía completa en: SOLUCION_MONGODB_LOCAL.md
    echo.
    pause
    exit /b 1
)

echo ✅ MongoDB está instalado
echo.

echo 📂 Verificando directorio de datos...
if not exist "C:\data\db" (
    echo Creando directorio C:\data\db...
    mkdir C:\data\db
    echo ✅ Directorio creado
) else (
    echo ✅ Directorio ya existe
)
echo.

echo 🔄 Verificando si MongoDB está corriendo...
sc query MongoDB | find "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB no está corriendo. Intentando iniciar...
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        echo ⚠️  No se pudo iniciar como servicio
        echo Puedes iniciarlo manualmente con: mongod --dbpath C:\data\db
    ) else (
        echo ✅ MongoDB iniciado como servicio
    )
) else (
    echo ✅ MongoDB ya está corriendo
)
echo.

echo 📝 Actualizando configuración del backend...
cd backend

if exist .env (
    echo Creando backup de .env...
    copy .env .env.backup.local >nul
    echo ✅ Backup creado: .env.backup.local
)

echo.
echo Configurando para usar MongoDB Local...

(
echo PORT=5000
echo JWT_SECRET=tu-secreto-jwt-super-seguro-cambialo-en-produccion
echo MONGODB_URI=mongodb://localhost:27017/compraventa-vehiculos
) > .env

echo.
echo ✅ Configuración actualizada
echo.
echo 📋 Nueva configuración:
echo    - Puerto: 5000
echo    - MongoDB: Local (localhost:27017^)
echo    - Base de datos: compraventa-vehiculos
echo.

cd ..

echo ========================================
echo ✅ CONFIGURACIÓN COMPLETADA
echo ========================================
echo.
echo 🚀 SIGUIENTE PASO:
echo    Ejecuta: .\reiniciar-backend.bat
echo.
echo 📊 Para ver tus datos:
echo    - Abre MongoDB Compass
echo    - Conecta a: mongodb://localhost:27017
echo    - Base de datos: compraventa-vehiculos
echo.
pause
