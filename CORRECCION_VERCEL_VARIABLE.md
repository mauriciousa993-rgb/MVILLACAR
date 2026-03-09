# 🚨 CORRECCIÓN URGENTE - Variable de Vercel

## ❌ ERROR IDENTIFICADO:

La variable `VITE_API_URL` debe incluir `/api` al final.

## ✅ SOLUCIÓN:

### Paso 1: Ir a Vercel
1. https://vercel.com/dashboard
2. Click en tu proyecto
3. Settings → Environment Variables

### Paso 2: Editar o Eliminar la Variable Incorrecta

Si ya creaste la variable, **ELIMÍNALA** o **EDÍTALA**:

**VALOR INCORRECTO:**
```
https://app-compraventa.onrender.com
```

**VALOR CORRECTO:**
```
https://app-compraventa.onrender.com/api
```

### Paso 3: Configuración Correcta

**Name:**
```
VITE_API_URL
```

**Value:**
```
https://app-compraventa.onrender.com/api
```

**Environments:** (Marca las 3)
- ✅ Production
- ✅ Preview
- ✅ Development

### Paso 4: Save y Redeploy

1. Click en **"Save"**
2. Ve a **"Deployments"**
3. Click en los 3 puntos (...) del deployment más reciente
4. Click en **"Redeploy"**
5. Espera 1-2 minutos

### Paso 5: Verificar

1. Abre tu app en Vercel
2. Abre la consola del navegador (F12)
3. Deberías ver: "🌍 URL de API (producción): https://app-compraventa.onrender.com/api"
4. Intenta hacer login con:
   - Email: admin@compraventa.com
   - Password: admin123

## 🎯 Resumen:

```
Variable: VITE_API_URL
Valor: https://app-compraventa.onrender.com/api
       ↑ IMPORTANTE: Incluir /api al final
```

---

**NOTA:** El `/api` es necesario porque el backend tiene todas las rutas bajo `/api/*`
