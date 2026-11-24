-- ============================================================================
-- PARTE 3 · DATOS PARA LA DEMOSTRACIÓN — Un hermano de yura hakanson
-- Centro Educativo "Educar para Transformar" · Grupo 4 · Metodología de Sistemas II
--
-- Para qué: que la cuenta de padre de prueba tenga DOS hijos y la app muestre la
-- regla del enunciado "un padre puede tener uno o varios hijos asociados".
--
-- Qué crea (solo datos, no cambia el esquema):
--   1. Lucas, hermano de yura: mismos tutores y misma relación que ella.
--   2. Matrícula activa en 1.º A de secundario, turno mañana, ciclo 2027.
--   3. Servicios, con los grupos de secundario y sin superposición de horarios:
--        Vóleibol  desde marzo  (Mar y Jue 19:00 a 20:30)
--        Ajedrez   desde abril  (Mié 16:00 a 17:30)    → 2 de 2 deportes
--        Recorrido 1 desde abril, el mismo que su hermana
--        Sin comedor: en la demostración se puede inscribir desde la app.
--   4. Facturas de los mismos meses que tiene yura, todas pendientes.
--
-- Por qué no usa generar_facturas: esa función factura a TODOS los matriculados
-- del ciclo, y acá solo hay que tocar a Lucas. Repite su lógica para un alumno.
--
-- Ojo: la base es la misma que usa el sitio publicado (ver CLAUDE.md).
-- Idempotente: correrlo de nuevo no duplica nada.
--
-- INSTRUCCIONES: Supabase → SQL Editor → New query → pegar → Run
-- ============================================================================

DO $$
DECLARE
  v_dni      CONSTANT TEXT := '50246813';   -- ficticio
  v_hermana  UUID;
  v_alumno   UUID;
  v_nombre   TEXT;
  v_ciclo    INTEGER;
  v_curso    UUID;
  v_cuota    conceptos%ROWTYPE;
BEGIN
  -- ── 1. LA HERMANA Y SUS TUTORES ─────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM alumnos
       WHERE lower(nombre) = 'yura' AND lower(apellido) = 'hakanson') <> 1 THEN
    RAISE EXCEPTION 'No hay una única alumna yura hakanson: revisar antes de seguir';
  END IF;
  SELECT id INTO v_hermana FROM alumnos
   WHERE lower(nombre) = 'yura' AND lower(apellido) = 'hakanson';

  IF NOT EXISTS (SELECT 1 FROM alumno_tutor WHERE alumno_id = v_hermana) THEN
    RAISE EXCEPTION 'yura hakanson no tiene tutores asociados';
  END IF;

  -- ── 2. CICLO Y CURSO ────────────────────────────────────────────────────────
  SELECT id INTO v_ciclo FROM ciclos_lectivos WHERE activo;
  SELECT c.id INTO v_curso
    FROM cursos c JOIN niveles n ON n.id = c.nivel_id
   WHERE c.ciclo_id = v_ciclo AND n.nombre = 'secundario'
     AND c.anio = 1 AND c.division = 'A' AND c.turno = 'manana';
  IF v_curso IS NULL THEN
    RAISE EXCEPTION 'No existe 1.º A de secundario, turno mañana, en el ciclo activo';
  END IF;

  -- ── 3. EL ALUMNO (el legajo lo asigna el disparador) ────────────────────────
  SELECT id, nombre INTO v_alumno, v_nombre FROM alumnos WHERE dni = v_dni;
  IF v_alumno IS NULL THEN
    INSERT INTO alumnos (dni, apellido, nombre, fecha_nacimiento, domicilio)
    SELECT v_dni, a.apellido, 'Lucas', DATE '2014-06-18', a.domicilio
      FROM alumnos a WHERE a.id = v_hermana
    RETURNING id INTO v_alumno;
  ELSIF v_nombre <> 'Lucas' THEN
    RAISE EXCEPTION 'El DNI % ya es de otro alumno: cambiarlo en el script', v_dni;
  END IF;

  -- ── 4. LOS MISMOS TUTORES QUE SU HERMANA ────────────────────────────────────
  INSERT INTO alumno_tutor (alumno_id, tutor_id, relacion)
  SELECT v_alumno, t.tutor_id, t.relacion
    FROM alumno_tutor t WHERE t.alumno_id = v_hermana
  ON CONFLICT DO NOTHING;

  -- ── 5. MATRÍCULA ────────────────────────────────────────────────────────────
  INSERT INTO matriculas (alumno_id, curso_id, ciclo_id, estado, observaciones)
  VALUES (v_alumno, v_curso, v_ciclo, 'activa',
          'Alumno de prueba para la demostración de la app móvil')
  ON CONFLICT (alumno_id, ciclo_id) DO NOTHING;

  -- ── 6. SERVICIOS (el disparador valida grupos, máximo y horarios) ───────────
  INSERT INTO inscripciones_servicio (alumno_id, concepto_id, grupo_id, desde)
  SELECT v_alumno, c.id,
         CASE WHEN c.tipo = 'deporte' THEN
           (SELECT g.id FROM deporte_grupos g JOIN niveles n ON n.id = g.nivel_id
             WHERE g.concepto_id = c.id AND n.nombre = 'secundario' AND g.activo
             ORDER BY g.hora_inicio LIMIT 1)
         END,
         s.desde
    FROM (VALUES ('deporte',    'Vóleibol',     DATE '2027-03-01'),
                 ('deporte',    'Ajedrez',      DATE '2027-04-01'),
                 ('transporte', 'Recorrido 1%', DATE '2027-04-01')) AS s(tipo, nombre, desde)
    JOIN conceptos c ON c.tipo = s.tipo AND c.nombre LIKE s.nombre AND c.activo
   WHERE NOT EXISTS (SELECT 1 FROM inscripciones_servicio i
                      WHERE i.alumno_id = v_alumno AND i.concepto_id = c.id);

  IF (SELECT COUNT(*) FROM inscripciones_servicio WHERE alumno_id = v_alumno) < 3 THEN
    RAISE EXCEPTION 'No se encontraron los tres servicios: revisar los nombres en conceptos';
  END IF;

  -- ── 7. FACTURAS DE LOS MISMOS MESES QUE SU HERMANA ──────────────────────────
  SELECT * INTO v_cuota FROM conceptos WHERE tipo = 'cuota' AND activo;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No hay una cuota vigente';
  END IF;

  WITH nuevas AS (
    INSERT INTO facturas (alumno_id, periodo, vencimiento)
    SELECT v_alumno, f.periodo, f.periodo + 9
      FROM facturas f WHERE f.alumno_id = v_hermana
    ON CONFLICT (alumno_id, periodo) DO NOTHING
    RETURNING id, periodo
  ),
  item_cuota AS (
    INSERT INTO factura_items (factura_id, concepto_id, descripcion, importe)
    SELECT n.id, v_cuota.id, v_cuota.nombre, v_cuota.importe FROM nuevas n
  )
  INSERT INTO factura_items (factura_id, concepto_id, descripcion, importe)
  SELECT n.id, c.id, c.nombre, c.importe
    FROM nuevas n
    JOIN inscripciones_servicio i ON i.alumno_id = v_alumno
    JOIN conceptos c              ON c.id = i.concepto_id
   WHERE c.activo
     AND daterange(i.desde, i.hasta, '[]')
         && daterange(n.periodo, (n.periodo + INTERVAL '1 month - 1 day')::DATE, '[]');
