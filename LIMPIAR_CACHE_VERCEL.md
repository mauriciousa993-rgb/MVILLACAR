# 🧹 Cómo Limpiar el Caché de Vercel

## ⚠️ IMPORTANTE
Vercel está usando una versión en caché del código antiguo. Necesitas forzar un rebuild limpio.

## 📋 Pasos para Limpiar el Caché

### Opción 1: Desde el Dashboard de Vercel (RECOMENDADO)

1. **Ve a tu proyecto en Vercel**
   - Abre https://vercel.com
   - Click en tu proyecto

2. **Ve a la pestaña "Deployments"**
   - Verás una lista de todos los deployments

3. **Encuentra el deployment más reciente**
   - Debe decir "Building" o "Ready"
   - Si dice "Building", espera a que termine

4. **Click en los 3 puntos (...) del deployment**
   - Selecciona "Redeploy"
   - **MUY IMPORTANTE**: Marca la opción "Use existing Build Cache" y DESMÁRCALA
   - O mejor aún, selecciona "Redeploy with different settings"

5. **En la ventana que se abre:**
   - Busca la opción "Clear Build Cache" o "Ignore Build Cache"
   - Márcala ✓
   - Click en "Redeploy"

### Opción 2: Desde Settings (ALTERNATIVA)

1. **Ve a Settings → General**
2. **Busca "Build & Development Settings"**
3. **En "Build Command" cambia temporalmente a:**
   ```
   rm -rf .next && npm run build
   ```
4. **Guarda los cambios**
5. **Ve a Deployments y haz Redeploy**
6. **Después vuelve a cambiar el Build Command a:**
   ```
   npm run build
   ```

### Opción 3: Forzar con Variable de Entorno

1. **Ve a Settings → Environment Variables**
2. **Agrega una nueva variable:**
   - Name: `VERCEL_FORCE_NO_BUILD_CACHE`
   - Value: `1`
   - Environments: Marca solo "Production"
3. **Guarda**
4. **Ve a Deployments → Redeploy**
5. **Después de que funcione, ELIMINA esta variable**

## ✅ Verificar que Funcionó

Después del redeploy:

1. **Espera a que termine el build** (2-3 minutos)
2. **Verifica que diga "Ready" con ✓ verde**
3. **Abre tu app en el navegador**
4. **Presiona Ctrl+Shift+R** (o Cmd+Shift+R en Mac) para limpiar caché del navegador
5. **Verifica que la app cargue correctamente**

## 🔍 Si Sigue Fallando

Si después de limpiar el caché sigue el error:

1. **Copia el error COMPLETO del build log**
2. **Compártelo conmigo**
3. **Probaremos otra solución**

## 📝 Notas

- El caché de Vercel puede causar que use código antiguo
- Siempre limpia el caché cuando hagas cambios importantes
- El rebuild limpio toma un poco más de tiempo pero asegura que use el código nuevo

---

**Última actualización:** ${new Date().toLocaleString('es-ES')}
