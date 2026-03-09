@echo off
chcp 65001 >nul
echo ========================================
echo INICIANDO MONGODB LOCAL
echo ========================================
echo.

echo Verificando si MongoDB está corriendo...
echo.

tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB ya está corriendo
    goto :end
)

echo 🔄 Intentando iniciar MongoDB como servicio...
echo.

net start MongoDB 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB iniciado correctamente
    goto :end
)

echo.
echo ⚠️  No se pudo iniciar MongoDB como servicio.
echo.
echo OPCIONES PARA INICIAR MONGODB:
echo.
echo Opción 1 - Iniciar manualmente:
echo   1. Abre una nueva ventana de terminal como ADMINISTRADOR
echo   2. Ejecuta: mongod
echo.
echo Opción 2 - Iniciar servicio:
echo   1. Presiona Win + R
echo   2. Escribe: services.msc
echo   3. Busca "MongoDB" y click en "Iniciar"
echo.

:end
pause
