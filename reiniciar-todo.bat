@echo off
echo ========================================
echo Reiniciando Backend y Frontend
echo ========================================
echo.

echo Matando procesos de Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Iniciando Backend...
start "Backend - Puerto 5000" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo Iniciando Frontend...
start "Frontend - Puerto 3000" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servidores iniciados:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo ========================================
echo.
echo Espera 10 segundos y luego abre http://localhost:3000
pause
