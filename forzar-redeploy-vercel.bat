@echo off
echo ========================================
echo   FORZAR REDEPLOY EN VERCEL
echo ========================================
echo.

echo [1/5] Verificando estado de Git...
git status

echo.
echo [2/5] Agregando todos los cambios...
git add -A

echo.
echo [3/5] Creando commit vacio para forzar redeploy...
git commit --allow-empty -m "force: Redeploy para actualizar cambios de Marketplace y Dashboard"

echo.
echo [4/5] Subiendo a GitHub...
git push origin main

echo.
echo [5/5] COMPLETADO!
echo.
echo ========================================
echo   INSTRUCCIONES:
echo ========================================
echo.
echo 1. Ve a https://vercel.com/dashboard
echo 2. Selecciona tu proyecto
echo 3. Espera a que el build termine (2-3 minutos)
echo 4. Limpia cache del navegador: Ctrl+Shift+R
echo.
echo Si sigue sin funcionar:
echo - Ve a Settings ^> Git en Vercel
echo - Click en "Disconnect" y vuelve a conectar
echo - O crea un nuevo proyecto en Vercel
echo.
echo ========================================
pause
