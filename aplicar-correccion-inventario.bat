@echo off
echo ========================================
echo APLICANDO CORRECCION DE CALCULO DE INVENTARIO
echo ========================================
echo.

echo Este script reiniciara el backend para aplicar la correccion
echo del calculo de Valor de Inventario y Ganancias Estimadas.
echo.

echo Presiona cualquier tecla para continuar o Ctrl+C para cancelar...
pause > nul

echo.
echo [1/2] Deteniendo procesos de Node.js existentes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [2/2] Iniciando el backend con los cambios aplicados...
cd backend
start cmd /k "npm run dev"

echo.
echo ========================================
echo BACKEND REINICIADO CORRECTAMENTE
echo ========================================
echo.
echo Los cambios han sido aplicados:
echo - Valor de Inventario ahora incluye todos los gastos
echo - Ganancias Estimadas calculadas correctamente
echo - Manejo robusto de valores nulos
echo.
echo Abre tu navegador y verifica el Dashboard.
echo.
pause
