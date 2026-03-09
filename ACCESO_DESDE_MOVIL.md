# 📱 Guía de Acceso desde Móvil

## Requisitos

1. **Computadora y móvil en la MISMA red WiFi**
2. **Puerto 5000 (backend) y 3000 (frontend) abiertos en el firewall**
3. **Variables de entorno configuradas (.env)**

## Paso 1: Obtener la IP de tu Computadora

### Windows:
```powershell
ipconfig
```
Busca la sección "IPv4 Address" bajo tu conexión WiFi (ejemplo: `192.168.1.100`)

### macOS/Linux:
```bash
ifconfig
```
Busca la dirección IPv4 de tu conexión WiFi

## Paso 2: Configurar Variables de Entorno

### Backend (crear archivo `.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/compraventa-vehiculos
JWT_SECRET=tu_secreto_muy_seguro_cambiar_esto
NODE_ENV=development
```

### Frontend (crear archivo `.env.local`):
```
VITE_API_URL=http://192.168.1.100:5000/api
```
*(Reemplaza `192.168.1.100` con tu IP real)*

## Paso 3: Iniciar el Servidor Backend

```bash
cd backend
npm install  # Solo la primera vez
npm run dev
```

Espera el mensaje:
```
✅ El servidor está listo para recibir conexiones desde móviles y otros dispositivos.
📍 URLs:
   - Local: http://localhost:5000
   - Red/Móvil: http://192.168.1.100:5000
```

## Paso 4: Iniciar el Servidor Frontend

En otra terminal:
```bash
cd frontend
npm install  # Solo la primera vez
npm run dev
```

Espera el mensaje:
```
  ➜  Local:   http://localhost:3000
  ➜  Network: http://192.168.1.100:3000
```

## Paso 5: Acceder desde el Móvil

### En el navegador del móvil, abre:
```
http://192.168.1.100:3000
```

*(Usa tu IP real en lugar de 192.168.1.100)*

### ✅ Deberías ver:
- La página de login
- Poder registrarte
- Poder ver el dashboard después de iniciar sesión

## 🔧 Solución de Problemas

### ❌ "No se puede alcanzar la página"

1. **Verifica la IP correcta:**
   ```powershell
   ipconfig
   ```

2. **Verifica que backend esté corriendo:**
   - Abre en el navegador del móvil: `http://192.168.1.100:5000`
   - Deberías ver: `{"message": "API de Compraventa de Vehículos", ...}`

3. **Verifica el firewall de Windows:**
   - Abre "Windows Defender Firewall"
   - Click en "Permitir que una aplicación acceda al firewall"
   - Asegúrate que Node.js esté permitido en redes privadas

4. **Verifica que estés en la MISMA red WiFi:**
   - Computadora y móvil deben estar conectados al mismo WiFi

### ❌ "Error al conectar a MongoDB"

1. **Asegúrate que MongoDB está corriendo:**
   ```bash
   # Windows - en otra terminal
   iniciar-mongodb-local.bat
   ```

2. **O usa MongoDB Atlas (nube):**
   - Crea una cuenta en https://www.mongodb.com/cloud/atlas
   - Obtén tu connection string
   - Actualiza el `.env`:
   ```
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
   ```

### ❌ "Error de CORS"

- Verifica que el backend esté corriendo
- Asegúrate de usar la IP correcta (no localhost)
- Reinicia el servidor backend

## 💡 Consejos

- **Para desarrollo rápido:** Usa un emulador de Android en la misma computadora
- **Para pruebas reales:** Usa un móvil en la misma red WiFi
- **Para producción:** Despliega en un servidor en la nube (Heroku, Render, Vercel)

## 📌 URLs de Referencia

```
Backend:  http://192.168.1.100:5000
Frontend: http://192.168.1.100:3000
API:      http://192.168.1.100:5000/api
```

*(Reemplaza la IP según tu caso)*
