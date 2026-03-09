@echo off
REM Script para desplegar automáticamente en GitHub, Render y Vercel
REM Este script prepara TODO para el despliegue

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║        DESPLIEGUE AUTOMATICO - PASO 1: GIT & GITHUB        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar que Git esté instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git NO está instalado
    echo.
    echo Descarga Git desde: https://git-scm.com/download/win
    echo Después re-ejecuta este script
    pause
    exit /b 1
)

echo ✅ Git detectado
echo.

REM Inicializar Git en el proyecto
echo ========== INICIALIZANDO GIT ==========
echo.

cd /d "%~dp0"
git init
git config user.name "Mauri"
git config user.email "mauri@example.com"

echo.
echo ========== AGREGANDO ARCHIVOS ==========
echo.

git add .

echo.
echo ========== CREANDO PRIMER COMMIT ==========
echo.

git commit -m "Versión inicial - App Compraventa de Vehículos"

echo.
echo ========== SIGUIENTE PASO: GITHUB ==========
echo.
echo Tu código local está listo. Ahora necesitas:
echo.
echo 1. Ve a: https://github.com/new
echo 2. Crea un repositorio llamado: app-compraventa
echo 3. Selecciona PRIVADO
echo 4. Click en CREATE REPOSITORY
echo.
echo Espera la siguiente pantalla con instrucciones...
echo Verás algo como: "git remote add origin https://github.com/TU_USUARIO/app-compraventa.git"
echo.
echo 5. COPIA la URL de tu repositorio y pégala aquí:
echo.

set /p GITHUB_URL="Ingresa tu URL de GitHub (https://github.com/...): "

if "%GITHUB_URL%"=="" (
    echo ❌ No ingresaste URL
    pause
    exit /b 1
)

echo.
echo ========== CONECTANDO A GITHUB ==========
echo.

git remote add origin %GITHUB_URL%
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Error al conectar con GitHub
    echo.
    echo Posibles soluciones:
    echo 1. Verifica que la URL es correcta
    echo 2. Asegúrate de haber creado el repositorio en GitHub
    echo 3. Genera un token en GitHub (Settings → Developer Settings → Personal Access Tokens)
    echo 4. Usa el token como contraseña cuando Git lo pida
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ ¡Código subido a GitHub exitosamente!
echo.
echo ========== SIGUIENTE PASO ==========
echo.
echo Tu código está ahora en: %GITHUB_URL%
echo.
echo PRÓXIMOS PASOS:
echo 1. Abre: https://mongodb.com/cloud/atlas
echo 2. Crea una cuenta y cluster MongoDB (Gratis)
echo 3. Copia tu MONGODB_URI
echo 4. Guarda para el siguiente paso
echo.
pause
