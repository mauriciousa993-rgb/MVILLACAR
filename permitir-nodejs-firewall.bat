@echo off
chcp 65001 >nul
echo ========================================
echo CONFIGURANDO FIREWALL PARA NODE.JS
echo ========================================
echo.
echo Este script agregará una regla al firewall de Windows
echo para permitir que Node.js se conecte a MongoDB Atlas.
echo.
echo NOTA: Necesitas ejecutar esto como ADMINISTRADOR
echo.
pause

echo.
echo Agregando regla de firewall para Node.js...
echo.

netsh advfirewall firewall add rule name="Node.js MongoDB" dir=out action=allow program="%ProgramFiles%\nodejs\node.exe" enable=yes

netsh advfirewall firewall add rule name="Node.js MongoDB (x86)" dir=out action=allow program="%ProgramFiles(x86)%\nodejs\node.exe" enable=yes

echo.
echo ========================================
echo ✅ REGLAS DE FIREWALL AGREGADAS
echo ========================================
echo.
echo Ahora Node.js puede conectarse a MongoDB Atlas.
echo.
pause
