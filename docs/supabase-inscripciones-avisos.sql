-- ============================================================================
-- PARTE 3 · VERSIÓN 1.1 DE LA APP — Inscripciones a servicios y avisos de cobranza
-- Centro Educativo "Educar para Transformar" · Grupo 4 · Metodología de Sistemas II
--
-- Ejecutar DESPUÉS de docs/supabase-cobranza.sql. Idempotente: se puede correr
-- más de una vez sin duplicar nada.
--
-- Qué agrega:
--   1. Grupos de cada deporte, con nivel, días, horario y profesor responsable.
--   2. El grupo en cada inscripción y el control de conflictos de horario.
--   3. Las funciones con las que el padre inscribe y da de baja desde la app.
--   4. La vista de avisos de cobranza (último día hábil y día 20).
--   5. Datos: los grupos de ejemplo y el grupo de las inscripciones existentes.
--
-- Reglas del enunciado que cubre:
--   "Cada deporte debe tener un profesor responsable."
--   "Un deporte puede tener diferentes grupos según nivel y horario."
--   "El sistema deberá controlar que no existan conflictos de horarios entre las
--    actividades deportivas seleccionadas por los estudiantes."
--   "Cada alumno puede inscribirse a dos deportes, al transporte por recorrido y
--    al comedor" — ahora también desde la app (HU-M5 · REQ-29).
-- ============================================================================


-- ── PASO 1: GRUPOS DE CADA DEPORTE ──────────────────────────────────────────
-- Un grupo es un deporte para un nivel, en días y horario fijos, con su profesor.
-- Los días van como en la norma ISO: 1 = lunes … 6 = sábado.

CREATE TABLE IF NOT EXISTS deporte_grupos (
  id           SERIAL        PRIMARY KEY,
  concepto_id  INTEGER       NOT NULL REFERENCES conceptos(id) ON DELETE RESTRICT,
  nivel_id     INTEGER       NOT NULL REFERENCES niveles(id)   ON DELETE RESTRICT,
  dias         SMALLINT[]    NOT NULL,
  hora_inicio  TIME          NOT NULL,
  hora_fin     TIME          NOT NULL,
  profesor     VARCHAR(100)  NOT NULL,
  activo       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT grupo_horario_coherente CHECK (hora_fin > hora_inicio),
  CONSTRAINT grupo_dias_validos      CHECK (cardinality(dias) > 0 AND dias <@ ARRAY[1,2,3,4,5,6]::SMALLINT[]),
  CONSTRAINT grupo_unico             UNIQUE (concepto_id, nivel_id, dias, hora_inicio)
);

-- Un grupo solo puede ser de un concepto de tipo deporte.
CREATE OR REPLACE FUNCTION public.validar_grupo_deporte()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT tipo FROM conceptos WHERE id = NEW.concepto_id) IS DISTINCT FROM 'deporte' THEN
    RAISE EXCEPTION 'Solo los deportes tienen grupos por nivel y horario';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_grupo_deporte ON deporte_grupos;
CREATE TRIGGER trg_validar_grupo_deporte
  BEFORE INSERT OR UPDATE ON deporte_grupos
  FOR EACH ROW EXECUTE FUNCTION public.validar_grupo_deporte();


-- ── PASO 2: EL GRUPO EN CADA INSCRIPCIÓN Y EL CONTROL DE HORARIOS ───────────

