@echo off
REM Script para preparar la aplicación para despliegue en Render + Vercel

echo.
echo ====================================================
echo   PREPARACION PARA DESPLIEGUE EN LA NUBE
echo ====================================================
echo.

REM Verificar que Git esté instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git no está instalado. Descárgalo desde https://git-scm.com
    pause
    exit /b 1
)

REM Verificar que Node está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Descárgalo desde https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Git y Node.js detectados
echo.

REM Preguntar por variables de entorno
echo.
echo ========== CONFIGURACION REQUERIDA ==========
echo.
echo 1. MongoDB Atlas (gratis): https://mongodb.com/cloud/atlas
echo    - Crea una cuenta y base de datos
echo    - Obtén tu connection string (MONGODB_URI)
echo.
echo 2. JWT Secret seguro (genera uno):
echo    - Ejecuta: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo    - O usa: https://www.uuidgenerator.net/
echo.

set /p MONGODB_URI="Ingresa MONGODB_URI (mongodb+srv://...): "
set /p JWT_SECRET="Ingresa JWT_SECRET (mínimo 32 caracteres): "

echo.
echo ========== PREPARANDO ARCHIVOS ==========
echo.

REM Actualizar .env.production
echo # Configuración de Producción > backend\.env.production
echo PORT=5000 >> backend\.env.production
echo NODE_ENV=production >> backend\.env.production
echo MONGODB_URI=%MONGODB_URI% >> backend\.env.production
echo JWT_SECRET=%JWT_SECRET% >> backend\.env.production

echo ✅ Backend/.env.production actualizado

REM Backend
echo.
echo ========== COMPILANDO BACKEND ==========
cd backend
call npm install
if errorlevel 1 goto error
call npm run build
if errorlevel 1 goto error
cd ..
echo ✅ Backend compilado correctamente

REM Frontend
echo.
echo ========== COMPILANDO FRONTEND ==========
cd frontend
call npm install
if errorlevel 1 goto error
call npm run build
if errorlevel 1 goto error
cd ..
echo ✅ Frontend compilado correctamente

echo.
echo ========== SIGUIENTE PASO ==========
echo.
echo Opción A - Despliegue Manual:
echo   1. Ve a https://render.com (para backend)
echo   2. Ve a https://vercel.com (para frontend)
echo   3. Sigue la guía en: ACCESO_DESDE_INTERNET.md
echo.
echo Opción B - Usar GitHub Actions (automático)
echo   1. Sube a GitHub: git push origin main
echo   2. GitHub Actions desplegará automáticamente
echo.
echo ✅ Tu aplicación está lista para desplegar!
echo.
pause
goto end

:error
echo ❌ Error durante la compilación
pause
exit /b 1

:end
