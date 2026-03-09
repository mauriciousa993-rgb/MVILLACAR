@echo off
echo ========================================
echo Instalando dependencias del FRONTEND
echo ========================================
echo.

cd frontend
if errorlevel 1 (
    echo ERROR: No se pudo acceder a la carpeta frontend
    pause
    exit /b 1
)

echo Instalando paquetes de Node.js...
echo Esto puede tomar 2-3 minutos...
echo.

call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Hubo un problema al instalar las dependencias
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo INSTALACION COMPLETADA EXITOSAMENTE!
echo ========================================
echo.
echo Las dependencias del frontend se instalaron correctamente.
echo.
echo SIGUIENTE PASO:
echo Ejecuta: iniciar-frontend.bat
echo.
pause
