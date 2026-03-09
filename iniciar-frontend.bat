@echo off
echo ========================================
echo Iniciando FRONTEND
echo ========================================
echo.
echo Aplicacion: http://localhost:3000
echo.
echo IMPORTANTE:
echo - El backend debe estar corriendo en http://localhost:5000
echo - Abre http://localhost:3000 en tu navegador
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
echo ========================================
echo.

cd frontend
if errorlevel 1 (
    echo ERROR: No se pudo acceder a la carpeta frontend
    pause
    exit /b 1
)

call npm run dev

pause
