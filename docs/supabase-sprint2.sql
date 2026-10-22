-- ============================================================================
-- SISTEMA DE GESTIÓN — SPRINT 2 (29/09 – 13/10/2026)
-- Centro Educativo "Educar para Transformar" · Metodología de Sistemas II
--
-- Cubre:
--   HU2   · Carga de calificaciones por alumno, materia y período (REQ-15)
--   State · Transiciones válidas de una solicitud de inscripción
--
-- Se ejecuta DESPUÉS de docs/supabase-gestion.sql. Es idempotente.
--
-- INSTRUCCIONES: Supabase → SQL Editor → New query → pegar → Run
-- ============================================================================


-- ── PASO 1: MATERIAS QUE DICTA EL USUARIO ACTUAL ────────────────────────────
-- Misma idea que alumnos_a_cargo(): la regla "solo el docente titular" se
-- escribe una vez y la usan todas las políticas que la necesiten.
--
-- Exige además el rol docente vigente: si a un titular se le cambia el rol,
-- deja de ver y de editar las notas de las materias que todavía tiene
-- asignadas. Sin esa condición la política de lectura se las seguía mostrando
-- (detectado en las pruebas del 21/10).

CREATE OR REPLACE FUNCTION public.dictados_del_docente()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM curso_materia
   WHERE docente_id = auth.uid()
     AND tiene_rol('docente')
$$;


-- ── PASO 2: CALIFICACIONES (HU2) ────────────────────────────────────────────
-- Una nota por alumno, materia, período e instancia de evaluación.
-- El año se divide en tres trimestres con hasta tres evaluaciones cada uno.
--
-- La nota cuelga de la MATRÍCULA (no del alumno) para que quede ligada al ciclo
-- lectivo, y del DICTADO (curso_materia) para saber quién es el docente titular.

CREATE TABLE IF NOT EXISTS calificaciones (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id     UUID          NOT NULL REFERENCES matriculas(id)    ON DELETE CASCADE,
  curso_materia_id UUID          NOT NULL REFERENCES curso_materia(id) ON DELETE RESTRICT,
  periodo          SMALLINT      NOT NULL,
  instancia        SMALLINT      NOT NULL,
  nota             NUMERIC(4,2)  NOT NULL,
  observacion      VARCHAR(200),
  cargada_por      UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- Criterio de aceptación de HU2: "nota fuera de rango → se rechaza".
  CONSTRAINT calificacion_nota_en_rango  CHECK (nota >= 1 AND nota <= 10),
  CONSTRAINT calificacion_periodo_valido CHECK (periodo BETWEEN 1 AND 3),
  CONSTRAINT calificacion_instancia_valida CHECK (instancia BETWEEN 1 AND 3),
  CONSTRAINT calificacion_unica UNIQUE (matricula_id, curso_materia_id, periodo, instancia)
);

-- El alumno tiene que estar matriculado en el MISMO curso donde se dicta la
-- materia, y con la matrícula activa. Sin esto, un docente podría calificar a
-- un alumno de otro curso.
CREATE OR REPLACE FUNCTION public.validar_calificacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM matriculas m
      JOIN curso_materia cm ON cm.curso_id = m.curso_id
     WHERE m.id = NEW.matricula_id
       AND cm.id = NEW.curso_materia_id
       AND m.estado = 'activa'
  ) THEN
    RAISE EXCEPTION 'El alumno no tiene una matrícula activa en el curso donde se dicta esta materia';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_calificacion ON calificaciones;
CREATE TRIGGER trg_validar_calificacion
  BEFORE INSERT OR UPDATE OF matricula_id, curso_materia_id ON calificaciones
  FOR EACH ROW EXECUTE FUNCTION public.validar_calificacion();

DROP TRIGGER IF EXISTS trg_calificaciones_updated ON calificaciones;
CREATE TRIGGER trg_calificaciones_updated BEFORE UPDATE ON calificaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_calificaciones_dictado
  ON calificaciones(curso_materia_id, periodo);
CREATE INDEX IF NOT EXISTS idx_calificaciones_matricula
  ON calificaciones(matricula_id);


-- ── PASO 3: PROMEDIO DEL PERÍODO ────────────────────────────────────────────
-- Criterio de aceptación de HU2: "al guardar, el promedio del período se
-- recalcula automáticamente". Una vista no guarda el promedio: lo calcula cada
-- vez que se consulta, así que nunca puede quedar desactualizado.
--
-- security_invoker = true hace que la vista respete las políticas RLS de
-- calificaciones. Sin esa opción, la vista se ejecutaría con los permisos de
-- su dueño y cualquier usuario vería todos los promedios.