END;
$$;


-- ── VERIFICACIÓN: una fila con todo lo que tiene que mostrar la app ─────────
-- Esperado: 1.º A · secundario; los dos tutores de yura; Vóleibol desde 03/2027,
-- Ajedrez y Recorrido 1 desde 04/2027; facturas de marzo (cuota + Vóleibol),
-- abril y mayo (cuota + 2 deportes + recorrido), con los precios actuales.
SELECT a.nombre || ' ' || a.apellido AS alumno,
       a.legajo,
       cu.anio || '.º ' || cu.division || ' · ' || n.nombre AS curso,
       (SELECT string_agg(p.nombre || ' (' || t.relacion || ')', ', ')
          FROM alumno_tutor t JOIN profiles p ON p.id = t.tutor_id
         WHERE t.alumno_id = a.id) AS tutores,
       (SELECT string_agg(c.nombre || ' desde ' || to_char(i.desde, 'MM/YYYY'), ', '
                          ORDER BY i.desde, c.nombre)
          FROM inscripciones_servicio i JOIN conceptos c ON c.id = i.concepto_id
         WHERE i.alumno_id = a.id) AS servicios,
       (SELECT string_agg('N.º ' || f.numero || ' ' || to_char(f.periodo, 'MM/YYYY')
                          || ' $ ' || f.total || ' (' || f.estado || ')', ', '
                          ORDER BY f.periodo)
          FROM facturas_estado f WHERE f.alumno_id = a.id) AS facturas
  FROM alumnos a
  JOIN matriculas m ON m.alumno_id = a.id AND m.estado = 'activa'
  JOIN cursos cu    ON cu.id = m.curso_id
  JOIN niveles n    ON n.id = cu.nivel_id
 WHERE a.dni = '50246813';


-- ============================================================================
-- PARA DESHACERLO (solo si se pide; ejecutar el bloque completo)
-- Las facturas se borran primero porque alumnos → facturas es ON DELETE RESTRICT.
-- Si en la demostración se pagó alguna factura de Lucas, borrar antes sus
-- comprobantes (y el archivo en el bucket "comprobantes").
-- ============================================================================
-- DELETE FROM facturas WHERE alumno_id = (SELECT id FROM alumnos WHERE dni = '50246813');
-- DELETE FROM alumnos  WHERE dni = '50246813';
