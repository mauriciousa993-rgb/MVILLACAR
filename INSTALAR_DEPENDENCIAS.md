# 🔧 Cómo Instalar las Dependencias

## ⚠️ Problema Detectado

Tu sistema Windows tiene restricciones de ejecución de scripts de PowerShell. Esto es normal por seguridad.

## ✅ Solución: Usar CMD en lugar de PowerShell

### Opción 1: Usar CMD (Recomendado)

1. **Abre una nueva terminal CMD:**
   - En VSCode: Click en la flecha hacia abajo al lado del `+` en la terminal
   - Selecciona: **"Command Prompt"** o **"cmd"**
   
2. **Instala las dependencias del backend:**
   ```cmd
   cd backend
   npm install
   ```
   
3. **Espera a que termine** (2-3 minutos)

4. **Abre OTRA terminal CMD nueva**

5. **Instala las dependencias del frontend:**
   ```cmd
   cd frontend
   npm install
   ```

### Opción 2: Habilitar Scripts en PowerShell (Alternativa)

Si prefieres usar PowerShell, ejecuta esto como Administrador:

1. **Abre PowerShell como Administrador:**
   - Click derecho en el menú Inicio
   - Selecciona "Windows PowerShell (Administrador)"

2. **Ejecuta este comando:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Confirma con "S" (Sí)**

4. **Cierra PowerShell de administrador**

5. **Vuelve a VSCode y ejecuta:**
   ```powershell
   cd backend
   npm install
   ```

### Opción 3: Usar Git Bash (Si lo tienes instalado)

1. **Abre Git Bash en VSCode**
2. **Ejecuta:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

## 📋 Pasos Después de Instalar

Una vez instaladas las dependencias:

### 1. Configurar MongoDB Atlas

**IMPORTANTE:** Antes de iniciar el backend, necesitas configurar MongoDB:

1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita
3. Crea un cluster M0 (gratis)
4. Crea un usuario de base de datos
5. Permite acceso desde cualquier IP (0.0.0.0/0)
6. Obtén tu connection string

### 2. Actualizar el archivo .env

Abre el archivo `backend/.env` y actualiza esta línea:

```env
MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@TU_CLUSTER.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
```

Reemplaza:
- `TU_USUARIO` con tu usuario de MongoDB
- `TU_PASSWORD` con tu contraseña
- `TU_CLUSTER` con el nombre de tu cluster

**Ejemplo:**
```env
MONGODB_URI=mongodb+srv://admin:admin123@cluster0.abc123.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
```

### 3. Iniciar el Backend

En la terminal CMD (carpeta backend):
```cmd
npm run dev
```

Deberías ver:
```
✅ MongoDB conectado exitosamente
🚀 Servidor corriendo en puerto 5000
```

### 4. Iniciar el Frontend

En OTRA terminal CMD (carpeta frontend):
```cmd
npm run dev
```

Deberías ver:
```
➜  Local:   http://localhost:3000/
```

### 5. Abrir en el Navegador

Ve a: **http://localhost:3000**

## 🆘 Si Tienes Problemas

### Error: "npm no se reconoce como comando"

**Solución:** Node.js no está en el PATH. Reinstala Node.js desde:
https://nodejs.org/

Durante la instalación, asegúrate de marcar la opción:
☑️ "Add to PATH"

### Error: "Cannot find module"

**Solución:** Las dependencias no se instalaron correctamente. Intenta:
```cmd
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Error de conexión a MongoDB

**Solución:**
1. Verifica que tu connection string sea correcto
2. Verifica que hayas permitido tu IP en MongoDB Atlas
3. Verifica que el usuario y contraseña sean correctos

## 📞 Necesitas Ayuda

Si sigues teniendo problemas:

1. Toma una captura de pantalla del error
2. Copia el mensaje de error completo
3. Avísame y te ayudo a resolverlo

## ✅ Checklist

- [ ] Abrir terminal CMD (no PowerShell)
- [ ] Instalar dependencias del backend
- [ ] Instalar dependencias del frontend
- [ ] Crear cuenta en MongoDB Atlas
- [ ] Configurar archivo .env con connection string
- [ ] Iniciar backend (npm run dev)
- [ ] Iniciar frontend (npm run dev)
- [ ] Abrir http://localhost:3000
- [ ] Crear primer usuario
- [ ] ¡Listo para usar!

---

**Tip:** Usa CMD en lugar de PowerShell para evitar problemas con permisos de scripts.
