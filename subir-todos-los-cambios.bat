@echo off
echo ========================================
echo   SUBIR TODOS LOS CAMBIOS A GITHUB
echo   (Render y Vercel)
echo ========================================
echo.

echo [1/6] Verificando estado de Git...
git status --short
echo.

echo [2/6] Agregando archivos del FRONTEND modificados...
git add frontend/src/pages/FixedExpenses.tsx
git add frontend/src/pages/Reports.tsx
git add frontend/src/pages/Dashboard.tsx
git add frontend/src/pages/VehicleList.tsx
git add frontend/src/pages/Marketplace.tsx
git add frontend/src/pages/Login.tsx
git add frontend/src/pages/VehicleForm.tsx
git add frontend/src/App.tsx
git add frontend/src/components/Layout/Layout.tsx
git add frontend/src/components/Layout/Navbar.tsx
git add frontend/src/components/SaleDataModal.tsx
git add frontend/src/services/api.ts
git add frontend/src/types/index.ts
git add frontend/src/index.css
git add frontend/tailwind.config.js
git add frontend/index.html
git add frontend/src/vite-env.d.ts
git add frontend/public/autotech-logo.png
git add frontend/public/autotech-logo.svg
git add frontend/src/assets/
echo [OK] Frontend archivos agregados
echo.

echo [3/6] Agregando archivos del BACKEND modificados...
git add backend/src/controllers/vehicle.controller.ts
git add backend/src/controllers/fixedExpense.controller.ts
git add backend/src/controllers/reportTemplates.controller.ts
git add backend/src/models/Vehicle.ts
git add backend/src/models/FixedExpense.ts
git add backend/src/routes/vehicle.routes.ts
git add backend/src/routes/fixedExpense.routes.ts
git add backend/src/server.ts
git add "backend/templates/Formulario traspaso de vehiculos.pdf"
git add "backend/templates/Tech-Inspired Logo for Autotech Inventory App.png"
echo [OK] Backend archivos agregados
echo.

echo [4/6] Agregando archivos de configuracion...
git add frontend/vercel.json
git add frontend/tsconfig.json
git add frontend/package.json
git add backend/package.json
echo [OK] Configuracion agregada
echo.

echo [5/6] Creando commit con todos los cambios...
git commit -m "feat: Agrega gastos fijos, mejoras en reportes y cambios esteticos

- Agrega modulo de gastos fijos (FixedExpenses)
- Implementa controlador de plantillas de reportes
- Mejora en la seccion de reportes
- Actualizacion de estilos y componentes
- Agrega logos y activos
- Mejoras en Dashboard y VehicleList"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se pudo crear el commit. Puede que no haya cambios para commitear.
    echo.
    pause
    exit /b 1
)
echo [OK] Commit creado exitosamente
echo.

echo [6/6] Subiendo cambios a GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se pudo subir a GitHub. Verifica tu conexion.
    echo.
    pause
    exit /b 1
)
echo [OK] Cambios subidos exitosamente
echo.

echo ========================================
echo   ¡COMPLETADO!
echo ========================================
echo.
echo Los cambios han sido subidos a GitHub.
echo.
echo PROXIMOS PASOS:
echo ----------------
echo 1. RENDER (Backend):
echo    - Ve a: https://dashboard.render.com
echo    - Tu servicio se redeployara automaticamente
echo    - Espera 2-3 minutos a que termine el build
echo.
echo 2. VERCEL (Frontend):
echo    - Ve a: https://vercel.com/dashboard
echo    - El deployment se iniciara automaticamente
echo    - Espera 1-2 minutos a que termine el build
echo.
echo 3. VERIFICAR:
echo    - Prueba la nueva seccion de Gastos Fijos
echo    - Verifica los cambios en Reportes
echo    - Revisa los cambios esteticos
echo.
echo ========================================
pause
