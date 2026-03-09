@echo off
chcp 65001 >nul
echo ========================================
echo SUBIR FIX DE VERCEL 404 A GITHUB
echo ========================================
echo.

echo 📝 Cambios a subir:
echo    - Fix error 404 en Vercel (vercel.json)
echo    - Fix VIN y Color opcionales (backend)
echo.

echo 🔍 Estado actual de Git...
git status

echo.
echo ========================================
echo.

echo 📦 Agregando archivos...
git add frontend/vercel.json
git add backend/src/models/Vehicle.ts
git add backend/src/controllers/vehicle.controller.ts

echo.
echo ✅ Archivos agregados
echo.

echo 💾 Creando commit...
git commit -m "Fix: Error 404 Vercel + VIN y Color opcionales"

echo.
echo 🚀 Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo ✅ CAMBIOS SUBIDOS
echo ========================================
echo.
echo 📋 Próximos pasos:
echo.
echo 1. Vercel detectará los cambios automáticamente
echo 2. Espera 2-3 minutos mientras redeploya
echo 3. Ve a: https://vercel.com/dashboard
echo 4. Verifica que el deploy sea exitoso
echo 5. Prueba: https://app-compraventa.vercel.app
echo.
echo ⏰ Mientras esperas, puedes:
echo    - Ver el progreso en Vercel Dashboard
echo    - O esperar a que te notifique por email
echo.
pause
