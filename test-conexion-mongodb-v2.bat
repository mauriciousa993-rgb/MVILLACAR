@echo off
chcp 65001 >nul
echo ========================================
echo PROBANDO CONEXIÓN A MONGODB ATLAS
echo ========================================
echo.

cd backend
node test-mongodb.js
cd ..

echo.
pause
