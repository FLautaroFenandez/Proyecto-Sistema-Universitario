# 🗄️ Diseño de Base de Datos
## Centro Educativo "Educar para Transformar"

**Motor**: PostgreSQL (Supabase)  
**Versión**: 1.0  

---

## 1. Modelo Entidad-Relación (Conceptual)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   profiles   │──────<│  noticias    │       │  opiniones   │
│  (usuarios)  │       └──────────────┘       └──────────────┘
└──────┬───────┘
       │
       ├──────────────────────────────────────────────┐
       │                                              │
┌──────▼───────┐       ┌──────────────┐       ┌──────▼───────┐
│inscripciones │       │   galeria    │       │   empleos    │
└──────────────┘       └──────────────┘       └──────────────┘
                               │
                       ┌───────▼──────┐
                       │  categorias  │
                       │   galeria    │
                       └──────────────┘

┌──────────────┐
│   contacto   │
│  (mensajes)  │
└──────────────┘
```

---

## 2. Modelo Relacional — Tablas

---

### 2.1 `profiles` (Extiende la tabla `auth.users` de Supabase)

> Supabase crea automáticamente la tabla `auth.users` al registrar un usuario.  
> `profiles` extiende esa tabla con datos adicionales y el rol.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      VARCHAR(100)  NOT NULL,
  dni         VARCHAR(20)   NOT NULL UNIQUE,
  telefono    VARCHAR(20),
  rol         VARCHAR(20)   NOT NULL DEFAULT 'estudiante'
                            CHECK (rol IN ('admin','autoridad','docente','personal','padre','estudiante')),
  activo      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

**Atributos**:
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK — mismo UUID que `auth.users.id` |
| `nombre` | VARCHAR(100) | Nombre completo del usuario |
| `dni` | VARCHAR(20) | DNI único |
| `telefono` | VARCHAR(20) | Teléfono de contacto (opcional) |
| `rol` | VARCHAR(20) | Rol del usuario en el sistema |
| `activo` | BOOLEAN | Permite desactivar usuarios sin eliminarlos |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última modificación |

---

### 2.2 `noticias`

```sql
CREATE TABLE noticias (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        VARCHAR(200)  NOT NULL,
  resumen       VARCHAR(500),
  contenido     TEXT          NOT NULL,
  imagen_url    TEXT,
  publica       BOOLEAN       NOT NULL DEFAULT TRUE,
  publicada     BOOLEAN       NOT NULL DEFAULT FALSE,
  autor_id      UUID          NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

**Atributos**:
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK generada automáticamente |
| `titulo` | VARCHAR(200) | Título de la noticia |
| `resumen` | VARCHAR(500) | Resumen para cards de previsualización |
| `contenido` | TEXT | Cuerpo completo de la noticia (HTML o Markdown) |
| `imagen_url` | TEXT | URL de imagen de portada (Supabase Storage) |
| `publica` | BOOLEAN | `TRUE` = visible para todos; `FALSE` = solo usuarios autenticados |
| `publicada` | BOOLEAN | `FALSE` = borrador; `TRUE` = publicada |
| `autor_id` | UUID | FK a `profiles.id` |

---

### 2.3 `opiniones`

```sql
CREATE TABLE opiniones (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_nombre  VARCHAR(100)  NOT NULL,
  texto         VARCHAR(300)  NOT NULL,
  estado        VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                              CHECK (estado IN ('pendiente','aprobada','rechazada')),
  moderado_por  UUID          REFERENCES profiles(id),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  moderado_at   TIMESTAMPTZ
);
```

**Atributos**:
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `autor_nombre` | VARCHAR(100) | Nombre del visitante que opina |
| `texto` | VARCHAR(300) | Texto de la opinión (máx. 300 chars) |
| `estado` | VARCHAR(20) | Estado de moderación |
| `moderado_por` | UUID | FK al admin que moderó |
| `moderado_at` | TIMESTAMPTZ | Cuándo fue moderada |

---

### 2.4 `inscripciones`

```sql
CREATE TABLE inscripciones (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Datos del estudiante
  estudiante_nombre     VARCHAR(100)  NOT NULL,
  estudiante_dni        VARCHAR(20)   NOT NULL,
  estudiante_nacimiento DATE          NOT NULL,
  nivel                 VARCHAR(20)   NOT NULL CHECK (nivel IN ('inicial','primario','secundario')),
  turno                 VARCHAR(10)   NOT NULL CHECK (turno IN ('manana','tarde')),
  -- Datos del tutor
  tutor_nombre          VARCHAR(100)  NOT NULL,
  tutor_dni             VARCHAR(20)   NOT NULL,
  tutor_relacion        VARCHAR(20)   NOT NULL CHECK (tutor_relacion IN ('padre','madre','tutor')),
  tutor_telefono        VARCHAR(20)   NOT NULL,
  tutor_email           VARCHAR(150)  NOT NULL,
  -- Estado
  estado                VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                                      CHECK (estado IN ('pendiente','en_revision','aceptada','rechazada')),
  observaciones         TEXT,
  revisado_por          UUID          REFERENCES profiles(id),
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 2.5 `galeria_categorias`

```sql
CREATE TABLE galeria_categorias (
  id          SERIAL        PRIMARY KEY,
  nombre      VARCHAR(50)   NOT NULL UNIQUE,
  descripcion VARCHAR(200),
  orden       INTEGER       NOT NULL DEFAULT 0
);

-- Datos iniciales
INSERT INTO galeria_categorias (nombre, descripcion, orden) VALUES
  ('Instalaciones', 'Edificio e instalaciones generales', 1),
  ('Aulas', 'Aulas y espacios de aprendizaje', 2),
  ('Deportes', 'Canchas, gimnasio y actividades deportivas', 3),
  ('Eventos', 'Actos, festejos y eventos institucionales', 4),
  ('Idiomas', 'Clases y actividades de idiomas', 5);
```

---

### 2.6 `galeria`

```sql
CREATE TABLE galeria (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        VARCHAR(150),
  descripcion   VARCHAR(300),
  imagen_url    TEXT          NOT NULL,
  categoria_id  INTEGER       NOT NULL REFERENCES galeria_categorias(id),
  subido_por    UUID          NOT NULL REFERENCES profiles(id),
  activa        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 2.7 `empleos`

```sql
CREATE TABLE empleos (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          VARCHAR(200)  NOT NULL,
  descripcion     TEXT          NOT NULL,
  requisitos      TEXT,
  contacto_email  VARCHAR(150)  NOT NULL,
  fecha_limite    DATE          NOT NULL,
  activo          BOOLEAN       NOT NULL DEFAULT TRUE,
  publicado_por   UUID          NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 2.8 `contacto_mensajes`

```sql
CREATE TABLE contacto_mensajes (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  asunto      VARCHAR(200)  NOT NULL,
  mensaje     TEXT          NOT NULL,
  leido       BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

## 3. Políticas RLS (Row Level Security)

Las políticas RLS garantizan que los datos solo sean accesibles por quienes tienen permiso, **independientemente del frontend**.

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias         ENABLE ROW LEVEL SECURITY;
ALTER TABLE opiniones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria          ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacto_mensajes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES
-- =============================================

-- Cada usuario ve solo su propio perfil
CREATE POLICY "perfil_propio" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin ve todos los perfiles
CREATE POLICY "admin_ve_todos" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- =============================================
-- NOTICIAS
-- =============================================

-- Noticias públicas: cualquiera puede leer
CREATE POLICY "noticias_publicas" ON noticias
  FOR SELECT USING (publica = TRUE AND publicada = TRUE);

-- Noticias internas: solo usuarios autenticados
CREATE POLICY "noticias_internas" ON noticias
  FOR SELECT USING (
    publica = FALSE AND publicada = TRUE AND auth.uid() IS NOT NULL
  );

-- Admin y Autoridad pueden hacer todo
CREATE POLICY "admin_autoridad_noticias" ON noticias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'autoridad')
    )
  );

