@echo off
echo ========================================
echo Iniciando BACKEND
echo ========================================
echo.
echo Servidor: http://localhost:5000
echo.
echo IMPORTANTE:
echo - Asegurate de haber configurado MongoDB Atlas
echo - Verifica que el archivo backend/.env tenga tu connection string
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
echo ========================================
echo.

cd backend
if errorlevel 1 (
    echo ERROR: No se pudo acceder a la carpeta backend
    pause
    exit /b 1
)

call npm run dev

pause
