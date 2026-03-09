@echo off
echo ========================================
echo Instalando dependencias del BACKEND
echo ========================================
echo.

cd backend
if errorlevel 1 (
    echo ERROR: No se pudo acceder a la carpeta backend
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
echo Las dependencias del backend se instalaron correctamente.
echo.
echo SIGUIENTE PASO:
echo 1. Configura MongoDB Atlas (lee GUIA_INICIO.md)
echo 2. Actualiza el archivo backend/.env con tu connection string
echo 3. Ejecuta: iniciar-backend.bat
echo.
pause
