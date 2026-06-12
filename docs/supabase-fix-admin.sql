-- ============================================================
-- FIX ADMIN + RLS — Centro Educativo "Educar para Transformar"
-- Ejecutar DESPUÉS del supabase-schema.sql (v4).
-- Idempotente: se puede correr varias veces sin error.
--
-- Qué corrige:
-- 1. Función is_admin() SECURITY DEFINER → evita el error
--    "infinite recursion detected in policy for relation profiles"
-- 2. Re-habilita RLS en todas las tablas (por si se desactivó)
-- 3. Permisos UPDATE/DELETE en contacto_mensajes para que el
--    admin pueda marcar como leído y eliminar mensajes
-- ============================================================


-- ── 1. FUNCIÓN is_admin() (SECURITY DEFINER evita recursión RLS) ──
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND rol IN ('admin','autoridad')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_estricto()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;


-- ── 2. RE-HABILITAR RLS EN TODAS LAS TABLAS ──────────────────
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias           ENABLE ROW LEVEL SECURITY;
ALTER TABLE opiniones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria            ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacto_mensajes  ENABLE ROW LEVEL SECURITY;


-- ── 3. POLÍTICAS DE PROFILES SIN RECURSIÓN ───────────────────
DROP POLICY IF EXISTS "perfil_propio"            ON profiles;
DROP POLICY IF EXISTS "perfil_propio_select"     ON profiles;
DROP POLICY IF EXISTS "insertar_propio_perfil"   ON profiles;
DROP POLICY IF EXISTS "admin_ve_todos"           ON profiles;
DROP POLICY IF EXISTS "admin_ve_todos_perfiles"  ON profiles;
DROP POLICY IF EXISTS "admin_gestiona_perfiles"  ON profiles;
DROP POLICY IF EXISTS "admin_actualiza_perfiles" ON profiles;
DROP POLICY IF EXISTS "admin_elimina_perfiles"   ON profiles;

CREATE POLICY "perfil_propio_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "insertar_propio_perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_ve_todos_perfiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_actualiza_perfiles" ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "admin_elimina_perfiles" ON profiles
  FOR DELETE USING (is_admin_estricto());


-- ── 4. CONTACTO_MENSAJES: permisos completos para admin ──────
DROP POLICY IF EXISTS "insertar_mensaje_contacto"  ON contacto_mensajes;
DROP POLICY IF EXISTS "admin_lee_mensajes"         ON contacto_mensajes;
DROP POLICY IF EXISTS "admin_actualiza_mensajes"   ON contacto_mensajes;
DROP POLICY IF EXISTS "admin_elimina_mensajes"     ON contacto_mensajes;

CREATE POLICY "insertar_mensaje_contacto" ON contacto_mensajes
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "admin_lee_mensajes" ON contacto_mensajes
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_actualiza_mensajes" ON contacto_mensajes
  FOR UPDATE USING (is_admin());

CREATE POLICY "admin_elimina_mensajes" ON contacto_mensajes
  FOR DELETE USING (is_admin());


-- ── 5. SIMPLIFICAR LAS DEMÁS POLÍTICAS CON is_admin() ────────
-- (mismas reglas, más rápidas y consistentes)

-- Noticias
DROP POLICY IF EXISTS "admin_ve_todas_noticias" ON noticias;
DROP POLICY IF EXISTS "admin_inserta_noticias"  ON noticias;
DROP POLICY IF EXISTS "admin_modifica_noticias" ON noticias;
DROP POLICY IF EXISTS "admin_elimina_noticias"  ON noticias;

CREATE POLICY "admin_ve_todas_noticias" ON noticias FOR SELECT USING (is_admin());
CREATE POLICY "admin_inserta_noticias"  ON noticias FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_modifica_noticias" ON noticias FOR UPDATE USING (is_admin());
CREATE POLICY "admin_elimina_noticias"  ON noticias FOR DELETE USING (is_admin());

-- Opiniones
DROP POLICY IF EXISTS "admin_gestiona_opiniones" ON opiniones;
CREATE POLICY "admin_gestiona_opiniones" ON opiniones FOR ALL USING (is_admin());

-- Inscripciones
DROP POLICY IF EXISTS "admin_lee_inscripciones"      ON inscripciones;
DROP POLICY IF EXISTS "admin_actualiza_inscripciones" ON inscripciones;
CREATE POLICY "admin_lee_inscripciones"       ON inscripciones FOR SELECT USING (is_admin());
CREATE POLICY "admin_actualiza_inscripciones" ON inscripciones FOR UPDATE USING (is_admin());

-- Galería
DROP POLICY IF EXISTS "admin_inserta_galeria"  ON galeria;
DROP POLICY IF EXISTS "admin_modifica_galeria" ON galeria;
DROP POLICY IF EXISTS "admin_elimina_galeria"  ON galeria;
CREATE POLICY "admin_inserta_galeria"  ON galeria FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_modifica_galeria" ON galeria FOR UPDATE USING (is_admin());
CREATE POLICY "admin_elimina_galeria"  ON galeria FOR DELETE USING (is_admin());

-- Galería categorías
DROP POLICY IF EXISTS "admin_gestiona_categorias" ON galeria_categorias;
CREATE POLICY "admin_gestiona_categorias" ON galeria_categorias FOR ALL USING (is_admin());

-- Empleos
DROP POLICY IF EXISTS "admin_ve_todos_empleos"  ON empleos;
DROP POLICY IF EXISTS "admin_inserta_empleos"   ON empleos;
DROP POLICY IF EXISTS "admin_modifica_empleos"  ON empleos;
DROP POLICY IF EXISTS "admin_elimina_empleos"   ON empleos;
CREATE POLICY "admin_ve_todos_empleos"  ON empleos FOR SELECT USING (is_admin());
CREATE POLICY "admin_inserta_empleos"   ON empleos FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_modifica_empleos"  ON empleos FOR UPDATE USING (is_admin());
CREATE POLICY "admin_elimina_empleos"   ON empleos FOR DELETE USING (is_admin());

-- Storage
DROP POLICY IF EXISTS "galeria_admin_upload"   ON storage.objects;
DROP POLICY IF EXISTS "galeria_admin_delete"   ON storage.objects;
DROP POLICY IF EXISTS "noticias_admin_upload"  ON storage.objects;
DROP POLICY IF EXISTS "noticias_admin_delete"  ON storage.objects;

CREATE POLICY "galeria_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'galeria' AND is_admin());
CREATE POLICY "galeria_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'galeria' AND is_admin());
CREATE POLICY "noticias_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'noticias' AND is_admin());
CREATE POLICY "noticias_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'noticias' AND is_admin());

-- ── 6. REQ-04: el padre/estudiante logueado ve SUS solicitudes ──
-- La solicitud se vincula por email: si el tutor_email coincide con
-- el email de la cuenta, puede consultar el estado de su inscripción.
DROP POLICY IF EXISTS "padre_ve_sus_inscripciones" ON inscripciones;
CREATE POLICY "padre_ve_sus_inscripciones" ON inscripciones
  FOR SELECT USING (tutor_email = auth.email());

-- ============================================================
-- LISTO. Verificá que tu usuario tenga rol 'admin' en
-- Table Editor → profiles antes de probar el panel.
-- ============================================================
