-- ============================================================================
-- PARTE 3 — MODELO DE COBRANZA
-- Centro Educativo "Educar para Transformar" · Metodología de Sistemas II
--
-- Cubre:
--   REQ-24 · Consulta de cuotas: pendientes, pagadas, vencimiento, importe y estado
--   REQ-25 · Selección de los ítems a pagar y emisión del comprobante de pago
--   REQ-26 · Carga del comprobante de transferencia (una factura admite varios)
--   REQ-27 · Historial de facturas y comprobantes por alumno
--   REQ-28 · Historial de deuda discriminado por ítem
--
-- Diseño y decisiones: docs/06-parte-3-app-movil/01-modelo-cobranza/README.md
--
-- Se ejecuta DESPUÉS de supabase-gestion.sql, supabase-sprint2.sql y
-- supabase-sprint3.sql: reutiliza alumnos, matriculas, ciclos_lectivos,
-- tiene_rol(), alumnos_a_cargo() y registrar_auditoria().
-- Es idempotente: se puede volver a correr sin perder datos.
--
-- INSTRUCCIONES: Supabase → SQL Editor → New query → pegar → Run
-- ============================================================================


-- ── PASO 1: TABLAS ──────────────────────────────────────────────────────────

-- Catálogo de lo que se cobra. Regla del enunciado: "cada recorrido y deporte
-- tienen valores diferenciados" → un concepto por fila, con su propio importe.
CREATE TABLE IF NOT EXISTS conceptos (
  id          SERIAL         PRIMARY KEY,
  tipo        VARCHAR(12)    NOT NULL
                             CHECK (tipo IN ('cuota','comedor','deporte','transporte')),
  nombre      VARCHAR(60)    NOT NULL,
  importe     NUMERIC(12,2)  NOT NULL CHECK (importe > 0),
  activo      BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CONSTRAINT concepto_unico UNIQUE (tipo, nombre)
);

-- Decisión validada: una sola cuota para todos los niveles y un solo comedor.
-- El índice parcial impide que haya dos vigentes a la vez.
CREATE UNIQUE INDEX IF NOT EXISTS uq_concepto_unico_vigente
  ON conceptos (tipo) WHERE activo AND tipo IN ('cuota','comedor');

-- A qué servicios está anotado cada alumno. Regla del enunciado: "el servicio
-- de transporte es opcional, por lo que puede variar de un mes a otro" → la
-- inscripción tiene período; `hasta` vacío significa que sigue vigente.
CREATE TABLE IF NOT EXISTS inscripciones_servicio (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id    UUID         NOT NULL REFERENCES alumnos(id)   ON DELETE CASCADE,
  concepto_id  INTEGER      NOT NULL REFERENCES conceptos(id) ON DELETE RESTRICT,
  desde        DATE         NOT NULL,
  hasta        DATE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT inscripcion_fechas_coherentes CHECK (hasta IS NULL OR hasta >= desde)
);

-- Una factura por alumno y por mes. `periodo` es siempre el primer día del mes.
-- El total y el estado NO se guardan: los calcula la vista facturas_estado.
CREATE TABLE IF NOT EXISTS facturas (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  numero       SERIAL       UNIQUE,
  alumno_id    UUID         NOT NULL REFERENCES alumnos(id) ON DELETE RESTRICT,
  periodo      DATE         NOT NULL,
  vencimiento  DATE         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT factura_periodo_es_mes CHECK (EXTRACT(DAY FROM periodo) = 1),
  CONSTRAINT factura_una_por_mes    UNIQUE (alumno_id, periodo)
);

-- Cada pago de una factura. Cubre los dos momentos del enunciado: el sistema
-- lo EMITE con los ítems elegidos y después el padre INFORMA la transferencia.
-- Regla: "una factura puede tener más de un comprobante" → relación 1 a N.
-- Regla: "no se realizan pagos en efectivo" → informado exige el archivo.
CREATE TABLE IF NOT EXISTS comprobantes (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  numero        SERIAL         UNIQUE,
  factura_id    UUID           NOT NULL REFERENCES facturas(id) ON DELETE RESTRICT,
  importe       NUMERIC(12,2)  NOT NULL CHECK (importe > 0),
  estado        VARCHAR(12)    NOT NULL DEFAULT 'emitido'
                               CHECK (estado IN ('emitido','informado')),
  archivo_path  TEXT,
  emitido_por   UUID           REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  informado_at  TIMESTAMPTZ,
  CONSTRAINT comprobante_informado_con_archivo
    CHECK (estado = 'emitido' OR (archivo_path IS NOT NULL AND informado_at IS NOT NULL))
);

