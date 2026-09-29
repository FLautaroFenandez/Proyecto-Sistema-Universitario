-- ============================================================================
-- DATOS INICIALES DEL SISTEMA DE GESTIÓN — "Educar para Transformar"
-- Metodología de Sistemas II · Sprint 1
--
-- Se ejecuta DESPUÉS de docs/supabase-gestion.sql.
--
-- Carga lo mínimo para que el módulo Administrador funcione el primer día:
-- el ciclo lectivo, los tres niveles, un curso por nivel y las materias.
-- La institución abre en marzo de 2027, así que el ciclo activo es 2027.
--
-- Es idempotente: se puede correr varias veces sin duplicar nada.
--
-- INSTRUCCIONES: Supabase → SQL Editor → New query → pegar → Run
-- ============================================================================


-- ── PASO 1: CICLO LECTIVO ───────────────────────────────────────────────────

INSERT INTO ciclos_lectivos (anio, fecha_inicio, fecha_fin, activo)
VALUES (2027, '2027-03-01', '2027-12-17', TRUE)
ON CONFLICT (anio) DO NOTHING;


-- ── PASO 2: NIVELES EDUCATIVOS ──────────────────────────────────────────────

INSERT INTO niveles (nombre, orden) VALUES
  ('inicial', 1),
  ('primario', 2),
  ('secundario', 3)
ON CONFLICT (nombre) DO NOTHING;


-- ── PASO 3: CURSOS DEL CICLO 2027 ───────────────────────────────────────────
-- Un curso por nivel y turno para arrancar. El resto se crea desde el panel,
-- en «Cursos y materias».

INSERT INTO cursos (ciclo_id, nivel_id, anio, division, turno, cupo)
SELECT c.id, n.id, v.anio, v.division, v.turno, v.cupo
  FROM ciclos_lectivos c
  CROSS JOIN LATERAL (VALUES
    ('inicial',    1::SMALLINT, 'A', 'manana', 20::SMALLINT),
    ('inicial',    1::SMALLINT, 'A', 'tarde',  20::SMALLINT),
    ('primario',   1::SMALLINT, 'A', 'manana', 25::SMALLINT),
    ('primario',   2::SMALLINT, 'A', 'manana', 25::SMALLINT),
    ('secundario', 1::SMALLINT, 'A', 'manana', 30::SMALLINT),
    ('secundario', 1::SMALLINT, 'A', 'tarde',  30::SMALLINT)
  ) AS v(nivel, anio, division, turno, cupo)
  JOIN niveles n ON n.nombre = v.nivel
 WHERE c.anio = 2027
ON CONFLICT ON CONSTRAINT curso_unico DO NOTHING;


-- ── PASO 4: MATERIAS ────────────────────────────────────────────────────────

INSERT INTO materias (nombre, codigo) VALUES
  ('Matemática',              'MAT'),
  ('Lengua y Literatura',     'LEN'),
  ('Ciencias Naturales',      'CNA'),
  ('Ciencias Sociales',       'CSO'),
  ('Inglés',                  'ING'),
  ('Educación Física',        'EFI'),
  ('Educación Artística',     'ART'),
  ('Educación Tecnológica',   'TEC'),
  ('Formación Ética y Ciudadana', 'FEC')
ON CONFLICT (codigo) DO NOTHING;


-- ── PASO 5: SOLICITUDES DE PRUEBA (OPCIONAL) ────────────────────────────────
-- Tres solicitudes ya aceptadas, para poder probar la matriculación sin
-- esperar a que llegue una real desde la web.
--
-- Para borrarlas cuando el sistema tenga datos verdaderos:
--   DELETE FROM inscripciones WHERE observaciones = 'Dato de prueba — Sprint 1';

INSERT INTO inscripciones (
  estudiante_nombre, estudiante_dni, estudiante_nacimiento, nivel, turno,
  tutor_nombre, tutor_dni, tutor_relacion, tutor_telefono, tutor_email,
  estado, observaciones
)
SELECT * FROM (VALUES
  ('Martina Gómez',  '58123456', DATE '2021-04-12', 'inicial',    'manana',
   'Laura Gómez',    '32456789', 'madre', '3624-551122', 'laura.gomez@ejemplo.com',
   'aceptada', 'Dato de prueba — Sprint 1'),
  ('Tomás Ferreyra', '55987654', DATE '2020-08-03', 'primario',   'manana',
   'Diego Ferreyra', '30112233', 'padre', '3624-667788', 'diego.ferreyra@ejemplo.com',
   'aceptada', 'Dato de prueba — Sprint 1'),
  ('Valentina Ruiz', '52334455', DATE '2015-11-27', 'secundario', 'tarde',
   'Silvia Ruiz',    '28998877', 'madre', '3624-334455', 'silvia.ruiz@ejemplo.com',
   'aceptada', 'Dato de prueba — Sprint 1')
) AS nuevas(
  estudiante_nombre, estudiante_dni, estudiante_nacimiento, nivel, turno,
  tutor_nombre, tutor_dni, tutor_relacion, tutor_telefono, tutor_email,
  estado, observaciones
)
WHERE NOT EXISTS (
  SELECT 1 FROM inscripciones i WHERE i.estudiante_dni = nuevas.estudiante_dni
);


-- ── VERIFICACIÓN ────────────────────────────────────────────────────────────
-- Debería devolver: 1 ciclo activo, 3 niveles, 6 cursos, 9 materias.

SELECT 'ciclos activos' AS que, COUNT(*) AS cantidad FROM ciclos_lectivos WHERE activo
UNION ALL SELECT 'niveles',  COUNT(*) FROM niveles
UNION ALL SELECT 'cursos',   COUNT(*) FROM cursos
UNION ALL SELECT 'materias', COUNT(*) FROM materias
UNION ALL SELECT 'solicitudes aceptadas', COUNT(*) FROM inscripciones WHERE estado = 'aceptada';
