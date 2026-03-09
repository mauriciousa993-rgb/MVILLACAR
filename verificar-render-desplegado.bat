@echo off
echo ========================================
echo VERIFICANDO ESTADO DE RENDER
echo ========================================
echo.

echo Probando el endpoint de estadisticas en Render...
echo.

curl -X GET "https://app-compraventa-backend.onrender.com/api/vehicles/statistics" -H "Authorization: Bearer TU_TOKEN_AQUI"

echo.
echo ========================================
echo.
echo Si ves un error de autorizacion, es normal.
echo Lo importante es verificar que Render responda.
echo.
echo Si ves "Cannot GET" o timeout, Render aun esta desplegando.
echo Espera 2-3 minutos mas y vuelve a intentar.
echo.
pause