-- Un renglón por concepto cobrado. Permite elegir qué pagar y ver la deuda por
-- ítem. El importe se COPIA del concepto al facturar: si el administrador
-- cambia un precio, las facturas ya emitidas no se modifican.
-- Decisión validada: cada ítem se paga completo, con un único comprobante.
CREATE TABLE IF NOT EXISTS factura_items (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id      UUID           NOT NULL REFERENCES facturas(id)  ON DELETE CASCADE,
  concepto_id     INTEGER        NOT NULL REFERENCES conceptos(id) ON DELETE RESTRICT,
  descripcion     VARCHAR(120)   NOT NULL,
  importe         NUMERIC(12,2)  NOT NULL CHECK (importe > 0),
  comprobante_id  UUID           REFERENCES comprobantes(id) ON DELETE SET NULL,
  CONSTRAINT item_concepto_una_vez UNIQUE (factura_id, concepto_id)
);


-- ── PASO 2: REGLAS DE INSCRIPCIÓN A SERVICIOS ───────────────────────────────
-- Reglas del enunciado: "cada alumno puede inscribirse a dos deportes
-- simultáneamente", "al servicio de transporte por recorrido" y "el sistema
-- debe evitar registros duplicados de inscripciones".
-- Se comparan los períodos que se superponen: dos inscripciones solo chocan si
-- comparten algún día. daterange(desde, NULL) es un período abierto.

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
BEGIN
  SELECT tipo, nombre INTO v_tipo, v_nombre FROM conceptos WHERE id = NEW.concepto_id;

  IF v_tipo = 'cuota' THEN
    RAISE EXCEPTION 'La cuota no requiere inscripción: se cobra a todo alumno matriculado';
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

  -- Cuántos servicios del mismo tipo tiene en un período que se superpone.
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
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_inscripcion_servicio ON inscripciones_servicio;
CREATE TRIGGER trg_validar_inscripcion_servicio
  BEFORE INSERT OR UPDATE ON inscripciones_servicio
  FOR EACH ROW EXECUTE FUNCTION public.validar_inscripcion_servicio();


-- ── PASO 3: GENERAR LAS FACTURAS DEL MES ────────────────────────────────────
-- Una factura por cada alumno con matrícula activa en el ciclo lectivo del mes,
-- con un ítem por la cuota y uno por cada servicio vigente en ese mes.
-- Decisión validada: vence el día 10 (el día 20 es el aviso de deuda).
-- Si una factura ya existe, no se toca: correrla dos veces no duplica nada.
--
-- Quién puede ejecutarla: el administrador desde la web, o la propia base
-- (SQL Editor o una tarea programada), donde no hay usuario logueado.

CREATE OR REPLACE FUNCTION public.generar_facturas(p_periodo DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo  DATE := date_trunc('month', p_periodo)::DATE;
  v_fin_mes  DATE := (date_trunc('month', p_periodo) + INTERVAL '1 month - 1 day')::DATE;
  v_ciclo    INTEGER;
  v_cuota    conceptos%ROWTYPE;
  v_creadas  INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT tiene_rol('admin') THEN
    RAISE EXCEPTION 'Solo la Administración puede generar las facturas';
  END IF;

  SELECT id INTO v_ciclo
    FROM ciclos_lectivos
   WHERE v_periodo BETWEEN date_trunc('month', fecha_inicio)::DATE AND fecha_fin;
  IF v_ciclo IS NULL THEN
    RAISE EXCEPTION 'El período % no corresponde a ningún ciclo lectivo',
      to_char(v_periodo, 'MM/YYYY');
  END IF;

  SELECT * INTO v_cuota FROM conceptos WHERE tipo = 'cuota' AND activo;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No hay una cuota vigente: el administrador tiene que fijar su importe';
  END IF;

  -- Las tres inserciones forman una sola sentencia: o se crean las facturas con
  -- todos sus ítems, o no se crea nada.
  WITH nuevas AS (
    INSERT INTO facturas (alumno_id, periodo, vencimiento)
    SELECT m.alumno_id, v_periodo, v_periodo + 9
      FROM matriculas m
     WHERE m.ciclo_id = v_ciclo
       AND m.estado = 'activa'
    ON CONFLICT (alumno_id, periodo) DO NOTHING
    RETURNING id, alumno_id
  ),
  item_cuota AS (
    INSERT INTO factura_items (factura_id, concepto_id, descripcion, importe)
    SELECT n.id, v_cuota.id, v_cuota.nombre, v_cuota.importe
      FROM nuevas n
  ),
  items_servicios AS (
    INSERT INTO factura_items (factura_id, concepto_id, descripcion, importe)
    SELECT n.id, c.id, c.nombre, c.importe
      FROM nuevas n
      JOIN inscripciones_servicio i ON i.alumno_id = n.alumno_id
      JOIN conceptos c              ON c.id = i.concepto_id
     WHERE c.activo
       AND daterange(i.desde, i.hasta, '[]') && daterange(v_periodo, v_fin_mes, '[]')
  )
  SELECT COUNT(*) INTO v_creadas FROM nuevas;

  RETURN v_creadas;
END;
$$;


-- ── PASO 4: PAGAR (las dos únicas escrituras que hace la familia) ───────────
-- El padre no tiene permiso para escribir en las tablas de cobranza. Solo
-- puede llamar a estas dos funciones, que validan todo y hacen el cambio
-- completo en una sola transacción: un pago nunca queda a medias.

-- 4.a) El padre elige los ítems y el sistema emite el comprobante de pago.
CREATE OR REPLACE FUNCTION public.emitir_comprobante(p_factura UUID, p_items UUID[])
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alumno       UUID;
  v_pedidos      INTEGER;
  v_libres       INTEGER;
  v_importe      NUMERIC(12,2);
  v_comprobante  UUID;
