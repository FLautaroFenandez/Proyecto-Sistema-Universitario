# 🚀 Guía de Deploy — Vercel
## Centro Educativo "Educar para Transformar"

---

## 1. Por qué Vercel

- **Gratis**: plan Hobby cubre perfectamente el proyecto
- **GitHub integrado**: cada push a `main` hace deploy automático
- **HTTPS automático**: certificado SSL sin configuración
- **Preview deployments**: cada PR genera una URL de preview para revisar antes de mergear
- **CDN global**: la página carga rápido desde cualquier lugar

---

## 2. Configurar el repositorio en GitHub

```bash
# En la raíz del proyecto
git init
git add .
git commit -m "chore: setup inicial del proyecto"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/[usuario]/educar-para-transformar.git
git branch -M main
git push -u origin main
```

---

## 3. Deploy en Vercel

1. Ir a [vercel.com](https://vercel.com) → **Sign Up** con GitHub
2. **Add New Project** → importar el repositorio `educar-para-transformar`
3. Configuración del proyecto:
   - **Framework Preset**: Vite (se detecta automáticamente)
   - **Root Directory**: `.` (raíz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** — Agregar las variables:
   - `VITE_SUPABASE_URL` → valor del proyecto Supabase
   - `VITE_SUPABASE_ANON_KEY` → anon key de Supabase
5. Click **Deploy**

---

## 4. Deploy automático en cada push

Desde este momento, cada vez que hagan:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

Vercel detecta el push y hace deploy automático en ~2 minutos.

---

## 5. Ver la URL del proyecto

Vercel asigna una URL como:
`https://educar-para-transformar.vercel.app`

Esta es la URL que usar para el coloquio y para mostrar el proyecto funcionando.

---

## 6. Workflow de trabajo en equipo

```bash
# Cada miembro trabaja en su branch
git checkout -b feature/galeria-imagenes

# Hacer cambios, commits...
git commit -m "feat: agregar galería con filtro por categoría"

# Pushear la branch
git push origin feature/galeria-imagenes

# Crear Pull Request en GitHub
# → Vercel genera automáticamente una URL de preview
# → El equipo revisa en esa URL antes de mergear a main
```

---

## 7. Variables de entorno en Vercel (importante)

Las variables `VITE_*` en Vercel deben marcarse como disponibles para el **browser** (no son secretas del servidor, ya que Vite las embebe en el bundle).

En el dashboard de Vercel → Settings → Environment Variables:
- Marcar como "Production", "Preview" y "Development"
- NO marcar "Sensitive" (no son secretos del servidor)
