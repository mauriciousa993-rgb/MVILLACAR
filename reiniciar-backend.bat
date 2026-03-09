@echo off
chcp 65001 >nul
echo ========================================
echo REINICIANDO BACKEND
echo ========================================
echo.

echo Matando procesos de Node.js anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo Iniciando backend nuevamente...
echo ========================================
echo.

cd backend
npm run dev
