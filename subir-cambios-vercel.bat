@echo off
echo ========================================
echo   SUBIR CAMBIOS A GITHUB PARA VERCEL
echo ========================================
echo.

echo [1/4] Agregando archivos modificados...
git add frontend/tsconfig.json
git add frontend/vercel.json
git add frontend/package.json
git add frontend/.vercelignore
git add SOLUCION_ERROR_VERCEL.md

echo.
echo [2/4] Creando commit...
git commit -m "Fix: Configuracion de TypeScript y Vercel para deployment"

echo.
echo [3/4] Subiendo cambios a GitHub...
git push origin main

echo.
echo [4/4] COMPLETADO!
echo.
echo ========================================
echo   SIGUIENTE PASO:
echo ========================================
echo.
echo 1. Ve a tu dashboard de Vercel
echo 2. Vercel detectara automaticamente los cambios
echo 3. Esperara a que el build termine
echo.
echo Si el build falla nuevamente:
echo - Revisa el archivo SOLUCION_ERROR_VERCEL.md
echo - Limpia el cache en Vercel Settings
echo.
echo ========================================
pause
