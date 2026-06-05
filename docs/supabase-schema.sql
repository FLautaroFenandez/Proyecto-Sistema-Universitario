-- ============================================================
-- ESQUEMA COMPLETO — Centro Educativo "Educar para Transformar"
-- Versión: 2.0 (corregida y verificada contra el código)
--
-- INSTRUCCIONES:
-- 1. Ir a supabase.com → tu proyecto → SQL Editor → New query
-- 2. Pegar TODO este archivo y hacer clic en "Run"
-- 3. Si hay errores de "already exists", ignorarlos y continuar
-- ============================================================


-- ── 1. EXTENSIONES ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ── 2. TABLA PROFILES ───────────────────────────────────────
-- Extiende auth.users de Supabase con datos del usuario.
-- IMPORTANTE: el INSERT lo hace el código (RegistroPage/useAuth),
-- NO hay trigger automático para evitar conflictos.
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      VARCHAR(100)  NOT NULL,
  dni         VARCHAR(20)   NOT NULL UNIQUE,
  telefono    VARCHAR(20),
  rol         VARCHAR(20)   NOT NULL DEFAULT 'padre'
                            CHECK (rol IN ('admin','autoridad','docente','personal','padre','estudiante')),
  activo      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ── 3. TABLA NOTICIAS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS noticias (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      VARCHAR(200)  NOT NULL,
  resumen     VARCHAR(500),
  contenido   TEXT          NOT NULL,
  imagen_url  TEXT,
  publica     BOOLEAN       NOT NULL DEFAULT TRUE,
  publicada   BOOLEAN       NOT NULL DEFAULT FALSE,
  autor_id    UUID          NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ── 4. TABLA OPINIONES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS opiniones (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_nombre  VARCHAR(100)  NOT NULL,
  texto         VARCHAR(300)  NOT NULL,
  estado        VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                              CHECK (estado IN ('pendiente','aprobada','rechazada')),
  moderado_por  UUID          REFERENCES profiles(id),
  moderado_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ── 5. TABLA INSCRIPCIONES ───────────────────────────────────
-- Todos los campos que InscripcionPage.jsx envía a Supabase.
CREATE TABLE IF NOT EXISTS inscripciones (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Datos del estudiante
  estudiante_nombre     VARCHAR(100)  NOT NULL,
  estudiante_dni        VARCHAR(20)   NOT NULL,
  estudiante_nacimiento DATE          NOT NULL,
  nivel                 VARCHAR(20)   NOT NULL CHECK (nivel IN ('inicial','primario','secundario')),
  turno                 VARCHAR(10)   NOT NULL CHECK (turno IN ('manana','tarde')),
  -- Datos del tutor/padre
  tutor_nombre          VARCHAR(100)  NOT NULL,
  tutor_dni             VARCHAR(20)   NOT NULL,
  tutor_relacion        VARCHAR(20)   NOT NULL CHECK (tutor_relacion IN ('padre','madre','tutor')),
  tutor_telefono        VARCHAR(20)   NOT NULL,
  tutor_email           VARCHAR(150)  NOT NULL,
  -- Estado y seguimiento
  estado                VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                                      CHECK (estado IN ('pendiente','en_revision','aceptada','rechazada')),
  observaciones         TEXT,
  revisado_por          UUID          REFERENCES profiles(id),
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ── 6. TABLA GALERIA_CATEGORIAS ──────────────────────────────
-- Usa SERIAL (INTEGER) como PK, no UUID.
CREATE TABLE IF NOT EXISTS galeria_categorias (
  id          SERIAL        PRIMARY KEY,
  nombre      VARCHAR(50)   NOT NULL UNIQUE,
  descripcion VARCHAR(200),
  orden       INTEGER       NOT NULL DEFAULT 0
);

-- Datos iniciales de categorías
INSERT INTO galeria_categorias (nombre, descripcion, orden) VALUES
  ('Instalaciones', 'Edificio e instalaciones generales',          1),
  ('Aulas',         'Aulas y espacios de aprendizaje',             2),
  ('Deportes',      'Canchas, gimnasio y actividades deportivas',  3),
  ('Eventos',       'Actos, festejos y eventos institucionales',   4),
  ('Idiomas',       'Clases y actividades de idiomas',             5)
ON CONFLICT (nombre) DO NOTHING;


-- ── 7. TABLA GALERIA ─────────────────────────────────────────
-- categoria_id es INTEGER (referencia al SERIAL de galeria_categorias)
CREATE TABLE IF NOT EXISTS galeria (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        VARCHAR(150),
  descripcion   VARCHAR(300),
  imagen_url    TEXT          NOT NULL,
  categoria_id  INTEGER       NOT NULL REFERENCES galeria_categorias(id),
  subido_por    UUID          NOT NULL REFERENCES profiles(id),
  activa        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ── 8. TABLA EMPLEOS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empleos (
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


-- ── 9. TABLA CONTACTO_MENSAJES ───────────────────────────────
-- El código usa FROM('contacto_mensajes'), no 'contacto'.
CREATE TABLE IF NOT EXISTS contacto_mensajes (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  asunto      VARCHAR(200)  NOT NULL,
  mensaje     TEXT          NOT NULL,
  leido       BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ── 10. TRIGGER updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_noticias_updated
  BEFORE UPDATE ON noticias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_inscripciones_updated
  BEFORE UPDATE ON inscripciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_empleos_updated
  BEFORE UPDATE ON empleos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── 11. ÍNDICES ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_noticias_created    ON noticias(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_publica    ON noticias(publica, publicada);
CREATE INDEX IF NOT EXISTS idx_galeria_categoria   ON galeria(categoria_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_estado ON inscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_opiniones_estado    ON opiniones(estado);
CREATE INDEX IF NOT EXISTS idx_empleos_activos     ON empleos(activo, fecha_limite);


-- ── 12. ROW LEVEL SECURITY (RLS) ─────────────────────────────

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias          ENABLE ROW LEVEL SECURITY;
ALTER TABLE opiniones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria           ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacto_mensajes ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──
-- Cada usuario puede ver su propio perfil
CREATE POLICY "perfil_propio_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- CRÍTICO: sin esta política el registro falla.
-- Permite que un usuario recién creado inserte su propio perfil.
CREATE POLICY "insertar_propio_perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin ve todos los perfiles
CREATE POLICY "admin_ve_todos_perfiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Admin puede actualizar y eliminar cualquier perfil
CREATE POLICY "admin_actualiza_perfiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "admin_elimina_perfiles" ON profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

-- ── Noticias ──
-- Visitantes sin cuenta ven noticias públicas y publicadas
CREATE POLICY "noticias_publicas" ON noticias
  FOR SELECT USING (publica = TRUE AND publicada = TRUE);

-- Usuarios autenticados (padres, estudiantes, personal) ven noticias internas
CREATE POLICY "noticias_internas" ON noticias
  FOR SELECT USING (
    publica = FALSE AND publicada = TRUE AND auth.uid() IS NOT NULL
  );

-- Admin puede INSERT (necesita WITH CHECK separado del USING para que funcione)
CREATE POLICY "admin_inserta_noticias" ON noticias
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

-- Admin puede UPDATE y DELETE
CREATE POLICY "admin_modifica_noticias" ON noticias
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "admin_elimina_noticias" ON noticias
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

-- Admin ve TODAS las noticias (incluso borradores)
CREATE POLICY "admin_ve_todas_noticias" ON noticias
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

-- ── Opiniones ──
CREATE POLICY "leer_aprobadas" ON opiniones
  FOR SELECT USING (estado = 'aprobada');

CREATE POLICY "insertar_opinion" ON opiniones
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "admin_gestiona_opiniones" ON opiniones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

-- ── Inscripciones ──
CREATE POLICY "insertar_inscripcion" ON inscripciones
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "admin_lee_inscripciones" ON inscripciones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "admin_actualiza_inscripciones" ON inscripciones
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

-- ── Galería ──
CREATE POLICY "galeria_publica" ON galeria
  FOR SELECT USING (activa = TRUE);

CREATE POLICY "admin_inserta_galeria" ON galeria
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "admin_modifica_galeria" ON galeria
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "admin_elimina_galeria" ON galeria
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

-- ── Galería Categorías ──
CREATE POLICY "categorias_publicas" ON galeria_categorias
  FOR SELECT USING (TRUE);

CREATE POLICY "admin_gestiona_categorias" ON galeria_categorias
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

-- ── Empleos ──
CREATE POLICY "empleos_activos_publico" ON empleos
  FOR SELECT USING (activo = TRUE);

CREATE POLICY "admin_inserta_empleos" ON empleos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "admin_modifica_empleos" ON empleos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "admin_elimina_empleos" ON empleos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "admin_ve_todos_empleos" ON empleos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

-- ── Contacto Mensajes ──
CREATE POLICY "insertar_mensaje_contacto" ON contacto_mensajes
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "admin_lee_mensajes" ON contacto_mensajes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );


-- ── 13. STORAGE ──────────────────────────────────────────────
-- Crear 2 buckets PÚBLICOS desde el dashboard:
--   Storage → New bucket → nombre: "galeria"  → Public: ON
--   Storage → New bucket → nombre: "noticias" → Public: ON
--
-- Luego ejecutar estas políticas de Storage:

CREATE POLICY "galeria_lectura_publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'galeria');

CREATE POLICY "galeria_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'galeria' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "galeria_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'galeria' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "noticias_lectura_publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'noticias');

CREATE POLICY "noticias_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'noticias' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );

CREATE POLICY "noticias_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'noticias' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','autoridad'))
  );


-- ── 14. CREAR EL PRIMER USUARIO ADMIN ────────────────────────
--
-- Paso 1: En Supabase → Authentication → Users → Add user
--   Email: admin@educarparatransformar.edu.ar
--   Password: (una contraseña fuerte)
--
-- Paso 2: Copiar el UUID del usuario y ejecutar:
--
-- INSERT INTO profiles (id, nombre, dni, rol)
-- VALUES (
--   'PEGAR-UUID-AQUI',
--   'Administrador Sistema',
--   '00000000',
--   'admin'
-- );
--
-- Paso 3: Verificar en Table Editor → profiles que el rol sea 'admin'
-- ============================================================
