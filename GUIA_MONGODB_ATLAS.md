# 🌐 GUÍA COMPLETA: CONECTAR A MONGODB ATLAS

## 📋 PASOS DETALLADOS

### **1. Crear Cuenta en MongoDB Atlas**

1. Ve a: https://cloud.mongodb.com
2. Click en **"Try Free"** o **"Sign In"**
3. Crea una cuenta con tu email o usa Google/GitHub

---

### **2. Crear un Cluster Gratuito**

1. Una vez dentro, click en **"Build a Database"**
2. Selecciona **"M0 FREE"** (Shared)
3. Configuración:
   - **Cloud Provider:** AWS (recomendado)
   - **Region:** Selecciona la más cercana (ej: N. Virginia, São Paulo)
   - **Cluster Name:** Déjalo como está o ponle "mvillacar"
4. Click en **"Create"**
5. Espera 1-3 minutos mientras se crea el cluster

---

### **3. Configurar Acceso de Red (MUY IMPORTANTE)**

1. En el menú izquierdo, click en **"Network Access"**
2. Click en **"Add IP Address"**
3. **OPCIÓN A - Permitir desde cualquier lugar (más fácil):**
   - Click en **"Allow Access from Anywhere"**
   - Verás que se agrega: `0.0.0.0/0`
   - Click en **"Confirm"**

4. **OPCIÓN B - Solo tu IP actual:**
   - Click en **"Add Current IP Address"**
   - Click en **"Confirm"**

⚠️ **IMPORTANTE:** Sin este paso, NO podrás conectarte

---

### **4. Crear Usuario de Base de Datos**

1. En el menú izquierdo, click en **"Database Access"**
2. Click en **"Add New Database User"**
3. Configuración:
   - **Authentication Method:** Password
   - **Username:** `admin` (o el que prefieras)
   - **Password:** Crea una contraseña segura (¡GUÁRDALA!)
     - Ejemplo: `Admin123456`
     - ⚠️ **NO uses caracteres especiales** como @, #, %, etc.
   - **Database User Privileges:** Selecciona **"Atlas admin"**
4. Click en **"Add User"**

---

### **5. Obtener Connection String**

1. Ve a **"Database"** en el menú izquierdo
2. En tu cluster, click en **"Connect"**
3. Selecciona **"Connect your application"**
4. Configuración:
   - **Driver:** Node.js
   - **Version:** 5.5 or later
5. **COPIA** el connection string que aparece:

```
mongodb+srv://admin:<password>@mvillacar.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### **6. Configurar en tu Aplicación**

#### **OPCIÓN A: Usar el script automático**

1. Ejecuta en la terminal:
```bash
.\configurar-atlas.bat
```

2. Sigue las instrucciones
3. Pega tu connection string cuando te lo pida
4. **IMPORTANTE:** Reemplaza `<password>` con tu contraseña real

#### **OPCIÓN B: Manual**

1. Abre el archivo `backend/.env`
2. Reemplaza la línea de MONGODB_URI con:

```env
MONGODB_URI=mongodb+srv://admin:TU_CONTRASEÑA@mvillacar.xxxxx.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
```

3. **Reemplaza:**
   - `TU_CONTRASEÑA` con la contraseña que creaste
   - `mvillacar.xxxxx` con tu cluster real
   - Agrega `/compraventa-vehiculos` antes del `?`

---

### **7. Reiniciar el Backend**

```bash
.\reiniciar-backend.bat
```

---

## ✅ VERIFICAR CONEXIÓN

Deberías ver en la terminal:

```
✅ MongoDB conectado exitosamente
🚀 Servidor corriendo en puerto 5000
```

---

## ❌ SOLUCIÓN DE PROBLEMAS

### **Error: "querySrv ECONNREFUSED"**

**Causa:** Problema de DNS o red

**Soluciones:**
1. Verifica tu conexión a internet
2. Intenta cambiar de red WiFi
3. Desactiva VPN si tienes una
4. Usa el formato de connection string alternativo:

```
mongodb://admin:password@cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/compraventa-vehiculos?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### **Error: "Authentication failed"**

**Causa:** Usuario o contraseña incorrectos

**Soluciones:**
1. Verifica que reemplazaste `<password>` con tu contraseña real
2. Asegúrate de no tener espacios extra
3. Si tu contraseña tiene caracteres especiales, cámbiala por una más simple

### **Error: "IP not whitelisted"**

**Causa:** Tu IP no está permitida

**Solución:**
1. Ve a "Network Access" en Atlas
2. Agrega `0.0.0.0/0` para permitir todas las IPs

---

## 🔄 VOLVER A MONGODB LOCAL

Si prefieres usar MongoDB local nuevamente:

```bash
.\iniciar-mongodb-local.bat
```

---

## 📞 NECESITAS AYUDA?

Si sigues teniendo problemas:

1. Verifica que completaste TODOS los pasos
2. Revisa que tu contraseña no tenga caracteres especiales
3. Confirma que agregaste `0.0.0.0/0` en Network Access
4. Intenta crear un nuevo usuario con contraseña simple

---

## ✨ VENTAJAS DE MONGODB ATLAS

✅ **Gratis hasta 512MB**
✅ **No necesitas instalar MongoDB localmente**
✅ **Accesible desde cualquier lugar**
✅ **Backups automáticos**
✅ **Más seguro y confiable**

---

¡Buena suerte! 🚀
