@echo off
echo ========================================
echo DESHABILITAR REGISTRO (SEGURIDAD)
echo ========================================
echo.
echo Este script deshabilitara el registro nuevamente
echo por seguridad.
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo Deshabilitando registro en auth.routes.ts...
echo.

cd backend\src\routes

:: Comentar la linea de registro
powershell -Command "(Get-Content auth.routes.ts) -replace 'router.post\(''/register'', register\);', '// router.post(''/register'', register);' | Set-Content auth.routes.ts"

echo.
echo ✅ Registro deshabilitado
echo.
echo ========================================
echo SIGUIENTE PASO:
echo ========================================
echo.
echo 1. Ejecuta: subir-cambios-github.bat
echo 2. Espera 2-3 minutos (Render hara redeploy)
echo 3. Configura Vercel (VITE_API_URL)
echo 4. Accede a tu app y haz login
echo.
echo ========================================
pause