BEGIN
  SELECT alumno_id INTO v_alumno FROM facturas WHERE id = p_factura;
  IF v_alumno IS NULL
     OR NOT (v_alumno IN (SELECT * FROM alumnos_a_cargo()) OR tiene_rol('admin')) THEN
    RAISE EXCEPTION 'La factura no existe o no corresponde a un alumno a su cargo';
  END IF;

  SELECT COUNT(DISTINCT x) INTO v_pedidos FROM unnest(p_items) AS x;
  IF v_pedidos = 0 THEN
    RAISE EXCEPTION 'Hay que elegir al menos un ítem para pagar';
  END IF;

  -- FOR UPDATE bloquea los ítems elegidos: si dos pagos llegan a la vez, el
  -- segundo espera al primero y después los encuentra ya tomados.
  SELECT COUNT(*), SUM(importe) INTO v_libres, v_importe
    FROM (
      SELECT importe
        FROM factura_items
       WHERE factura_id = p_factura
         AND id = ANY(p_items)
         AND comprobante_id IS NULL
         FOR UPDATE
    ) AS elegidos;

  IF v_libres <> v_pedidos THEN
    RAISE EXCEPTION 'Algún ítem elegido no es de esta factura o ya tiene un pago';
  END IF;

  INSERT INTO comprobantes (factura_id, importe, emitido_por)
  VALUES (p_factura, v_importe, auth.uid())
  RETURNING id INTO v_comprobante;

  UPDATE factura_items
     SET comprobante_id = v_comprobante
   WHERE factura_id = p_factura
     AND id = ANY(p_items);

  RETURN v_comprobante;
END;
$$;

-- 4.b) El padre sube la transferencia a Storage y la informa.
-- Se exige que el archivo exista y esté en la carpeta del alumno de esa factura.
CREATE OR REPLACE FUNCTION public.informar_transferencia(p_comprobante UUID, p_archivo TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alumno  UUID;
  v_estado  TEXT;
BEGIN
  SELECT f.alumno_id, c.estado INTO v_alumno, v_estado
    FROM comprobantes c
    JOIN facturas f ON f.id = c.factura_id
   WHERE c.id = p_comprobante
     FOR UPDATE OF c;

  IF v_alumno IS NULL
     OR NOT (v_alumno IN (SELECT * FROM alumnos_a_cargo()) OR tiene_rol('admin')) THEN
    RAISE EXCEPTION 'El comprobante no existe o no corresponde a un alumno a su cargo';
  END IF;

  IF v_estado <> 'emitido' THEN
    RAISE EXCEPTION 'Este comprobante ya tiene la transferencia informada';
  END IF;

  IF p_archivo IS NULL OR split_part(p_archivo, '/', 1) <> v_alumno::TEXT THEN
    RAISE EXCEPTION 'El archivo de la transferencia no corresponde a este alumno';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.objects WHERE bucket_id = 'comprobantes' AND name = p_archivo
  ) THEN
    RAISE EXCEPTION 'No se encontró el archivo de la transferencia: hay que volver a subirlo';
  END IF;

  UPDATE comprobantes
     SET estado = 'informado', archivo_path = p_archivo, informado_at = NOW()
   WHERE id = p_comprobante;