ALTER TABLE inscripciones_servicio
  ADD COLUMN IF NOT EXISTS grupo_id INTEGER REFERENCES deporte_grupos(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_insc_servicio_grupo ON inscripciones_servicio(grupo_id);

-- Misma función de la Etapa 1, con tres controles más:
--   · el grupo tiene que ser del deporte elegido y del nivel del alumno;
--   · solo los deportes llevan grupo;
--   · dos deportes con días en común y horas que se cruzan no pueden convivir.
-- Los horarios que solo se tocan (uno termina 18:30 y el otro empieza 18:30) no chocan.
CREATE OR REPLACE FUNCTION public.validar_inscripcion_servicio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo         TEXT;
  v_nombre       TEXT;
  v_periodo      DATERANGE := daterange(NEW.desde, NEW.hasta, '[]');
  v_superpuestas INTEGER;
  v_grupo        deporte_grupos%ROWTYPE;
  v_nivel        INTEGER;
  v_choque       RECORD;
BEGIN
  SELECT tipo, nombre INTO v_tipo, v_nombre FROM conceptos WHERE id = NEW.concepto_id;

  IF v_tipo = 'cuota' THEN
    RAISE EXCEPTION 'La cuota no requiere inscripción: se cobra a todo alumno matriculado';
  END IF;

  IF NEW.grupo_id IS NOT NULL AND v_tipo <> 'deporte' THEN
    RAISE EXCEPTION 'Solo los deportes tienen grupos por nivel y horario';
  END IF;

  IF NEW.grupo_id IS NOT NULL THEN
    SELECT * INTO v_grupo FROM deporte_grupos WHERE id = NEW.grupo_id;
    IF v_grupo.concepto_id IS DISTINCT FROM NEW.concepto_id THEN
      RAISE EXCEPTION 'El grupo elegido no es de %', v_nombre;
    END IF;

    SELECT c.nivel_id INTO v_nivel
      FROM matriculas m
      JOIN cursos c           ON c.id  = m.curso_id
      JOIN ciclos_lectivos cl ON cl.id = m.ciclo_id
     WHERE m.alumno_id = NEW.alumno_id AND m.estado = 'activa' AND cl.activo
     LIMIT 1;
    IF v_nivel IS NOT NULL AND v_grupo.nivel_id <> v_nivel THEN
      RAISE EXCEPTION 'El grupo elegido es de otro nivel educativo';
    END IF;
  END IF;

  -- Inscripción duplicada: el mismo servicio en un período que se superpone.
  IF EXISTS (
    SELECT 1 FROM inscripciones_servicio i
     WHERE i.alumno_id = NEW.alumno_id
       AND i.concepto_id = NEW.concepto_id
       AND i.id <> NEW.id
       AND daterange(i.desde, i.hasta, '[]') && v_periodo
  ) THEN
    RAISE EXCEPTION 'El alumno ya está inscripto a % en ese período', v_nombre;
  END IF;

  SELECT COUNT(*) INTO v_superpuestas
    FROM inscripciones_servicio i
    JOIN conceptos c ON c.id = i.concepto_id
   WHERE i.alumno_id = NEW.alumno_id
     AND c.tipo = v_tipo
     AND i.id <> NEW.id
     AND daterange(i.desde, i.hasta, '[]') && v_periodo;

  IF v_tipo = 'deporte' AND v_superpuestas >= 2 THEN
    RAISE EXCEPTION 'Un alumno puede estar inscripto a dos deportes como máximo al mismo tiempo';
  ELSIF v_tipo = 'transporte' AND v_superpuestas >= 1 THEN
    RAISE EXCEPTION 'Un alumno puede usar un solo recorrido de transporte a la vez';
  ELSIF v_tipo = 'comedor' AND v_superpuestas >= 1 THEN
    RAISE EXCEPTION 'El alumno ya está inscripto al comedor en ese período';
  END IF;

  -- Conflicto de horario con otro deporte del alumno en el mismo período.
  IF NEW.grupo_id IS NOT NULL THEN
    SELECT c.nombre, g.hora_inicio, g.hora_fin INTO v_choque
      FROM inscripciones_servicio i
      JOIN deporte_grupos g ON g.id = i.grupo_id
      JOIN conceptos c      ON c.id = i.concepto_id
     WHERE i.alumno_id = NEW.alumno_id
       AND i.id <> NEW.id
       AND daterange(i.desde, i.hasta, '[]') && v_periodo
       AND g.dias && v_grupo.dias
       AND g.hora_inicio < v_grupo.hora_fin
       AND v_grupo.hora_inicio < g.hora_fin
     LIMIT 1;
    IF FOUND THEN
      RAISE EXCEPTION 'Conflicto de horario: % se superpone con % (de % a %)',
        v_nombre, v_choque.nombre,
        to_char(v_choque.hora_inicio, 'HH24:MI'), to_char(v_choque.hora_fin, 'HH24:MI');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
-- El disparador trg_validar_inscripcion_servicio de la Etapa 1 ya usa esta función.


-- ── PASO 3: INSCRIBIR Y DAR DE BAJA DESDE LA APP ────────────────────────────
-- Igual que con los pagos, el padre no escribe en la tabla: llama a dos funciones
-- que validan que el alumno sea suyo y hacen el cambio completo.
-- Regla de fechas: el alta y la baja rigen desde el primer mes todavía sin facturar,
-- así las facturas ya emitidas no quedan desactualizadas.

-- Primer mes en el que puede empezar o terminar un servicio. Respeta el RLS de quien
-- consulta: un padre solo la obtiene para sus hijos.
CREATE OR REPLACE FUNCTION public.primer_mes_sin_facturar(p_alumno UUID)
RETURNS DATE
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT GREATEST(
    (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::DATE,
    (SELECT (MAX(periodo) + INTERVAL '1 month')::DATE FROM facturas WHERE alumno_id = p_alumno),
    (SELECT date_trunc('month', fecha_inicio)::DATE FROM ciclos_lectivos WHERE activo LIMIT 1)
  );
$$;

CREATE OR REPLACE FUNCTION public.inscribir_a_servicio(
  p_alumno UUID, p_concepto INTEGER, p_grupo INTEGER, p_desde DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo   TEXT;
  v_desde  DATE := date_trunc('month', p_desde)::DATE;
  v_minimo DATE;
  v_fin    DATE;
  v_id     UUID;
BEGIN
  IF NOT (p_alumno IN (SELECT * FROM alumnos_a_cargo()) OR tiene_rol('admin')) THEN
    RAISE EXCEPTION 'El alumno no existe o no está a su cargo';
  END IF;

  SELECT tipo INTO v_tipo FROM conceptos WHERE id = p_concepto AND activo;
  IF v_tipo IS NULL OR v_tipo NOT IN ('deporte', 'transporte', 'comedor') THEN
    RAISE EXCEPTION 'El servicio elegido no existe o no admite inscripción';
  END IF;
  IF v_tipo = 'deporte' AND p_grupo IS NULL THEN
    RAISE EXCEPTION 'Elegí el grupo del deporte: nivel, días y horario';
  END IF;

  v_minimo := primer_mes_sin_facturar(p_alumno);
  IF v_desde < v_minimo THEN
    RAISE EXCEPTION 'La inscripción puede empezar desde %: los meses anteriores ya están facturados',
      to_char(v_minimo, 'MM/YYYY');
  END IF;
  SELECT fecha_fin INTO v_fin FROM ciclos_lectivos WHERE activo LIMIT 1;
  IF v_fin IS NOT NULL AND v_desde > v_fin THEN
    RAISE EXCEPTION 'El mes elegido está fuera del ciclo lectivo';
  END IF;

  -- El disparador del PASO 2 controla dos deportes, un recorrido, duplicados,
  -- nivel del grupo y conflictos de horario.
  INSERT INTO inscripciones_servicio (alumno_id, concepto_id, grupo_id, desde)
  VALUES (p_alumno, p_concepto, CASE WHEN v_tipo = 'deporte' THEN p_grupo END, v_desde)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Deja el servicio a partir del mes indicado (ese mes ya no se factura). Si la
-- inscripción todavía no empezó, se borra: nunca llegó a facturarse.
CREATE OR REPLACE FUNCTION public.dar_de_baja_servicio(p_inscripcion UUID, p_desde DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_insc   inscripciones_servicio%ROWTYPE;
  v_desde  DATE := date_trunc('month', p_desde)::DATE;
  v_minimo DATE;
BEGIN
  SELECT * INTO v_insc FROM inscripciones_servicio WHERE id = p_inscripcion;
  IF v_insc.id IS NULL
     OR NOT (v_insc.alumno_id IN (SELECT * FROM alumnos_a_cargo()) OR tiene_rol('admin')) THEN
    RAISE EXCEPTION 'La inscripción no existe o no corresponde a un alumno a su cargo';
  END IF;
  IF v_insc.hasta IS NOT NULL THEN
    RAISE EXCEPTION 'Esta inscripción ya tiene fecha de baja';
  END IF;

  v_minimo := primer_mes_sin_facturar(v_insc.alumno_id);
  IF v_desde < v_minimo THEN
    RAISE EXCEPTION 'La baja puede regir desde %: los meses anteriores ya están facturados',
      to_char(v_minimo, 'MM/YYYY');
  END IF;

  IF v_desde <= v_insc.desde THEN
    DELETE FROM inscripciones_servicio WHERE id = p_inscripcion;
    RETURN 'cancelada';
  END IF;
  UPDATE inscripciones_servicio SET hasta = v_desde - 1 WHERE id = p_inscripcion;
  RETURN 'baja';
END;
$$;


-- ── PASO 4: AVISOS DE COBRANZA (último día hábil y día 20) ──────────────────
-- Enunciado: "Enviar por mail el último día hábil del mes un recordatorio del total
-- que cada padre debe abonar, detallando la composición" y "enviar el día 20 de cada
-- mes la deuda en caso de no haber realizado el pago completo".
--
-- La vista arma el contenido de cada aviso y su fecha. Hoy la app lo muestra.
-- Para enviarlo por correo no hace falta rehacerlo: una tarea programada (pg_cron +
-- una Edge Function con un servicio de correo) lee esta misma vista con
-- fecha_envio = CURRENT_DATE y lo manda a los tutores del alumno.
--
--   recordatorio → se envía el último día hábil del mes anterior a la factura (vence
--                  el 10): el total y cada ítem que lo compone.
--   deuda        → se envía el día 20 del mes de la factura si queda saldo: cada
--                  ítem todavía impago.
-- El último día hábil se calcula saltando sábado y domingo; los feriados no se
-- consideran.
-- security_invoker = true: cada familia ve solo los avisos de sus hijos.

CREATE OR REPLACE VIEW avisos_cobranza
WITH (security_invoker = true) AS
SELECT e.id AS factura_id, e.numero, e.alumno_id, e.periodo, e.vencimiento, e.estado,
       'recordatorio'::TEXT AS tipo,
       ((e.periodo - 1) - CASE EXTRACT(ISODOW FROM e.periodo - 1) WHEN 6 THEN 1 WHEN 7 THEN 2 ELSE 0 END)::DATE
         AS fecha_envio,
       e.total AS importe,
       (SELECT jsonb_agg(jsonb_build_object('descripcion', i.descripcion, 'importe', i.importe)
                         ORDER BY i.importe DESC)
          FROM factura_items i WHERE i.factura_id = e.id) AS detalle
  FROM facturas_estado e
UNION ALL
SELECT e.id, e.numero, e.alumno_id, e.periodo, e.vencimiento, e.estado,
       'deuda'::TEXT,
       (e.periodo + 19)::DATE,
       e.saldo,
       (SELECT jsonb_agg(jsonb_build_object('descripcion', i.descripcion, 'importe', i.importe)
                         ORDER BY i.importe DESC)
          FROM factura_items i
          LEFT JOIN comprobantes c ON c.id = i.comprobante_id
         WHERE i.factura_id = e.id AND c.estado IS DISTINCT FROM 'informado')
  FROM facturas_estado e
 WHERE e.saldo > 0;


-- ── PASO 5: SEGURIDAD, AUDITORÍA Y PERMISOS ─────────────────────────────────

ALTER TABLE deporte_grupos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deporte_grupos_lectura ON deporte_grupos;
DROP POLICY IF EXISTS deporte_grupos_admin   ON deporte_grupos;
CREATE POLICY deporte_grupos_lectura ON deporte_grupos FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY deporte_grupos_admin   ON deporte_grupos FOR ALL
  USING (tiene_rol('admin')) WITH CHECK (tiene_rol('admin'));

-- Altas y bajas de servicios quedan en la auditoría (REQ-22).
DROP TRIGGER IF EXISTS trg_auditoria_inscripciones_servicio ON inscripciones_servicio;
CREATE TRIGGER trg_auditoria_inscripciones_servicio
  AFTER INSERT OR UPDATE OR DELETE ON inscripciones_servicio
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

GRANT SELECT, INSERT, UPDATE, DELETE ON deporte_grupos TO authenticated;
GRANT SELECT ON avisos_cobranza TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

REVOKE ALL ON FUNCTION public.primer_mes_sin_facturar(UUID)                      FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.inscribir_a_servicio(UUID, INTEGER, INTEGER, DATE) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.dar_de_baja_servicio(UUID, DATE)                   FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.primer_mes_sin_facturar(UUID)                      TO authenticated;
GRANT EXECUTE ON FUNCTION public.inscribir_a_servicio(UUID, INTEGER, INTEGER, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dar_de_baja_servicio(UUID, DATE)                   TO authenticated;


-- ── PASO 6: DATOS — GRUPOS DE EJEMPLO ───────────────────────────────────────
-- Un grupo por deporte y por nivel, después del horario escolar. Profesores ficticios.
-- En primario hay superposiciones a propósito para probar el control:
--   Básquet choca con Fútbol (lunes y miércoles) y Danza con Natación (martes y jueves).
--   Artes Marciales empieza 18:30, justo cuando termina Fútbol: no choca.

WITH datos (deporte, nivel, dias, inicio, fin, profesor) AS (
  VALUES
    ('Fútbol',          'primario',   ARRAY[1,3], '17:00', '18:30', 'Prof. Martín Acosta'),
    ('Natación',        'primario',   ARRAY[2,4], '17:00', '18:00', 'Prof. Lucía Benítez'),
    ('Básquet',         'primario',   ARRAY[1,3], '17:30', '19:00', 'Prof. Diego Romero'),
    ('Vóleibol',        'primario',   ARRAY[5],   '17:00', '18:30', 'Prof. Carla Méndez'),
    ('Atletismo',       'primario',   ARRAY[6],   '09:00', '10:30', 'Prof. Pablo Ríos'),
    ('Danza',           'primario',   ARRAY[2,4], '17:30', '18:30', 'Prof. Sofía Duarte'),
    ('Artes Marciales', 'primario',   ARRAY[3,5], '18:30', '19:30', 'Prof. Hernán Vega'),
    ('Ajedrez',         'primario',   ARRAY[5],   '15:00', '16:00', 'Prof. Ana Torres'),
    ('Fútbol',          'secundario', ARRAY[2,4], '18:30', '20:00', 'Prof. Martín Acosta'),
    ('Natación',        'secundario', ARRAY[1,3], '18:30', '19:30', 'Prof. Lucía Benítez'),
    ('Básquet',         'secundario', ARRAY[1,3], '19:00', '20:30', 'Prof. Diego Romero'),
    ('Vóleibol',        'secundario', ARRAY[2,4], '19:00', '20:30', 'Prof. Carla Méndez'),
    ('Atletismo',       'secundario', ARRAY[6],   '10:30', '12:00', 'Prof. Pablo Ríos'),
    ('Danza',           'secundario', ARRAY[5],   '18:00', '19:30', 'Prof. Sofía Duarte'),
    ('Artes Marciales', 'secundario', ARRAY[2,4], '20:00', '21:00', 'Prof. Hernán Vega'),
    ('Ajedrez',         'secundario', ARRAY[3],   '16:00', '17:30', 'Prof. Ana Torres'),
    ('Natación',        'inicial',    ARRAY[2,4], '16:00', '16:45', 'Prof. Lucía Benítez'),
    ('Atletismo',       'inicial',    ARRAY[6],   '08:00', '09:00', 'Prof. Pablo Ríos'),
    ('Danza',           'inicial',    ARRAY[1,3], '16:00', '16:45', 'Prof. Sofía Duarte'),
    ('Fútbol',          'inicial',    ARRAY[5],   '16:00', '16:45', 'Prof. Martín Acosta')
)
INSERT INTO deporte_grupos (concepto_id, nivel_id, dias, hora_inicio, hora_fin, profesor)
SELECT c.id, n.id, d.dias::SMALLINT[], d.inicio::TIME, d.fin::TIME, d.profesor
  FROM datos d
  JOIN conceptos c ON c.tipo = 'deporte' AND c.nombre = d.deporte
  JOIN niveles n   ON n.nombre = d.nivel
ON CONFLICT (concepto_id, nivel_id, dias, hora_inicio) DO NOTHING;

-- Las inscripciones a deportes que ya existían toman el grupo de su deporte y del
-- nivel del alumno.
UPDATE inscripciones_servicio i
   SET grupo_id = (
     SELECT g.id
       FROM deporte_grupos g
       JOIN matriculas m       ON m.alumno_id = i.alumno_id AND m.estado = 'activa'
       JOIN ciclos_lectivos cl ON cl.id = m.ciclo_id AND cl.activo
       JOIN cursos cu          ON cu.id = m.curso_id
      WHERE g.concepto_id = i.concepto_id AND g.nivel_id = cu.nivel_id
      ORDER BY g.hora_inicio
      LIMIT 1)
 WHERE i.grupo_id IS NULL
   AND i.concepto_id IN (SELECT id FROM conceptos WHERE tipo = 'deporte');


-- ============================================================================
-- VERIFICACIÓN (ejecutar de a una después del script)
-- ============================================================================
-- 1) Grupos cargados (tiene que devolver 20):
--    SELECT COUNT(*) FROM deporte_grupos;
--
-- 2) Las inscripciones a deportes tienen grupo (tiene que devolver 0 filas):
--    SELECT i.id FROM inscripciones_servicio i JOIN conceptos c ON c.id = i.concepto_id
--     WHERE c.tipo = 'deporte' AND i.grupo_id IS NULL;
--
-- 3) Avisos armados para las facturas existentes:
--    SELECT tipo, periodo, fecha_envio, importe FROM avisos_cobranza ORDER BY fecha_envio;
--
-- 4) Sin sesión, inscribir se rechaza (en el SQL Editor corre como postgres, así que
--    esta prueba se hace desde la app o suplantando a un padre).
