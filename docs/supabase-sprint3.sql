-- ============================================================================
-- SISTEMA DE GESTIÓN — SPRINT 3 (14/10 – 27/10/2026)
-- Centro Educativo "Educar para Transformar" · Metodología de Sistemas II
--
-- Cubre:
--   HU4    · Asistencia diaria: validación y consulta del propio alumno (REQ-16)
--   HU5    · Comunicados del docente a los padres del curso (REQ-18)
--   HU6    · Legajo de personal docente y no docente (REQ-19)
--   REQ-20 · Postulaciones laborales con estados
--   REQ-22 · Auditoría de acciones críticas
--   HU3 y REQ-17 no agregan tablas: leen las que ya existen.
--
-- Se ejecuta DESPUÉS de docs/supabase-gestion.sql y docs/supabase-sprint2.sql.
-- Es idempotente: se puede volver a correr sin perder datos.
--
-- INSTRUCCIONES: Supabase → SQL Editor → New query → pegar → Run
-- ============================================================================


-- ── PASO 1: EL ESTADO DE LA CUENTA SE REFLEJA EN LOS ACCESOS (HU6) ──────────
-- Criterio de HU6: "el estado (activo/inactivo) se refleja en los accesos al
-- sistema". Todas las políticas preguntan el rol con tiene_rol(), que usa
-- rol_actual(). Si la cuenta está inactiva, no tiene rol y pierde los permisos.

CREATE OR REPLACE FUNCTION public.rol_actual()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM profiles WHERE id = auth.uid() AND activo
$$;


-- ── PASO 2: LEGAJO DE PERSONAL (HU6 · REQ-19) ───────────────────────────────
-- Cubre también el "Módulo Profesores" del enunciado: legajo, DNI, nombre,
-- apellido, especialidad, correo, teléfono y estado. Las materias y cursos a
-- cargo salen de curso_materia, a través de la cuenta vinculada (profile_id).

CREATE SEQUENCE IF NOT EXISTS seq_legajo_personal START 1;

CREATE TABLE IF NOT EXISTS personal (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  legajo        VARCHAR(12)   UNIQUE,
  dni           VARCHAR(20)   NOT NULL,
  apellido      VARCHAR(80)   NOT NULL,
  nombre        VARCHAR(80)   NOT NULL,
  email         VARCHAR(150),
  telefono      VARCHAR(30),
  funcion       VARCHAR(20)   NOT NULL
                CHECK (funcion IN ('docente','directivo','preceptor','administrativo','maestranza','otro')),
  especialidad  VARCHAR(100),
  area          VARCHAR(100),
  fecha_ingreso DATE          NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date,
  estado        VARCHAR(10)   NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo')),
  profile_id    UUID          UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- Flujo alternativo de HU6: "si el DNI ya existe, no permite duplicar el legajo".
  CONSTRAINT personal_dni_unico UNIQUE (dni)
);

