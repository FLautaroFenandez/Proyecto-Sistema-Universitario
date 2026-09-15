-- ============================================================================
-- SISTEMA DE GESTIÓN — Centro Educativo "Educar para Transformar"
-- Metodología de Sistemas II · Sprint 1 (15/09 – 28/09/2026)
--
-- Cubre el modelado de:
--   REQ-14 · Cursos, materias y asignación docente
--   HU1    · Matrícula y legajo del estudiante (REQ-13)
--   HU4    · Registro de asistencia diaria (REQ-16)
--
-- Se ejecuta DESPUÉS de supabase-schema.sql, del que reutiliza `profiles`
-- e `inscripciones`. Es idempotente: se puede correr varias veces.
--
-- INSTRUCCIONES: Supabase → SQL Editor → New query → pegar → Run
-- ============================================================================


-- ── PASO 1: FUNCIONES DE ROL ────────────────────────────────────────────────
-- Las políticas del esquema de la Parte 1 repiten en cada una el mismo
-- EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = ...).
-- Acá se centraliza en dos funciones, por el mismo motivo por el que en el
-- frontend la verificación de permisos vive en tienePermiso(): la regla se
-- escribe una sola vez.
--
-- SECURITY DEFINER evita la recursión infinita de RLS al consultar `profiles`
-- desde una política.

CREATE OR REPLACE FUNCTION public.rol_actual()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.tiene_rol(VARIADIC roles_permitidos TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.rol_actual() = ANY(roles_permitidos), FALSE)
$$;

-- ── PASO 2: TABLAS ──────────────────────────────────────────────────────────

-- Ciclo lectivo. La matrícula es anual, así que casi todo cuelga de acá.
CREATE TABLE IF NOT EXISTS ciclos_lectivos (
  id            SERIAL       PRIMARY KEY,
  anio          INTEGER      NOT NULL UNIQUE,
  fecha_inicio  DATE         NOT NULL,
  fecha_fin     DATE         NOT NULL,
  activo        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT ciclo_fechas_coherentes CHECK (fecha_fin > fecha_inicio)
);

-- Niveles educativos que ofrece la institución.
CREATE TABLE IF NOT EXISTS niveles (
  id      SERIAL       PRIMARY KEY,
  nombre  VARCHAR(20)  NOT NULL UNIQUE
                       CHECK (nombre IN ('inicial','primario','secundario')),
  orden   SMALLINT     NOT NULL
);

-- Curso = nivel + año + división + turno, dentro de un ciclo lectivo.
-- Regla del enunciado: cada curso pertenece a UN ÚNICO nivel (nivel_id).
CREATE TABLE IF NOT EXISTS cursos (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo_id    INTEGER      NOT NULL REFERENCES ciclos_lectivos(id) ON DELETE RESTRICT,
  nivel_id    INTEGER      NOT NULL REFERENCES niveles(id)         ON DELETE RESTRICT,
  anio        SMALLINT     NOT NULL CHECK (anio BETWEEN 1 AND 7),
  division    VARCHAR(5)   NOT NULL,
  turno       VARCHAR(10)  NOT NULL CHECK (turno IN ('manana','tarde')),
  cupo        SMALLINT     NOT NULL DEFAULT 30 CHECK (cupo > 0),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT curso_unico UNIQUE (ciclo_id, nivel_id, anio, division, turno)
);

