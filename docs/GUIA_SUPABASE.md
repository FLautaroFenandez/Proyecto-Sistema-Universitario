# ⚡ Guía de Configuración de Supabase
## Paso a paso para el equipo

---

## 1. Crear el proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **Start your project**
2. Iniciar sesión con GitHub
3. Crear nuevo proyecto:
   - **Name**: `educar-para-transformar`
   - **Database Password**: generar una fuerte y guardarla
   - **Region**: South America (São Paulo) — la más cercana a Resistencia
4. Esperar ~2 minutos mientras levanta el proyecto

---

## 2. Obtener las credenciales

1. En el dashboard del proyecto → **Settings** → **API**
2. Copiar:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

Crear el archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **NUNCA subir `.env.local` a GitHub.** Ya está en el `.gitignore`.

---

## 3. Ejecutar el SQL del proyecto

1. En el dashboard → **SQL Editor** → **New query**
2. Pegar y ejecutar **en orden**:

### Paso 3.1 — Crear las tablas

Copiar el contenido de `docs/BASE_DE_DATOS.md` sección "2. Modelo Relacional" y ejecutar cada `CREATE TABLE`.

### Paso 3.2 — Habilitar RLS y crear políticas

Copiar la sección "3. Políticas RLS" del mismo documento.

### Paso 3.3 — Crear índices

Copiar la sección "4. Índices para Rendimiento".

### Paso 3.4 — Crear trigger updated_at

Copiar la sección "5. Trigger".

### Paso 3.5 — Insertar categorías de galería

```sql
INSERT INTO galeria_categorias (nombre, descripcion, orden) VALUES
  ('Instalaciones', 'Edificio e instalaciones generales', 1),
  ('Aulas', 'Aulas y espacios de aprendizaje', 2),
  ('Deportes', 'Canchas, gimnasio y actividades deportivas', 3),
  ('Eventos', 'Actos, festejos y eventos institucionales', 4),
  ('Idiomas', 'Clases y actividades de idiomas', 5);
```

---

## 4. Crear el primer usuario Admin

### Opción A — Desde Supabase Auth (recomendado para desarrollo)

1. Dashboard → **Authentication** → **Users** → **Add user**
2. Email: `admin@educarparatransformar.edu.ar`
3. Password: una contraseña fuerte
4. Copiar el UUID del usuario creado

5. En SQL Editor, insertar el perfil admin:
```sql
INSERT INTO profiles (id, nombre, dni, rol)
VALUES (
  'UUID-DEL-USUARIO-CREADO',  -- reemplazar con el UUID real
  'Administrador Sistema',
  '00000000',
  'admin'
);
```

### Opción B — Desde el código (signup + update de rol)

Esto se puede hacer desde la app en desarrollo con una ruta temporal de inicialización.

---

## 5. Configurar Supabase Storage (galería de imágenes)

1. Dashboard → **Storage** → **New bucket**
2. Nombre: `galeria`
3. **Public bucket**: ✅ (las imágenes son públicas)
4. Crear otro bucket:
   - Nombre: `noticias`
   - **Public bucket**: ✅

### Políticas de Storage

En Dashboard → **Storage** → **Policies**:

```sql
-- Cualquiera puede leer imágenes de galería
CREATE POLICY "galeria_lectura_publica"
ON storage.objects FOR SELECT
USING (bucket_id = 'galeria');

-- Solo admin y autoridad pueden subir/eliminar
CREATE POLICY "galeria_admin_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'galeria' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND rol IN ('admin', 'autoridad')
  )
);

-- Misma lógica para bucket 'noticias'
```

---

## 6. Configurar el cliente Supabase en React

Archivo: `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase. Revisá .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistir sesión en localStorage del navegador
    persistSession: true,
    // Detectar automáticamente el token en la URL (para confirmar email)
    detectSessionInUrl: true,
  }
})
```

---

## 7. Verificar que todo funciona

Correr en la consola del navegador o en un componente de prueba:

```javascript
import { supabase } from './lib/supabase'

// Probar conexión
const { data, error } = await supabase
  .from('galeria_categorias')
  .select('*')

console.log(data) // Debería mostrar las 5 categorías
console.log(error) // Debería ser null
```

---

## 8. Comandos útiles de Supabase

```javascript
// ── AUTH ──────────────────────────────────────────

// Registrar usuario
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@email.com',
  password: 'contraseña123'
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@email.com',
  password: 'contraseña123'
})

// Cerrar sesión
await supabase.auth.signOut()

// Obtener usuario actual
const { data: { user } } = await supabase.auth.getUser()

// Escuchar cambios de sesión
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})

// ── BASE DE DATOS ──────────────────────────────────

// SELECT
const { data } = await supabase
  .from('noticias')
  .select('id, titulo, resumen, created_at')
  .eq('publica', true)
  .eq('publicada', true)
  .order('created_at', { ascending: false })
  .limit(9)

// INSERT
const { data, error } = await supabase
  .from('opiniones')
  .insert({ autor_nombre: 'Juan', texto: 'Excelente institución!' })

// UPDATE
const { error } = await supabase
  .from('opiniones')
  .update({ estado: 'aprobada', moderado_por: userId })
  .eq('id', opinionId)

// DELETE
const { error } = await supabase
  .from('galeria')
  .delete()
  .eq('id', imagenId)

// ── STORAGE ───────────────────────────────────────

// Subir imagen
const { data, error } = await supabase.storage
  .from('galeria')
  .upload(`categorias/${Date.now()}_${file.name}`, file)

// Obtener URL pública
const { data } = supabase.storage
  .from('galeria')
  .getPublicUrl(data.path)
// data.publicUrl tiene la URL de la imagen
```
