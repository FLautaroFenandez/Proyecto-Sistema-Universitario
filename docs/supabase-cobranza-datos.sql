-- ============================================================================
-- PARTE 3 — DATOS DE PRUEBA DE COBRANZA
-- Centro Educativo "Educar para Transformar" · Metodología de Sistemas II
--
-- Se ejecuta DESPUÉS de docs/supabase-cobranza.sql.
-- Es idempotente: correrlo de nuevo no duplica precios, inscripciones ni facturas.
--
-- Carga:
--   1. Los importes de referencia (ficticios) de cada concepto.
--   2. Servicios para los alumnos que ya tienen tutor y matrícula activa en 2027.
--   3. Las facturas de marzo y abril de 2027.
--
-- Ojo: la base es la misma que usa el sitio publicado (ver CLAUDE.md), así que
-- estos datos también se ven ahí. Solo afectan a alumnos de prueba.
--
-- INSTRUCCIONES: Supabase → SQL Editor → New query → pegar → Run
-- ============================================================================


-- ── 1. PRECIOS ──────────────────────────────────────────────────────────────
-- En la operación real los fija el administrador desde la web.
-- Las 8 disciplinas son las del enunciado; los 4 recorridos, los que pide.
INSERT INTO conceptos (tipo, nombre, importe) VALUES
  ('cuota',      'Cuota mensual',            95000),
  ('comedor',    'Comedor',                  38000),
  ('deporte',    'Atletismo',                14000),
  ('deporte',    'Natación',                 18000),
  ('deporte',    'Fútbol',                   15000),
  ('deporte',    'Artes Marciales',          16000),
  ('deporte',    'Vóleibol',                 14000),
  ('deporte',    'Danza',                    15000),
  ('deporte',    'Básquet',                  15000),
  ('deporte',    'Ajedrez',                   9000),
  ('transporte', 'Recorrido 1 — Zona Norte', 26000),
  ('transporte', 'Recorrido 2 — Zona Sur',   26000),
  ('transporte', 'Recorrido 3 — Zona Este',  22000),
  ('transporte', 'Recorrido 4 — Zona Oeste', 22000)
ON CONFLICT (tipo, nombre) DO NOTHING;


-- ── 2. SERVICIOS DE LOS ALUMNOS DE PRUEBA ───────────────────────────────────
-- Para cada alumno con tutor y matrícula activa en 2027:
--   · Comedor y Fútbol desde marzo.
--   · Natación desde abril (segundo deporte: llega al máximo de dos).
--   · Recorrido 1 desde abril: marzo sin transporte y abril con transporte,
--     para mostrar que el servicio "puede variar de un mes a otro".
WITH alumnos_prueba AS (
  SELECT DISTINCT m.alumno_id
    FROM matriculas m
    JOIN ciclos_lectivos cl ON cl.id = m.ciclo_id AND cl.anio = 2027
    JOIN alumno_tutor t     ON t.alumno_id = m.alumno_id
   WHERE m.estado = 'activa'
),
servicios (nombre, desde) AS (
  VALUES ('Comedor',                  DATE '2027-03-01'),
         ('Fútbol',                   DATE '2027-03-01'),
         ('Natación',                 DATE '2027-04-01'),
         ('Recorrido 1 — Zona Norte', DATE '2027-04-01')
)
INSERT INTO inscripciones_servicio (alumno_id, concepto_id, desde)
SELECT a.alumno_id, c.id, s.desde
  FROM alumnos_prueba a
 CROSS JOIN servicios s
  JOIN conceptos c ON c.nombre = s.nombre
 WHERE NOT EXISTS (
   SELECT 1 FROM inscripciones_servicio i
    WHERE i.alumno_id = a.alumno_id AND i.concepto_id = c.id
 );


-- ── 3. FACTURAS DE MARZO Y ABRIL DE 2027 ────────────────────────────────────
-- Cada SELECT devuelve cuántas facturas creó. La segunda vez devuelve 0.
SELECT generar_facturas('2027-03-01') AS facturas_marzo;
SELECT generar_facturas('2027-04-01') AS facturas_abril;


-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- 1) Precios cargados (tiene que devolver 14 filas):
--    SELECT tipo, nombre, importe FROM conceptos ORDER BY tipo, nombre;
--
-- 2) Facturas con su estado: marzo = cuota + comedor + fútbol;
--    abril suma natación y el recorrido 1. Todas "pendiente" y sin vencer.
--    SELECT a.apellido, a.nombre, fe.numero, fe.periodo, fe.vencimiento,
--           fe.total, fe.saldo, fe.estado
--      FROM facturas_estado fe JOIN alumnos a ON a.id = fe.alumno_id
--     ORDER BY a.apellido, fe.periodo;
--
-- 3) Detalle de una factura (deuda por ítem):
--    SELECT f.numero, i.descripcion, i.importe
--      FROM factura_items i JOIN facturas f ON f.id = i.factura_id
--     ORDER BY f.numero, i.importe DESC;
--
-- 4) La regla de dos deportes: este INSERT tiene que FALLAR con el mensaje
--    "Un alumno puede estar inscripto a dos deportes como máximo al mismo tiempo".
--    INSERT INTO inscripciones_servicio (alumno_id, concepto_id, desde)
--    SELECT i.alumno_id, (SELECT id FROM conceptos WHERE nombre = 'Ajedrez'), DATE '2027-05-01'
--      FROM inscripciones_servicio i LIMIT 1;