END;
$$;


-- ── PASO 5: ESTADO DE CADA FACTURA (VISTA) ──────────────────────────────────
-- Total, pagado y saldo se calculan a partir de los ítems: no hay un dato
-- guardado que pueda quedar desactualizado. La web y la app leen esta vista.
--   pagado     → ítems cuyo comprobante está informado
--   en_proceso → ítems con comprobante emitido que todavía espera la transferencia
-- security_invoker = true: la vista respeta el RLS de quien consulta, así que
-- un padre solo ve las facturas de sus hijos.

CREATE OR REPLACE VIEW facturas_estado
WITH (security_invoker = true) AS
SELECT f.id,
       f.numero,
       f.alumno_id,
       f.periodo,
       f.vencimiento,
       f.created_at,
       t.total,
       t.pagado,
       t.en_proceso,
       t.total - t.pagado AS saldo,
       CASE
         WHEN t.total - t.pagado = 0 THEN 'pagada'
         WHEN t.pagado > 0           THEN 'parcial'
         ELSE 'pendiente'
       END AS estado,
       (t.total - t.pagado > 0 AND CURRENT_DATE > f.vencimiento) AS vencida
  FROM facturas f
  CROSS JOIN LATERAL (
    SELECT COALESCE(SUM(i.importe), 0)                                          AS total,
           COALESCE(SUM(i.importe) FILTER (WHERE c.estado = 'informado'), 0)    AS pagado,
           COALESCE(SUM(i.importe) FILTER (WHERE c.estado = 'emitido'), 0)      AS en_proceso
      FROM factura_items i
      LEFT JOIN comprobantes c ON c.id = i.comprobante_id
     WHERE i.factura_id = f.id
  ) AS t;


-- ── PASO 6: AUDITORÍA Y FECHAS DE MODIFICACIÓN ──────────────────────────────
-- Los cambios de precio y los pagos son acciones críticas (REQ-22): se
-- registran con el mismo disparador genérico de la Parte 2.

DROP TRIGGER IF EXISTS trg_auditoria_conceptos    ON conceptos;
DROP TRIGGER IF EXISTS trg_auditoria_comprobantes ON comprobantes;
DROP TRIGGER IF EXISTS trg_conceptos_updated      ON conceptos;

CREATE TRIGGER trg_auditoria_conceptos
  AFTER INSERT OR UPDATE OR DELETE ON conceptos
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_auditoria_comprobantes
  AFTER INSERT OR UPDATE ON comprobantes
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_conceptos_updated
  BEFORE UPDATE ON conceptos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── PASO 7: ÍNDICES ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_insc_servicio_alumno      ON inscripciones_servicio(alumno_id);
CREATE INDEX IF NOT EXISTS idx_facturas_alumno           ON facturas(alumno_id, periodo DESC);
CREATE INDEX IF NOT EXISTS idx_factura_items_factura     ON factura_items(factura_id);
CREATE INDEX IF NOT EXISTS idx_factura_items_comprobante ON factura_items(comprobante_id);
CREATE INDEX IF NOT EXISTS idx_comprobantes_factura      ON comprobantes(factura_id);


-- ── PASO 8: ROW LEVEL SECURITY ──────────────────────────────────────────────
-- Lectura: la familia ve solo lo de sus hijos; Administración y Autoridad, todo.
-- Escritura: solo el rol admin. La familia paga únicamente a través del PASO 4.

ALTER TABLE conceptos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes           ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conceptos_lectura         ON conceptos;
DROP POLICY IF EXISTS conceptos_admin           ON conceptos;
DROP POLICY IF EXISTS insc_servicio_lectura     ON inscripciones_servicio;
DROP POLICY IF EXISTS insc_servicio_admin       ON inscripciones_servicio;
DROP POLICY IF EXISTS facturas_lectura          ON facturas;
DROP POLICY IF EXISTS facturas_admin            ON facturas;
DROP POLICY IF EXISTS factura_items_lectura     ON factura_items;
DROP POLICY IF EXISTS factura_items_admin       ON factura_items;
DROP POLICY IF EXISTS comprobantes_lectura      ON comprobantes;
DROP POLICY IF EXISTS comprobantes_admin        ON comprobantes;

