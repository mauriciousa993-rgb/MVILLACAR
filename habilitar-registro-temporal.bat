@echo off
echo ========================================
echo HABILITAR REGISTRO TEMPORAL
echo ========================================
echo.
echo Este script habilitara temporalmente el registro
echo para que puedas crear el admin desde la API.
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo Habilitando registro en auth.routes.ts...
echo.

cd backend\src\routes

:: Crear backup
copy auth.routes.ts auth.routes.ts.backup

:: Descomentar la linea de registro
powershell -Command "(Get-Content auth.routes.ts) -replace '// router.post\(''/register'', register\);', 'router.post(''/register'', register);' | Set-Content auth.routes.ts"

echo.
echo ✅ Registro habilitado
echo.
echo ========================================
echo SIGUIENTE PASO:
echo ========================================
echo.
echo 1. Ejecuta: subir-cambios-github.bat
echo 2. Espera 2-3 minutos (Render hara redeploy)
echo 3. Ejecuta: crear-admin-api.bat
echo 4. Ejecuta: deshabilitar-registro.bat
echo.
echo ========================================
pause
