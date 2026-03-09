@echo off
chcp 65001 >nul
echo ========================================
echo SUBIR CAMBIOS A GITHUB
echo ========================================
echo.

echo 📝 Cambios realizados:
echo    - VIN y Color ahora son opcionales
echo    - Mejor manejo de errores en el backend
echo.

echo 🔍 Verificando estado de Git...
git status

echo.
echo ========================================
echo.

echo 📦 Agregando archivos al commit...
git add backend/src/models/Vehicle.ts
git add backend/src/controllers/vehicle.controller.ts
git add SOLUCION_ERROR_CREAR_VEHICULO.md
git add SOLUCION_MONGODB_LOCAL.md
git add CONFIGURAR_MONGODB_RENDER.md

echo.
echo ✅ Archivos agregados
echo.

echo 💾 Creando commit...
git commit -m "Fix: VIN y Color opcionales - Solución error crear vehículo"

echo.
echo 🚀 Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo ✅ CAMBIOS SUBIDOS A GITHUB
echo ========================================
echo.
echo 📋 Próximos pasos:
echo.
echo 1. Ve a Render: https://dashboard.render.com/
echo 2. Selecciona tu backend
echo 3. Render detectará los cambios automáticamente
echo 4. Espera 2-3 minutos mientras redeploya
echo 5. Sigue la guía: CONFIGURAR_MONGODB_RENDER.md
echo.
pause