-- Precios: los lee cualquier usuario autenticado; los fija solo el administrador.
-- Regla del enunciado: "los administradores solamente pueden especificar el
-- valor de la cuota, deportes y servicios de transporte y comedor".
CREATE POLICY conceptos_lectura ON conceptos FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY conceptos_admin   ON conceptos FOR ALL
  USING (tiene_rol('admin')) WITH CHECK (tiene_rol('admin'));

CREATE POLICY insc_servicio_lectura ON inscripciones_servicio FOR SELECT
  USING (tiene_rol('admin','autoridad') OR alumno_id IN (SELECT * FROM alumnos_a_cargo()));
CREATE POLICY insc_servicio_admin   ON inscripciones_servicio FOR ALL
  USING (tiene_rol('admin')) WITH CHECK (tiene_rol('admin'));

CREATE POLICY facturas_lectura ON facturas FOR SELECT
  USING (tiene_rol('admin','autoridad') OR alumno_id IN (SELECT * FROM alumnos_a_cargo()));
CREATE POLICY facturas_admin   ON facturas FOR ALL
  USING (tiene_rol('admin')) WITH CHECK (tiene_rol('admin'));

CREATE POLICY factura_items_lectura ON factura_items FOR SELECT
  USING (
    tiene_rol('admin','autoridad')
    OR factura_id IN (SELECT id FROM facturas WHERE alumno_id IN (SELECT * FROM alumnos_a_cargo()))
  );
CREATE POLICY factura_items_admin   ON factura_items FOR ALL
  USING (tiene_rol('admin')) WITH CHECK (tiene_rol('admin'));

CREATE POLICY comprobantes_lectura ON comprobantes FOR SELECT
  USING (
    tiene_rol('admin','autoridad')
    OR factura_id IN (SELECT id FROM facturas WHERE alumno_id IN (SELECT * FROM alumnos_a_cargo()))
  );
CREATE POLICY comprobantes_admin   ON comprobantes FOR ALL
  USING (tiene_rol('admin')) WITH CHECK (tiene_rol('admin'));


-- ── PASO 9: ARCHIVOS DE LAS TRANSFERENCIAS (STORAGE) ────────────────────────
-- Bucket PRIVADO: los archivos no tienen enlace público. Hasta 5 MB, solo
-- imágenes JPG o PNG y PDF. Cada archivo va en la carpeta de su alumno:
--   comprobantes/<alumno_id>/<comprobante_id>-<marca de tiempo>.<extensión>
-- La familia sube y ve solo en las carpetas de sus hijos; no puede borrar ni
-- reemplazar archivos (no hay políticas de UPDATE ni de DELETE).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('comprobantes', 'comprobantes', FALSE, 5242880,
        ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET public             = FALSE,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "comprobantes_familia_subir" ON storage.objects;
DROP POLICY IF EXISTS "comprobantes_lectura"       ON storage.objects;

CREATE POLICY "comprobantes_familia_subir" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'comprobantes'
    AND (storage.foldername(name))[1] IN (SELECT a::TEXT FROM public.alumnos_a_cargo() AS a)
  );

CREATE POLICY "comprobantes_lectura" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'comprobantes'
    AND (
      public.tiene_rol('admin', 'autoridad')
      OR (storage.foldername(name))[1] IN (SELECT a::TEXT FROM public.alumnos_a_cargo() AS a)
    )
  );


-- ── PASO 10: PERMISOS ───────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE
   ON conceptos, inscripciones_servicio, facturas, factura_items, comprobantes
   TO authenticated;
GRANT SELECT ON facturas_estado TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Las funciones del PASO 3 y del PASO 4 no se pueden llamar sin iniciar sesión.
REVOKE ALL ON FUNCTION public.generar_facturas(DATE)               FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.emitir_comprobante(UUID, UUID[])     FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.informar_transferencia(UUID, TEXT)   FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generar_facturas(DATE)            TO authenticated;
GRANT EXECUTE ON FUNCTION public.emitir_comprobante(UUID, UUID[])  TO authenticated;
GRANT EXECUTE ON FUNCTION public.informar_transferencia(UUID, TEXT) TO authenticated;


-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- 1) Las cinco tablas y la vista existen (tiene que devolver 6 filas):
--    SELECT table_name, table_type FROM information_schema.tables
--     WHERE table_schema = 'public'
--       AND table_name IN ('conceptos','inscripciones_servicio','facturas',
--                          'factura_items','comprobantes','facturas_estado')
--     ORDER BY table_name;
--
-- 2) El bucket existe y es privado (public = false):
--    SELECT id, public, file_size_limit, allowed_mime_types
--      FROM storage.buckets WHERE id = 'comprobantes';
