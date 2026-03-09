@echo off
echo ========================================
echo OBTENER MONGODB URI
echo ========================================
echo.
echo Tu MongoDB URI esta en el archivo:
echo backend/.env
echo.
echo Busca la linea que dice:
echo MONGODB_URI=mongodb+srv://...
echo.
echo ========================================
echo PASOS PARA CONFIGURAR EN RENDER:
echo ========================================
echo.
echo 1. Abre el archivo: backend/.env
echo 2. Copia el valor de MONGODB_URI
echo 3. Ve a: https://dashboard.render.com
echo 4. Click en tu servicio de backend
echo 5. Click en "Environment" (menu lateral)
echo 6. Busca MONGODB_URI
echo 7. Si NO existe, agregala:
echo    - Click "Add Environment Variable"
echo    - Name: MONGODB_URI
echo    - Value: (pega el valor que copiaste)
echo    - Save Changes
echo 8. Render hara redeploy automaticamente
echo 9. Espera 2-3 minutos
echo.
echo ========================================
echo IMPORTANTE:
echo ========================================
echo.
echo - La URI debe empezar con: mongodb+srv://
echo - Debe tener tu password (no <password>)
echo - Debe apuntar a MongoDB Atlas (nube)
echo - NO debe ser mongodb://localhost
echo.
echo ========================================
pause
