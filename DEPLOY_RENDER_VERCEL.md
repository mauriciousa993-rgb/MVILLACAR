# Deploy GitHub + Render + Vercel

Esta guia deja el `backend` en Render y el `frontend` en Vercel.

## 1) Subir el proyecto a GitHub

Si todavia no tienes repositorio git en esta carpeta:

```bash
git init
git add .
git commit -m "Config inicial para deploy Render y Vercel"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Si ya tienes repo, solo haz `git add`, `git commit` y `git push`.

## 2) Desplegar backend en Render

1. En Render, crea `New +` -> `Blueprint`.
2. Conecta tu repo de GitHub.
3. Render detectara [`render.yaml`](/c:/Users/mauri/OneDrive/Escritorio/app-compraventa-VILLACAR/render.yaml) y creara el servicio `compraventa-backend`.
4. Configura estas variables en Render (Environment):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS` (tu URL de Vercel, por ejemplo `https://tu-app.vercel.app`)
   - Opcional: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - Opcional OCR: `OPENAI_API_KEY`
5. Despliega y verifica:
   - `https://TU_BACKEND.onrender.com/health` debe responder `status: ok`.

## 3) Desplegar frontend en Vercel

1. En Vercel, importa el mismo repo de GitHub.
2. Usa estos ajustes del proyecto:
   - Framework: `Vite`
   - Build command: `cd frontend && npm run build`
   - Install command: `cd frontend && npm install`
   - Output directory: `frontend/dist`
3. En Variables de entorno agrega:
   - `VITE_API_URL=https://TU_BACKEND.onrender.com/api`
4. Deploy.

`vercel.json` en raiz ya incluye rutas SPA y rewrites de modelos 3D.

## 4) Ajuste final de CORS en Render

Cuando ya tengas la URL final de Vercel, vuelve a Render y confirma:

```env
ALLOWED_ORIGINS=https://TU_APP.vercel.app
```

Si usas dominio propio, agrega ambos separados por coma.

## 5) Verificacion rapida

1. Frontend carga sin pantalla en blanco.
2. Login funciona.
3. Listar/crear vehiculos funciona.
4. Fotos/documentos cargan.
5. Endpoint `GET /health` responde 200.

## Notas importantes

- Render usa filesystem efimero: si no configuras Cloudinary, las fotos locales pueden perderse en reinicios.
- No subas secretos a git. Usa solo ejemplos como [`backend/.env.example`](/c:/Users/mauri/OneDrive/Escritorio/app-compraventa-VILLACAR/backend/.env.example).
