@echo off
chcp 65001 >nul
echo ========================================
echo DIAGNÓSTICO DEL SISTEMA
echo ========================================
echo.

echo [1/5] Verificando archivo .env...
if exist "backend\.env" (
    echo ✅ Archivo backend\.env existe
    echo.
    echo Contenido del archivo .env:
    echo ----------------------------------------
    type backend\.env
    echo ----------------------------------------
) else (
    echo ❌ Archivo backend\.env NO existe
)

echo.
echo [2/5] Verificando node_modules del backend...
if exist "backend\node_modules" (
    echo ✅ node_modules del backend existe
) else (
    echo ❌ node_modules del backend NO existe
)

echo.
echo [3/5] Verificando node_modules del frontend...
if exist "frontend\node_modules" (
    echo ✅ node_modules del frontend existe
) else (
    echo ❌ node_modules del frontend NO existe
)

echo.
echo [4/5] Verificando conexión a internet...
ping -n 1 google.com >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Conexión a internet OK
) else (
    echo ❌ Sin conexión a internet
)

echo.
echo [5/5] Verificando si el puerto 5000 está en uso...
netstat -ano | findstr :5000 >nul 2>&1
if %errorlevel%==0 (
    echo ⚠️  Puerto 5000 está en uso
    echo Procesos usando el puerto 5000:
    netstat -ano | findstr :5000
) else (
    echo ✅ Puerto 5000 está libre
)

echo.
echo ========================================
echo DIAGNÓSTICO COMPLETADO
echo ========================================
echo.
pause