DROP VIEW IF EXISTS promedios_periodo;
CREATE VIEW promedios_periodo
WITH (security_invoker = true) AS
SELECT matricula_id,
       curso_materia_id,
       periodo,
       ROUND(AVG(nota), 2) AS promedio,
       COUNT(*)            AS notas_cargadas
  FROM calificaciones
 GROUP BY matricula_id, curso_materia_id, periodo;


-- ── PASO 4: PATRÓN STATE EN LA BASE — TRANSICIONES DE UNA SOLICITUD ─────────
-- La aplicación modela los estados con el patrón State
-- (src/domain/estadoSolicitud.js). Esta función replica las mismas reglas en la
-- base, por la regla del proyecto de validar en las dos capas: si alguien
-- modifica la solicitud por fuera de la aplicación, la base también la rechaza.
--
--   pendiente   → en_revision · aceptada · rechazada
--   en_revision → aceptada · rechazada
--   aceptada    → matriculada · en_revision
--   rechazada   → en_revision
--   matriculada → (estado final)

CREATE OR REPLACE FUNCTION public.validar_transicion_solicitud()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.estado = OLD.estado THEN
    RETURN NEW;
  END IF;

  IF NOT (
       (OLD.estado = 'pendiente'   AND NEW.estado IN ('en_revision', 'aceptada', 'rechazada'))
    OR (OLD.estado = 'en_revision' AND NEW.estado IN ('aceptada', 'rechazada'))
    OR (OLD.estado = 'aceptada'    AND NEW.estado IN ('matriculada', 'en_revision'))
    OR (OLD.estado = 'rechazada'   AND NEW.estado IN ('en_revision'))
  ) THEN
    RAISE EXCEPTION 'Una solicitud en estado "%" no puede pasar a "%"', OLD.estado, NEW.estado;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_transicion_solicitud ON inscripciones;
CREATE TRIGGER trg_transicion_solicitud
  BEFORE UPDATE OF estado ON inscripciones
  FOR EACH ROW EXECUTE FUNCTION public.validar_transicion_solicitud();


-- ── PASO 5: ROW LEVEL SECURITY DE CALIFICACIONES ────────────────────────────
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS calificaciones_lectura ON calificaciones;
DROP POLICY IF EXISTS calificaciones_docente ON calificaciones;
DROP POLICY IF EXISTS calificaciones_admin   ON calificaciones;

-- Lectura: Administración, el docente titular, la familia del alumno y el
-- propio estudiante.
CREATE POLICY calificaciones_lectura ON calificaciones FOR SELECT
  USING (
    tiene_rol('admin', 'autoridad')
    OR curso_materia_id IN (SELECT * FROM dictados_del_docente())
    OR matricula_id IN (
      SELECT m.id FROM matriculas m WHERE m.alumno_id IN (SELECT * FROM alumnos_a_cargo())
    )
    OR matricula_id IN (
      SELECT m.id FROM matriculas m JOIN alumnos a ON a.id = m.alumno_id
       WHERE a.profile_id = auth.uid()
    )
  );

-- Carga y edición: SOLO el docente titular de esa materia en ese curso.
-- Criterio de aceptación de HU2: "un docente no titular no puede editar notas ajenas".
CREATE POLICY calificaciones_docente ON calificaciones FOR ALL
  USING (
    tiene_rol('docente')
    AND curso_materia_id IN (SELECT * FROM dictados_del_docente())
  )
  WITH CHECK (
    tiene_rol('docente')
    AND curso_materia_id IN (SELECT * FROM dictados_del_docente())
  );

CREATE POLICY calificaciones_admin ON calificaciones FOR ALL
  USING (tiene_rol('admin', 'autoridad')) WITH CHECK (tiene_rol('admin', 'autoridad'));


-- ── PASO 6: PERMISOS ────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON calificaciones TO authenticated;
GRANT SELECT ON promedios_periodo TO authenticated;


-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- 1) La tabla y la vista existen:
--    SELECT table_name, table_type FROM information_schema.tables
--     WHERE table_name IN ('calificaciones', 'promedios_periodo');
--
-- 2) La base rechaza una transición inválida (debe fallar):
--    UPDATE inscripciones SET estado = 'pendiente' WHERE estado = 'matriculada';
