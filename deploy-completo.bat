@echo off
echo ========================================
echo DEPLOYMENT COMPLETO
echo Sistema de Utilidades por Usuario
echo ========================================
echo.

echo [1/4] Agregando archivos a Git...
git add .

echo.
echo [2/4] Creando commit...
git commit -m "Sistema completo de utilidades por usuario - Dashboard corregido, seguridad mejorada, utilidades personalizadas"

echo.
echo [3/4] Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo CAMBIOS SUBIDOS A GITHUB
echo ========================================
echo.
echo Los cambios se desplegarán automáticamente:
echo - Backend en Render (tarda 2-3 minutos)
echo - Frontend en Vercel (tarda 1-2 minutos)
echo.
echo Espera unos minutos y luego verifica:
echo - Render: https://dashboard.render.com
echo - Vercel: https://vercel.com/dashboard
echo.
echo ========================================
pause