-- Catálogo de materias, independiente del curso en el que se dicte.
CREATE TABLE IF NOT EXISTS materias (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(100) NOT NULL,
  codigo      VARCHAR(20)  NOT NULL UNIQUE,
  activa      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- REQ-14. Tabla que resuelve la regla del enunciado: "una materia puede
-- dictarse en distintos cursos y tener distinto profesor según el curso".
-- Por eso el docente se asigna acá y no en `materias`.
CREATE TABLE IF NOT EXISTS curso_materia (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id    UUID         NOT NULL REFERENCES cursos(id)   ON DELETE CASCADE,
  materia_id  UUID         NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
  docente_id  UUID         REFERENCES profiles(id)          ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT materia_una_vez_por_curso UNIQUE (curso_id, materia_id)
);

-- HU1. Legajo digital del estudiante.
-- `profile_id` es opcional: un alumno de nivel inicial no tiene cuenta propia.
-- `inscripcion_id` deja la trazabilidad de la solicitud que le dio origen.
CREATE TABLE IF NOT EXISTS alumnos (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  legajo            VARCHAR(20)  NOT NULL UNIQUE,
  dni               VARCHAR(20)  NOT NULL UNIQUE,
  apellido          VARCHAR(100) NOT NULL,
  nombre            VARCHAR(100) NOT NULL,
  fecha_nacimiento  DATE         NOT NULL,
  domicilio         VARCHAR(200),
  telefono          VARCHAR(20),
  email             VARCHAR(150),
  profile_id        UUID         UNIQUE REFERENCES profiles(id)      ON DELETE SET NULL,
  inscripcion_id    UUID         UNIQUE REFERENCES inscripciones(id) ON DELETE SET NULL,
  estado            VARCHAR(20)  NOT NULL DEFAULT 'activo'
                                 CHECK (estado IN ('activo','egresado','baja')),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Vínculo alumno–tutor. Regla del enunciado: "un padre puede tener uno o
-- varios hijos asociados y solo consulta y gestiona los suyos".
CREATE TABLE IF NOT EXISTS alumno_tutor (
  alumno_id   UUID         NOT NULL REFERENCES alumnos(id)  ON DELETE CASCADE,
  tutor_id    UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relacion    VARCHAR(20)  NOT NULL CHECK (relacion IN ('padre','madre','tutor')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (alumno_id, tutor_id)
);

-- HU1. Matrícula: ubica a un alumno en un curso para un ciclo lectivo.
-- Regla del enunciado: "cada alumno pertenece a un único curso". La restricción
-- UNIQUE (alumno_id, ciclo_id) es la que impide matricularlo dos veces en el
-- mismo año, y hace verificable el criterio de aceptación de HU1.
CREATE TABLE IF NOT EXISTS matriculas (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id           UUID         NOT NULL REFERENCES alumnos(id)         ON DELETE CASCADE,
  curso_id            UUID         NOT NULL REFERENCES cursos(id)          ON DELETE RESTRICT,
  ciclo_id            INTEGER      NOT NULL REFERENCES ciclos_lectivos(id) ON DELETE RESTRICT,
  estado              VARCHAR(20)  NOT NULL DEFAULT 'activa'
                                   CHECK (estado IN ('activa','baja','trasladada')),
  fecha_matriculacion DATE         NOT NULL DEFAULT CURRENT_DATE,
  matriculado_por     UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  observaciones       TEXT,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT alumno_un_curso_por_ciclo UNIQUE (alumno_id, ciclo_id)
);

-- HU4. Asistencia diaria.
-- UNIQUE (matricula_id, fecha) implementa el criterio de aceptación
-- "si la fecha ya fue cargada, el registro se edita en lugar de duplicarse".
CREATE TABLE IF NOT EXISTS asistencias (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id   UUID         NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
  fecha          DATE         NOT NULL,
  estado         VARCHAR(20)  NOT NULL
                              CHECK (estado IN ('presente','ausente','tarde','justificada')),
  observacion    VARCHAR(200),
  registrada_por UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT asistencia_unica_por_dia UNIQUE (matricula_id, fecha)
);


-- ── PASO 3: AMPLIAR EL ESTADO DE LAS SOLICITUDES ────────────────────────────
-- HU1 exige que una solicitud aceptada pase a "matriculada" y no pueda
-- volver a matricularse. El CHECK original no contemplaba ese estado.

ALTER TABLE inscripciones DROP CONSTRAINT IF EXISTS inscripciones_estado_check;
ALTER TABLE inscripciones ADD  CONSTRAINT inscripciones_estado_check
  CHECK (estado IN ('pendiente','en_revision','aceptada','rechazada','matriculada'));


-- ── PASO 4: REGLAS DE NEGOCIO EN LA BASE ────────────────────────────────────

-- Devuelve los alumnos de los que el usuario actual es tutor.
-- Regla del enunciado: "un padre solo consulta y gestiona los suyos".
-- Se define acá y no junto a las otras funciones de rol porque consulta
-- alumno_tutor, que recién existe después del PASO 2.
CREATE OR REPLACE FUNCTION public.alumnos_a_cargo()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT alumno_id FROM alumno_tutor WHERE tutor_id = auth.uid()
$$;


-- El docente asignado a una materia debe tener efectivamente el rol docente.
CREATE OR REPLACE FUNCTION public.validar_docente_de_materia()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.docente_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = NEW.docente_id AND rol = 'docente' AND activo = TRUE
    ) THEN
      RAISE EXCEPTION 'El docente asignado no existe, no tiene rol docente o está inactivo';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_docente ON curso_materia;
CREATE TRIGGER trg_validar_docente
  BEFORE INSERT OR UPDATE ON curso_materia
  FOR EACH ROW EXECUTE FUNCTION public.validar_docente_de_materia();

-- La matrícula no puede superar el cupo del curso.
CREATE OR REPLACE FUNCTION public.validar_cupo_del_curso()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ocupadas INTEGER;
  limite   INTEGER;
BEGIN
  SELECT cupo INTO limite FROM cursos WHERE id = NEW.curso_id;
  SELECT COUNT(*) INTO ocupadas
    FROM matriculas
   WHERE curso_id = NEW.curso_id
     AND estado = 'activa'
     AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

  IF ocupadas >= limite THEN
    RAISE EXCEPTION 'El curso alcanzó su cupo máximo (% lugares)', limite;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_cupo ON matriculas;
CREATE TRIGGER trg_validar_cupo
  BEFORE INSERT OR UPDATE OF curso_id, estado ON matriculas
  FOR EACH ROW WHEN (NEW.estado = 'activa')
  EXECUTE FUNCTION public.validar_cupo_del_curso();

-- Número de legajo correlativo por año: AAAA-NNNN (ej. 2027-0001).
CREATE SEQUENCE IF NOT EXISTS seq_legajo_alumno START 1;

CREATE OR REPLACE FUNCTION public.generar_legajo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.legajo IS NULL OR NEW.legajo = '' THEN
    NEW.legajo := TO_CHAR(CURRENT_DATE, 'YYYY') || '-' ||
                  LPAD(NEXTVAL('seq_legajo_alumno')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generar_legajo ON alumnos;
CREATE TRIGGER trg_generar_legajo
  BEFORE INSERT ON alumnos
  FOR EACH ROW EXECUTE FUNCTION public.generar_legajo();

-- updated_at automático (reutiliza la función del esquema de la Parte 1).
DROP TRIGGER IF EXISTS trg_cursos_updated        ON cursos;
DROP TRIGGER IF EXISTS trg_curso_materia_updated ON curso_materia;
DROP TRIGGER IF EXISTS trg_alumnos_updated       ON alumnos;
DROP TRIGGER IF EXISTS trg_matriculas_updated    ON matriculas;
DROP TRIGGER IF EXISTS trg_asistencias_updated   ON asistencias;

CREATE TRIGGER trg_cursos_updated        BEFORE UPDATE ON cursos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_curso_materia_updated BEFORE UPDATE ON curso_materia
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_alumnos_updated       BEFORE UPDATE ON alumnos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_matriculas_updated    BEFORE UPDATE ON matriculas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_asistencias_updated   BEFORE UPDATE ON asistencias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── PASO 5: ÍNDICES ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cursos_ciclo          ON cursos(ciclo_id, nivel_id);
CREATE INDEX IF NOT EXISTS idx_curso_materia_curso   ON curso_materia(curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_materia_docente ON curso_materia(docente_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_dni           ON alumnos(dni);
CREATE INDEX IF NOT EXISTS idx_alumnos_apellido      ON alumnos(apellido, nombre);
CREATE INDEX IF NOT EXISTS idx_alumno_tutor_tutor    ON alumno_tutor(tutor_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_curso      ON matriculas(curso_id, estado);
CREATE INDEX IF NOT EXISTS idx_matriculas_alumno     ON matriculas(alumno_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha     ON asistencias(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_asistencias_matricula ON asistencias(matricula_id, fecha DESC);


-- ── PASO 6: ROW LEVEL SECURITY ──────────────────────────────────────────────
ALTER TABLE ciclos_lectivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias        ENABLE ROW LEVEL SECURITY;
ALTER TABLE curso_materia   ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumno_tutor    ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias     ENABLE ROW LEVEL SECURITY;

-- Limpieza previa (idempotencia)
DROP POLICY IF EXISTS ciclos_lectura        ON ciclos_lectivos;
DROP POLICY IF EXISTS ciclos_admin          ON ciclos_lectivos;
DROP POLICY IF EXISTS niveles_lectura       ON niveles;
DROP POLICY IF EXISTS niveles_admin         ON niveles;
DROP POLICY IF EXISTS cursos_lectura        ON cursos;
DROP POLICY IF EXISTS cursos_admin          ON cursos;
DROP POLICY IF EXISTS materias_lectura      ON materias;
DROP POLICY IF EXISTS materias_admin        ON materias;
DROP POLICY IF EXISTS curso_materia_lectura ON curso_materia;
DROP POLICY IF EXISTS curso_materia_admin   ON curso_materia;
DROP POLICY IF EXISTS alumnos_personal      ON alumnos;
DROP POLICY IF EXISTS alumnos_familia       ON alumnos;
DROP POLICY IF EXISTS alumnos_admin         ON alumnos;
DROP POLICY IF EXISTS tutor_lectura         ON alumno_tutor;
DROP POLICY IF EXISTS tutor_admin           ON alumno_tutor;
DROP POLICY IF EXISTS matriculas_personal   ON matriculas;
DROP POLICY IF EXISTS matriculas_familia    ON matriculas;
DROP POLICY IF EXISTS matriculas_admin      ON matriculas;
DROP POLICY IF EXISTS asistencias_lectura   ON asistencias;
DROP POLICY IF EXISTS asistencias_docente   ON asistencias;
DROP POLICY IF EXISTS asistencias_admin     ON asistencias;

-- Catálogos: los lee cualquier usuario autenticado; los modifica Administración.
CREATE POLICY ciclos_lectura  ON ciclos_lectivos FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY ciclos_admin    ON ciclos_lectivos FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

CREATE POLICY niveles_lectura ON niveles FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY niveles_admin   ON niveles FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

CREATE POLICY cursos_lectura  ON cursos FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY cursos_admin    ON cursos FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

CREATE POLICY materias_lectura ON materias FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY materias_admin   ON materias FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

CREATE POLICY curso_materia_lectura ON curso_materia FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY curso_materia_admin   ON curso_materia FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

-- Alumnos: el personal de la institución los ve; la familia ve solo a los suyos.
CREATE POLICY alumnos_personal ON alumnos FOR SELECT
  USING (tiene_rol('admin','autoridad','docente','personal'));

CREATE POLICY alumnos_familia  ON alumnos FOR SELECT
  USING (
    id IN (SELECT * FROM alumnos_a_cargo())
    OR profile_id = auth.uid()
  );

CREATE POLICY alumnos_admin    ON alumnos FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

CREATE POLICY tutor_lectura ON alumno_tutor FOR SELECT
  USING (tutor_id = auth.uid() OR tiene_rol('admin','autoridad','docente','personal'));
CREATE POLICY tutor_admin   ON alumno_tutor FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

-- Matrículas: solo Administración matricula. La familia consulta la de sus hijos.
CREATE POLICY matriculas_personal ON matriculas FOR SELECT
  USING (tiene_rol('admin','autoridad','docente','personal'));

CREATE POLICY matriculas_familia  ON matriculas FOR SELECT
  USING (alumno_id IN (SELECT * FROM alumnos_a_cargo()));

CREATE POLICY matriculas_admin    ON matriculas FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

-- Asistencia: la carga el docente asignado al curso; la consultan familia y personal.
CREATE POLICY asistencias_lectura ON asistencias FOR SELECT
  USING (
    tiene_rol('admin','autoridad','docente','personal')
    OR matricula_id IN (
      SELECT m.id FROM matriculas m WHERE m.alumno_id IN (SELECT * FROM alumnos_a_cargo())
    )
  );

CREATE POLICY asistencias_docente ON asistencias FOR ALL
  USING (
    tiene_rol('docente')
    AND matricula_id IN (
      SELECT m.id
        FROM matriculas m
        JOIN curso_materia cm ON cm.curso_id = m.curso_id
       WHERE cm.docente_id = auth.uid()
    )
  )
  WITH CHECK (
    tiene_rol('docente')
    AND matricula_id IN (
      SELECT m.id
        FROM matriculas m
        JOIN curso_materia cm ON cm.curso_id = m.curso_id
       WHERE cm.docente_id = auth.uid()
    )
  );

CREATE POLICY asistencias_admin ON asistencias FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));


-- ── PASO 7: DATOS INICIALES ─────────────────────────────────────────────────
INSERT INTO niveles (nombre, orden) VALUES
  ('inicial', 1), ('primario', 2), ('secundario', 3)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO ciclos_lectivos (anio, fecha_inicio, fecha_fin, activo) VALUES
  (2027, '2027-03-01', '2027-12-15', TRUE)
ON CONFLICT (anio) DO NOTHING;


-- ── PASO 8: PERMISOS ────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ciclos_lectivos, niveles, cursos, materias, curso_materia TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  cursos, materias, curso_materia, alumnos, alumno_tutor, matriculas, asistencias
  TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;


-- ============================================================================
-- VERIFICACIÓN — debe devolver 9 tablas nuevas
-- ============================================================================
-- SELECT table_name FROM information_schema.tables
--  WHERE table_schema = 'public'
--    AND table_name IN ('ciclos_lectivos','niveles','cursos','materias',
--                       'curso_materia','alumnos','alumno_tutor',
--                       'matriculas','asistencias')
--  ORDER BY table_name;
