@echo off
echo ========================================
echo   CREAR USUARIO ADMINISTRADOR INICIAL
echo ========================================
echo.
echo Este script creara el primer usuario administrador
echo.
echo IMPORTANTE: Solo ejecuta este script UNA VEZ
echo.
pause

cd backend
node scripts/crear-admin-inicial.js

echo.
pause
