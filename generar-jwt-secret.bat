@echo off
REM Script para generar JWT_SECRET seguro

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           GENERAR JWT_SECRET SEGURO                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Generar JWT_SECRET con Node.js
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_SECRET=%%i

echo ✅ JWT_SECRET generado:
echo.
echo %JWT_SECRET%
echo.
echo ========================================
echo.
echo ⚠️  IMPORTANTE:
echo.
echo 1. COPIA el código anterior (sin comillas)
echo 2. Lo usarás en Render y Vercel
echo 3. NO lo compartas con nadie
echo.
pause
