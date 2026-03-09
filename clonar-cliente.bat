@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ------------------------------------------------------------
REM clonar-cliente.bat
REM Crea una copia limpia del proyecto en el Escritorio.
REM Incluye explicitamente los assets 3D.
REM Uso opcional: clonar-cliente.bat nombre-cliente --nopause
REM ------------------------------------------------------------

set "SOURCE_DIR=%~dp0"
if "%SOURCE_DIR:~-1%"=="\" set "SOURCE_DIR=%SOURCE_DIR:~0,-1%"

set "NO_PAUSE=0"
if /I "%~2"=="--nopause" set "NO_PAUSE=1"

for /f "usebackq delims=" %%D in (`powershell -NoProfile -Command "[Environment]::GetFolderPath('Desktop')"`) do set "DESKTOP_DIR=%%D"
if not defined DESKTOP_DIR (
    echo No se pudo detectar la ruta del Escritorio.
    if "%NO_PAUSE%"=="1" exit /b 1
    pause
    exit /b 1
)

echo.
echo ==============================================
echo   CLONAR PROYECTO PARA CLIENTE NUEVO
echo ==============================================
echo.
echo Origen:  %SOURCE_DIR%
echo Destino: %DESKTOP_DIR%
echo.

set "CLIENT_NAME=%~1"
if not defined CLIENT_NAME (
    set /p CLIENT_NAME="Nombre del cliente (ej: autos-perez): "
)

if "%CLIENT_NAME%"=="" (
    echo Debes ingresar un nombre de cliente.
    if "%NO_PAUSE%"=="1" exit /b 1
    pause
    exit /b 1
)

set "RAW_CLIENT_NAME=%CLIENT_NAME%"
set "CLIENT_SAFE="
for /f "usebackq delims=" %%N in (`powershell -NoProfile -Command "$n=$env:RAW_CLIENT_NAME; $n=[regex]::Replace($n,'[\\/:*?""<>| ]+','-').Trim('-'); if([string]::IsNullOrWhiteSpace($n)){$n='cliente'}; Write-Output $n"`) do set "CLIENT_SAFE=%%N"

if not defined CLIENT_SAFE (
    echo No se pudo normalizar el nombre del cliente.
    if "%NO_PAUSE%"=="1" exit /b 1
    pause
    exit /b 1
)

set "DEST_DIR=%DESKTOP_DIR%\app-compraventa-!CLIENT_SAFE!"

if exist "%DEST_DIR%" (
    echo.
    echo Ya existe la carpeta destino:
    echo %DEST_DIR%
    echo Cambia el nombre del cliente o elimina esa carpeta primero.
    if "%NO_PAUSE%"=="1" exit /b 1
    pause
    exit /b 1
)

echo.
echo Creando copia limpia en:
echo %DEST_DIR%
echo.

robocopy "%SOURCE_DIR%" "%DEST_DIR%" /E /R:2 /W:1 /NFL /NDL /NP ^
    /XD "%SOURCE_DIR%\.git" "%SOURCE_DIR%\.vscode" "%SOURCE_DIR%\.claude" "%SOURCE_DIR%\backend\node_modules" "%SOURCE_DIR%\frontend\node_modules" "%SOURCE_DIR%\backend\dist" "%SOURCE_DIR%\frontend\dist" "%SOURCE_DIR%\backend\uploads" ^
    /XF "*.log" ".env" ".env.production" ".env.backup" ".env.backup.local"

set "ROBOCODE=%ERRORLEVEL%"
if %ROBOCODE% GEQ 8 (
    echo.
    echo Error al copiar. Codigo de Robocopy: %ROBOCODE%
    if "%NO_PAUSE%"=="1" exit /b %ROBOCODE%
    pause
    exit /b %ROBOCODE%
)

echo.
echo Copiando assets 3D...

if exist "%SOURCE_DIR%\frontend\public\models" (
    robocopy "%SOURCE_DIR%\frontend\public\models" "%DEST_DIR%\frontend\public\models" /E /R:2 /W:1 /NFL /NDL /NP
    set "ROBO3D_FRONT=!ERRORLEVEL!"
    if !ROBO3D_FRONT! GEQ 8 (
        echo Error copiando frontend\public\models. Codigo: !ROBO3D_FRONT!
        if "%NO_PAUSE%"=="1" exit /b !ROBO3D_FRONT!
        pause
        exit /b !ROBO3D_FRONT!
    )
)

if exist "%SOURCE_DIR%\backend\templates\source" (
    robocopy "%SOURCE_DIR%\backend\templates\source" "%DEST_DIR%\backend\templates\source" /E /R:2 /W:1 /NFL /NDL /NP
    set "ROBO3D_BACK=!ERRORLEVEL!"
    if !ROBO3D_BACK! GEQ 8 (
        echo Error copiando backend\templates\source. Codigo: !ROBO3D_BACK!
        if "%NO_PAUSE%"=="1" exit /b !ROBO3D_BACK!
        pause
        exit /b !ROBO3D_BACK!
    )
)

set "HAS_3D="
if exist "%DEST_DIR%\frontend\public\models\*.gltf" set "HAS_3D=1"
if exist "%DEST_DIR%\frontend\public\models\*.glb"  set "HAS_3D=1"
if exist "%DEST_DIR%\frontend\public\models\*.fbx"  set "HAS_3D=1"
if exist "%DEST_DIR%\frontend\public\models\*.obj"  set "HAS_3D=1"

echo.
if defined HAS_3D (
    echo Assets 3D incluidos correctamente.
) else (
    echo Aviso: no se detectaron modelos 3D en frontend\public\models.
)

echo.
echo Copia limpia creada correctamente.
echo Ruta: %DEST_DIR%
echo.
echo Siguiente paso recomendado:
echo 1) Configurar backend\.env y frontend\.env con datos del nuevo cliente.
echo 2) Ejecutar npm install en backend y frontend.
echo.

if "%NO_PAUSE%"=="1" exit /b 0
pause
exit /b 0
