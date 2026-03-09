@echo off
REM Script para obtener IP local y mostrar URLs de acceso desde móvil

echo.
echo ====================================================
echo   ACCESO A LA APLICACION DESDE MOVIL
echo ====================================================
echo.

REM Obtener IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4"') do (
    set IP=%%a
    goto :found
)

:found
REM Limpiar espacios en blanco
set IP=%IP:~1%

echo Tu IP local es: %IP%
echo.
echo URLS DE ACCESO:
echo ===============
echo.
echo Frontend:  http://%IP%:3000
echo Backend:   http://%IP%:5000
echo API:       http://%IP%:5000/api
echo.
echo PASOS A SEGUIR:
echo ===============
echo.
echo 1. Asegúrate de estar en la MISMA red WiFi en tu móvil
echo 2. Abre el navegador del móvil e ingresa: http://%IP%:3000
echo 3. Si no funciona, verifica que los servidores estén corriendo
echo.
echo SOLUCIONAR PROBLEMAS:
echo =====================
echo.
echo - Verifica que backend esté corriendo: npm run dev (en carpeta backend)
echo - Verifica que frontend esté corriendo: npm run dev (en carpeta frontend)
echo - Si uso MongoDB local, inicia: iniciar-mongodb-local.bat
echo - Comprueba el firewall de Windows (permitir Node.js)
echo.
echo DOCUMENTACION COMPLETA:
echo =======================
echo Lee el archivo: ACCESO_DESDE_MOVIL.md
echo.
pause
