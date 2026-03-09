# ¿Por qué no veo mi información? - Solución

## 🔍 Diagnóstico del Problema

Tu información (vehículos, usuarios, etc.) está guardada en **MongoDB Atlas** (base de datos en la nube).

El problema puede ser uno de estos:

### 1. Backend en Render NO está conectado a MongoDB Atlas
- El backend necesita la variable `MONGODB_URI` configurada
- Sin esta variable, no puede acceder a tus datos

### 2. Estás viendo datos locales vs datos de producción
- Local: Base de datos en tu computadora
- Producción: Base de datos en MongoDB Atlas

## ✅ Solución: Configurar MongoDB en Render

### Paso 1: Obtener tu MongoDB URI

**Opción A: Si ya tienes MongoDB Atlas configurado**

1. Ve a https://cloud.mongodb.com
2. Click en "Connect" en tu cluster
3. Click en "Connect your application"
4. Copia la connection string (URI)
5. Reemplaza `<password>` con tu contraseña real

Ejemplo:
```
mongodb+srv://usuario:TU_PASSWORD@cluster0.xxxxx.mongodb.net/compraventa?retryWrites=true&w=majority
```

**Opción B: Si no recuerdas tu URI**

Busca en tu archivo local:
```
backend/.env
```

Busca la línea que dice:
```
MONGODB_URI=mongodb+srv://...
```

### Paso 2: Configurar en Render

1. Ve a https://dashboard.render.com
2. Click en tu servicio de backend
3. Click en "Environment" en el menú lateral
4. Busca la variable `MONGODB_URI`

**Si NO existe:**
- Click en "Add Environment Variable"
- Name: `MONGODB_URI`
- Value: Tu connection string de MongoDB Atlas
- Click "Save Changes"

**Si ya existe:**
- Verifica que sea la correcta
- Debe apuntar a MongoDB Atlas, no a localhost

### Paso 3: Otras Variables Necesarias

Asegúrate de que también estén configuradas:

```
JWT_SECRET=tu_secreto_jwt_aqui
PORT=5000
NODE_ENV=production
```

### Paso 4: Redeploy

Después de configurar las variables:
1. Render hará redeploy automáticamente
2. O puedes forzarlo: Click en "Manual Deploy" → "Deploy latest commit"
3. Espera 2-3 minutos

## 🔍 Verificar Conexión

### Opción 1: Desde Render Logs

1. En Render Dashboard → Tu servicio
2. Click en "Logs"
3. Busca mensajes como:
   - ✅ "MongoDB conectado exitosamente"
   - ❌ "Error conectando a MongoDB"

### Opción 2: Probar el Endpoint

```bash
curl https://app-compraventa.onrender.com/api/vehicles/statistics
```

Si responde con datos, está conectado correctamente.

## 📊 Entender Dónde Están Tus Datos

### Datos Locales (localhost)
- Cuando corres `npm run dev` localmente
- Se conecta a MongoDB local o a la URI en tu archivo `.env`
- URL: http://localhost:5000

### Datos en Producción (Render)
- Cuando accedes desde Vercel o desde internet
- Se conecta a MongoDB Atlas (nube)
- URL: https://app-compraventa.onrender.com

**IMPORTANTE:** Son bases de datos DIFERENTES a menos que ambas apunten a MongoDB Atlas.

## 🔄 Sincronizar Datos

Si tienes datos locales que quieres en producción:

### Opción 1: Usar la misma base de datos

En tu archivo local `backend/.env`:
```
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/compraventa
```

Así tanto local como producción usan la misma base de datos.

### Opción 2: Exportar/Importar

**Exportar desde local:**
```bash
mongodump --uri="mongodb://localhost:27017/compraventa" --out=backup
```

**Importar a Atlas:**
```bash
mongorestore --uri="mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/compraventa" backup/compraventa
```

## ✅ Checklist de Verificación

- [ ] MongoDB Atlas está activo
- [ ] Tienes la connection string (URI)
- [ ] Variable `MONGODB_URI` configurada en Render
- [ ] Render hizo redeploy después de agregar la variable
- [ ] Los logs de Render muestran "MongoDB conectado"
- [ ] El endpoint de estadísticas responde con datos

## 🚨 Problemas Comunes

### "No veo mis vehículos"
**Causa:** Backend no conectado a MongoDB Atlas
**Solución:** Configurar `MONGODB_URI` en Render

### "Veo datos diferentes en local vs producción"
**Causa:** Bases de datos diferentes
**Solución:** Usar la misma URI en ambos lados

### "Error de autenticación MongoDB"
**Causa:** Password incorrecta en la URI
**Solución:** Verificar password en MongoDB Atlas

### "IP no autorizada"
**Causa:** MongoDB Atlas bloqueando la IP de Render
**Solución:** 
1. Ve a MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Save

## 📝 Resumen

Tu información está segura en MongoDB Atlas. Solo necesitas:

1. **Configurar `MONGODB_URI` en Render** con tu connection string de MongoDB Atlas
2. **Permitir acceso desde cualquier IP** en MongoDB Atlas
3. **Redeploy** en Render
4. **Verificar** que se conectó correctamente

Una vez hecho esto, verás toda tu información en producción.

---

**¿Necesitas ayuda para obtener tu MongoDB URI?**
Revisa tu archivo `backend/.env` local o accede a MongoDB Atlas.
