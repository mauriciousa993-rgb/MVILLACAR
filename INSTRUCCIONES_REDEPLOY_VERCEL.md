# Instrucciones para Redeploy Manual en Vercel

## Si los cambios no aparecen automáticamente, sigue estos pasos:

### 1. Acceder al Dashboard de Vercel
- Ve a https://vercel.com/dashboard
- Inicia sesión con tu cuenta
- Busca tu proyecto "app-compraventa"

### 2. Forzar Redeploy Manual
1. Haz clic en tu proyecto
2. Ve a la pestaña "Deployments" (Despliegues)
3. Busca el deploy más reciente
4. Haz clic en el botón "..." (tres puntos) al lado del deploy
5. Selecciona "Redeploy" (Redesplegar)
6. En la ventana emergente, marca la casilla "Use existing Build Cache" (USAR CACHÉ EXISTENTE) → **DESMÁRCALA** para forzar build limpio
7. Haz clic en "Redeploy"

### 3. Verificar Variables de Entorno
1. En el dashboard del proyecto, ve a "Settings" (Configuración)
2. Luego a "Environment Variables" (Variables de Entorno)
3. Asegúrate de que exista:
   - `VITE_API_URL` = `https://app-compraventa.onrender.com`

### 4. Verificar Configuración de Build
1. En Settings, ve a "General"
2. Verifica:
   - **Framework Preset**: Vite
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Root Directory**: `./` (debe estar vacío o en ./)

### 5. Verificar Logs
Si el deploy falla:
1. Ve a la pestaña "Deployments"
2. Haz clic en el deploy que falló
3. Revisa los logs de build para ver errores

## Comandos para verificar localmente:

```bash
# Verificar que el código está correcto
git log --oneline -5

# Verificar último push
git status

# Forzar push si es necesario
git push origin main --force
```

## Si todo falla - Solución Nuclear:

### Opción A: Crear nuevo proyecto en Vercel
1. Elimina el proyecto actual de Vercel
2. Crea uno nuevo importando desde GitHub
3. Configura las variables de entorno nuevamente

### Opción B: Usar CLI de Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar manualmente
cd frontend
vercel --prod
```

## Contacto
Si sigue sin funcionar, revisa los logs de Vercel y comparte cualquier error que veas.