-- =============================================
-- OPINIONES
-- =============================================

-- Público puede insertar opiniones
CREATE POLICY "insertar_opinion" ON opiniones
  FOR INSERT WITH CHECK (TRUE);

-- Público solo lee las aprobadas
CREATE POLICY "leer_aprobadas" ON opiniones
  FOR SELECT USING (estado = 'aprobada');

-- Admin puede gestionar todas
CREATE POLICY "admin_gestiona_opiniones" ON opiniones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'autoridad')
    )
  );

-- =============================================
-- INSCRIPCIONES
-- =============================================

-- Cualquiera puede insertar una solicitud
CREATE POLICY "insertar_inscripcion" ON inscripciones
  FOR INSERT WITH CHECK (TRUE);

-- Solo admin y autoridad pueden leer
CREATE POLICY "admin_lee_inscripciones" ON inscripciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'autoridad')
    )
  );

-- =============================================
-- GALERÍA
-- =============================================

-- Cualquiera puede ver imágenes activas
CREATE POLICY "galeria_publica" ON galeria
  FOR SELECT USING (activa = TRUE);

-- Solo admin y autoridad gestionan
CREATE POLICY "admin_gestiona_galeria" ON galeria
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'autoridad')
    )
  );
```

---

## 4. Índices para Rendimiento

```sql
-- Búsqueda de noticias por fecha
CREATE INDEX idx_noticias_created ON noticias(created_at DESC);

-- Filtro de noticias públicas/privadas
CREATE INDEX idx_noticias_publica ON noticias(publica, publicada);

-- Galería por categoría
CREATE INDEX idx_galeria_categoria ON galeria(categoria_id);

-- Inscripciones por estado
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);

-- Opiniones por estado de moderación
CREATE INDEX idx_opiniones_estado ON opiniones(estado);

-- Empleos activos por fecha límite
CREATE INDEX idx_empleos_activos ON empleos(activo, fecha_limite);
```

---

## 5. Trigger para `updated_at`

```sql
-- Función que actualiza el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas que lo necesitan
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_noticias_updated
  BEFORE UPDATE ON noticias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_inscripciones_updated
  BEFORE UPDATE ON inscripciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 6. Resumen del Modelo

| Tabla | Registros esperados | Notas |
|---|---|---|
| `profiles` | ~50-200 inicialmente | Crece con la comunidad educativa |
| `noticias` | ~5-20/mes | Paginadas en el frontend |
| `opiniones` | ~10-50/mes | Moderadas antes de publicarse |
| `inscripciones` | ~50-200/año | Ciclo anual de inscripciones |
| `galeria` | ~50-300 fotos | Organizadas por categoría |
| `galeria_categorias` | 5 (fijas) | Pocas, administradas |
| `empleos` | ~5-20 | Los vencidos se ocultan |
| `contacto_mensajes` | Variable | Solo lectura para admin |