-- Legajo correlativo con formato P-AAAA-NNN, generado por la base como el de alumnos.
CREATE OR REPLACE FUNCTION public.generar_legajo_personal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.legajo IS NULL OR NEW.legajo = '' THEN
    NEW.legajo := 'P-' || TO_CHAR(NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY')
               || '-' || LPAD(nextval('seq_legajo_personal')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generar_legajo_personal ON personal;
CREATE TRIGGER trg_generar_legajo_personal
  BEFORE INSERT ON personal
  FOR EACH ROW EXECUTE FUNCTION public.generar_legajo_personal();

-- Dar de baja o reactivar un legajo activa o desactiva la cuenta vinculada.
CREATE OR REPLACE FUNCTION public.sincronizar_acceso_personal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.profile_id IS NOT NULL THEN
    UPDATE profiles SET activo = (NEW.estado = 'activo')
     WHERE id = NEW.profile_id
       AND activo IS DISTINCT FROM (NEW.estado = 'activo');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sincronizar_acceso_personal ON personal;
CREATE TRIGGER trg_sincronizar_acceso_personal
  AFTER INSERT OR UPDATE OF estado, profile_id ON personal
  FOR EACH ROW EXECUTE FUNCTION public.sincronizar_acceso_personal();

DROP TRIGGER IF EXISTS trg_personal_updated ON personal;
CREATE TRIGGER trg_personal_updated BEFORE UPDATE ON personal
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── PASO 3: POSTULACIONES LABORALES (REQ-20) ────────────────────────────────
-- Hasta ahora los CV llegaban como un mensaje de contacto más. Pasan a una tabla
-- propia con estado, para seguir cada postulación hasta la decisión final.

CREATE TABLE IF NOT EXISTS postulaciones (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  empleo_id     UUID          REFERENCES empleos(id) ON DELETE SET NULL,
  nombre        VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL,
  area          VARCHAR(100),
  cv_link       TEXT,
  estado        VARCHAR(20)   NOT NULL DEFAULT 'recibida'
                CHECK (estado IN ('recibida','en_revision','entrevista','contratado','descartado')),
  observaciones TEXT,
  revisado_por  UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Patrón State en la base, igual que la solicitud de inscripción (Sprint 2).
-- La misma tabla de transiciones está en src/domain/estadoPostulacion.js.
--   recibida    → en_revision · descartado
--   en_revision → entrevista · descartado
--   entrevista  → contratado · descartado
--   descartado  → en_revision (reconsiderar)
--   contratado  → (estado final)
CREATE OR REPLACE FUNCTION public.validar_transicion_postulacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.estado = OLD.estado THEN
    RETURN NEW;
  END IF;

  IF NOT (
       (OLD.estado = 'recibida'    AND NEW.estado IN ('en_revision', 'descartado'))
    OR (OLD.estado = 'en_revision' AND NEW.estado IN ('entrevista', 'descartado'))
    OR (OLD.estado = 'entrevista'  AND NEW.estado IN ('contratado', 'descartado'))
    OR (OLD.estado = 'descartado'  AND NEW.estado IN ('en_revision'))
  ) THEN
    RAISE EXCEPTION 'Una postulación en estado "%" no puede pasar a "%"', OLD.estado, NEW.estado;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_transicion_postulacion ON postulaciones;
CREATE TRIGGER trg_transicion_postulacion
  BEFORE UPDATE OF estado ON postulaciones
  FOR EACH ROW EXECUTE FUNCTION public.validar_transicion_postulacion();

DROP TRIGGER IF EXISTS trg_postulaciones_updated ON postulaciones;
CREATE TRIGGER trg_postulaciones_updated BEFORE UPDATE ON postulaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Los CV que ya habían llegado como mensaje de contacto pasan a postulaciones.
-- La condición NOT EXISTS evita duplicarlos si el script se corre otra vez.
INSERT INTO postulaciones (nombre, email, area, cv_link, created_at)
SELECT m.nombre,
       m.email,
       SUBSTRING(m.asunto FROM 'área: ([^)]*)'),
       SUBSTRING(m.mensaje FROM 'CV: (\S+)'),
       m.created_at
  FROM contacto_mensajes m
 WHERE m.asunto LIKE 'Empleo — CV%'
   AND NOT EXISTS (
     SELECT 1 FROM postulaciones p WHERE p.email = m.email AND p.created_at = m.created_at
   );


-- ── PASO 4: COMUNICADOS A LOS PADRES DEL CURSO (HU5 · REQ-18) ───────────────

CREATE TABLE IF NOT EXISTS comunicados (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id   UUID          NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  autor_id   UUID          DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  titulo     VARCHAR(120)  NOT NULL,
  mensaje    TEXT          NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- Flujo alternativo de HU5: "si el mensaje queda vacío, no permite el envío".
  CONSTRAINT comunicado_con_titulo  CHECK (LENGTH(TRIM(titulo))  > 0),
  CONSTRAINT comunicado_con_mensaje CHECK (LENGTH(TRIM(mensaje)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_comunicados_curso ON comunicados(curso_id, created_at DESC);

-- El remitente se guarda con su nombre: las familias no pueden leer la tabla
-- profiles de los docentes, y el criterio de HU5 pide que vean quién lo envió.
ALTER TABLE comunicados ADD COLUMN IF NOT EXISTS autor_nombre VARCHAR(100);

CREATE OR REPLACE FUNCTION public.firmar_comunicado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.autor_nombre := (SELECT nombre FROM profiles WHERE id = NEW.autor_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_firmar_comunicado ON comunicados;
CREATE TRIGGER trg_firmar_comunicado
  BEFORE INSERT ON comunicados
  FOR EACH ROW EXECUTE FUNCTION public.firmar_comunicado();

-- Cursos donde el usuario dicta alguna materia (y conserva el rol docente).
CREATE OR REPLACE FUNCTION public.cursos_del_docente()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT curso_id FROM curso_materia
   WHERE docente_id = auth.uid()
     AND tiene_rol('docente')
$$;

-- Cursos de los hijos del usuario, o el propio si es el alumno.
CREATE OR REPLACE FUNCTION public.cursos_de_la_familia()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.curso_id FROM matriculas m
   WHERE m.estado = 'activa'
     AND m.alumno_id IN (SELECT * FROM alumnos_a_cargo())
  UNION
  SELECT m.curso_id FROM matriculas m JOIN alumnos a ON a.id = m.alumno_id
   WHERE m.estado = 'activa'
     AND a.profile_id = auth.uid()
$$;


-- ── PASO 5: ASISTENCIA (HU4 · REQ-16) ───────────────────────────────────────
-- La tabla existe desde el Sprint 1. Se agregan las reglas que faltaban:
-- solo alumnos con matrícula activa y nunca una fecha futura (hora argentina).

CREATE OR REPLACE FUNCTION public.validar_asistencia()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM matriculas WHERE id = NEW.matricula_id AND estado = 'activa') THEN
    RAISE EXCEPTION 'El alumno no tiene una matrícula activa';
  END IF;
  IF NEW.fecha > (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date THEN
    RAISE EXCEPTION 'No se puede registrar asistencia de una fecha futura';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_asistencia ON asistencias;
CREATE TRIGGER trg_validar_asistencia
  BEFORE INSERT OR UPDATE OF matricula_id, fecha ON asistencias
  FOR EACH ROW EXECUTE FUNCTION public.validar_asistencia();

-- La fecha de matriculación se toma en hora argentina: con CURRENT_DATE (UTC)
-- una matrícula hecha después de las 21 h quedaba con la fecha del día siguiente.
ALTER TABLE matriculas
  ALTER COLUMN fecha_matriculacion
  SET DEFAULT (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;

-- Observación de las pruebas del 21/10: el mensaje decía "(1 lugares)".
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
    RAISE EXCEPTION 'El curso alcanzó su cupo máximo de % %',
      limite, CASE WHEN limite = 1 THEN 'lugar' ELSE 'lugares' END;
  END IF;
  RETURN NEW;
END;
$$;


-- ── PASO 6: AUDITORÍA DE ACCIONES CRÍTICAS (REQ-22) ─────────────────────────
-- Un disparador genérico registra quién hizo qué y cuándo. Nadie escribe en la
-- tabla desde la aplicación: solo la base, con la función SECURITY DEFINER.

CREATE TABLE IF NOT EXISTS auditoria (
  id             BIGSERIAL     PRIMARY KEY,
  tabla          VARCHAR(40)   NOT NULL,
  accion         VARCHAR(10)   NOT NULL,
  registro_id    TEXT,
  usuario_id     UUID,
  usuario_nombre VARCHAR(100),
  usuario_rol    VARCHAR(20),
  detalle        JSONB,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla, created_at DESC);

CREATE OR REPLACE FUNCTION public.registrar_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  antes   JSONB := CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END;
  despues JSONB := CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END;
  detalle JSONB := '{}'::jsonb;
  campo   TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Solo los campos que cambiaron, con su valor anterior y el nuevo.
    FOR campo IN SELECT jsonb_object_keys(despues) LOOP
      IF campo NOT IN ('updated_at', 'created_at')
         AND despues -> campo IS DISTINCT FROM antes -> campo THEN
        detalle := detalle || jsonb_build_object(
          campo, jsonb_build_object('antes', antes -> campo, 'despues', despues -> campo));
      END IF;
    END LOOP;
    IF detalle = '{}'::jsonb THEN
      RETURN NULL;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    detalle := despues - 'created_at' - 'updated_at';
  ELSE
    detalle := antes - 'created_at' - 'updated_at';
  END IF;

  INSERT INTO auditoria (tabla, accion, registro_id, usuario_id, usuario_nombre, usuario_rol, detalle)
  SELECT TG_TABLE_NAME,
         TG_OP,
         COALESCE(despues ->> 'id', antes ->> 'id'),
         auth.uid(),
         p.nombre,
         p.rol,
         detalle
    FROM (SELECT 1) AS uno
    LEFT JOIN profiles p ON p.id = auth.uid();

  RETURN NULL;
END;
$$;

-- Altas, bajas y cambios de rol de usuarios.
DROP TRIGGER IF EXISTS trg_auditoria_profiles ON profiles;
CREATE TRIGGER trg_auditoria_profiles
  AFTER INSERT OR DELETE OR UPDATE OF rol, activo ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Matrículas: altas y bajas.
DROP TRIGGER IF EXISTS trg_auditoria_matriculas ON matriculas;
CREATE TRIGGER trg_auditoria_matriculas
  AFTER INSERT OR UPDATE OR DELETE ON matriculas
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Cambios de notas.
DROP TRIGGER IF EXISTS trg_auditoria_calificaciones ON calificaciones;
CREATE TRIGGER trg_auditoria_calificaciones
  AFTER INSERT OR UPDATE OR DELETE ON calificaciones
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Aprobación o rechazo de solicitudes de inscripción.
DROP TRIGGER IF EXISTS trg_auditoria_inscripciones ON inscripciones;
CREATE TRIGGER trg_auditoria_inscripciones
  AFTER UPDATE OF estado ON inscripciones
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Legajos de personal.
DROP TRIGGER IF EXISTS trg_auditoria_personal ON personal;
CREATE TRIGGER trg_auditoria_personal
  AFTER INSERT OR UPDATE OR DELETE ON personal
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Decisiones sobre postulaciones.
DROP TRIGGER IF EXISTS trg_auditoria_postulaciones ON postulaciones;
CREATE TRIGGER trg_auditoria_postulaciones
  AFTER UPDATE OF estado ON postulaciones
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();


-- ── PASO 7: ROW LEVEL SECURITY ──────────────────────────────────────────────
ALTER TABLE personal      ENABLE ROW LEVEL SECURITY;
ALTER TABLE postulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados   ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS personal_admin            ON personal;
DROP POLICY IF EXISTS personal_propio           ON personal;
DROP POLICY IF EXISTS postulaciones_publico     ON postulaciones;
DROP POLICY IF EXISTS postulaciones_admin       ON postulaciones;
DROP POLICY IF EXISTS comunicados_lectura       ON comunicados;
DROP POLICY IF EXISTS comunicados_docente       ON comunicados;
DROP POLICY IF EXISTS comunicados_admin         ON comunicados;
DROP POLICY IF EXISTS auditoria_lectura         ON auditoria;
DROP POLICY IF EXISTS matriculas_estudiante     ON matriculas;
DROP POLICY IF EXISTS asistencias_estudiante    ON asistencias;

-- Personal: lo gestiona Administración; cada persona ve su propio legajo.
CREATE POLICY personal_admin  ON personal FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));
CREATE POLICY personal_propio ON personal FOR SELECT
  USING (profile_id = auth.uid());

-- Postulaciones: cualquiera se postula desde la web; solo Administración las ve.
CREATE POLICY postulaciones_publico ON postulaciones FOR INSERT
  WITH CHECK (estado = 'recibida' AND revisado_por IS NULL);
CREATE POLICY postulaciones_admin   ON postulaciones FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

-- Comunicados: el docente escribe a sus cursos; la familia lee los de sus hijos.
-- No hay política de modificación para el docente: lo enviado queda registrado.
CREATE POLICY comunicados_lectura ON comunicados FOR SELECT
  USING (
    autor_id = auth.uid()
    OR tiene_rol('admin','autoridad')
    OR curso_id IN (SELECT * FROM cursos_del_docente())
    OR curso_id IN (SELECT * FROM cursos_de_la_familia())
  );
CREATE POLICY comunicados_docente ON comunicados FOR INSERT
  WITH CHECK (
    autor_id = auth.uid()
    AND curso_id IN (SELECT * FROM cursos_del_docente())
  );
CREATE POLICY comunicados_admin   ON comunicados FOR ALL
  USING (tiene_rol('admin','autoridad')) WITH CHECK (tiene_rol('admin','autoridad'));

-- Auditoría: solo lectura, y solo para Administración y Autoridad.
CREATE POLICY auditoria_lectura ON auditoria FOR SELECT
  USING (tiene_rol('admin','autoridad'));

-- El alumno con cuenta propia ve su matrícula y su asistencia (HU4, REQ-17).
CREATE POLICY matriculas_estudiante ON matriculas FOR SELECT
  USING (alumno_id IN (SELECT id FROM alumnos WHERE profile_id = auth.uid()));
CREATE POLICY asistencias_estudiante ON asistencias FOR SELECT
  USING (matricula_id IN (
    SELECT m.id FROM matriculas m JOIN alumnos a ON a.id = m.alumno_id
     WHERE a.profile_id = auth.uid()
  ));


-- ── PASO 8: PERMISOS ────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON personal    TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON comunicados TO authenticated;
GRANT SELECT                         ON auditoria   TO authenticated;
GRANT INSERT                         ON postulaciones TO anon;
GRANT SELECT, INSERT, UPDATE         ON postulaciones TO authenticated;
GRANT USAGE ON SEQUENCE seq_legajo_personal TO authenticated;


-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- 1) Las tablas nuevas existen (tiene que devolver 4 filas):
--    SELECT table_name FROM information_schema.tables
--     WHERE table_name IN ('personal', 'postulaciones', 'comunicados', 'auditoria');
--
-- 2) Los CV anteriores se migraron:
--    SELECT COUNT(*) FROM postulaciones;
--
-- 3) La auditoría registra (después de cambiar un rol desde el panel):
--    SELECT tabla, accion, usuario_nombre, detalle FROM auditoria ORDER BY id DESC LIMIT 5;
