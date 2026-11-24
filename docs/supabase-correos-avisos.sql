-- ════════════════════════════════════════════════════════════════════════════
-- Parte 3 · Versión 1.1 — Envío de los avisos de cobranza por correo
-- Educar para Transformar · Metodología de Sistemas II · Grupo 4
--
-- Funcionalidades 1 y 2 del enunciado:
--   1. "Enviar por mail el último día hábil del mes un recordatorio del total que cada
--      padre debe abonar, detallando la composición de ese valor. Adjuntar la factura."
--   2. "Enviar el día 20 de cada mes a cada padre, la deuda en caso de no haber
--      realizado el pago completo."
--
-- Qué ya existía: la vista `avisos_cobranza` (supabase-inscripciones-avisos.sql) arma
-- cada aviso con su fecha de envío, importe y detalle. Este script suma lo necesario
-- para mandarlo:
--   PASO 1 · `envios_avisos`: el registro de cada correo enviado (o que falló).
--   PASO 2 · `avisos_para_enviar(fecha)`: los avisos de una fecha con el correo de cada
--            tutor. Solo la puede usar la Edge Function `enviar-avisos`.
--   PASO 3 · La clave con la que la tarea programada se identifica ante la función.
--   PASO 4 · La tarea diaria (pg_cron) que llama a la función a las 9:00.
--
-- El envío lo hace la Edge Function `supabase/functions/enviar-avisos/index.ts` con
-- el servicio de correo Resend. La factura va adjunta en PDF.
--
-- ⚠️ ANTES DE EJECUTAR: en el PASO 4, reemplazar TU-PROYECTO por el identificador del
-- proyecto (el de la URL de Supabase, https://<identificador>.supabase.co).
--
-- Idempotente: se puede ejecutar más de una vez.
-- ════════════════════════════════════════════════════════════════════════════


-- ── PASO 1: REGISTRO DE ENVÍOS ──────────────────────────────────────────────
-- Un renglón por correo. Sirve como evidencia de que el aviso salió (o del motivo por
-- el que no) y evita que la tarea programada mande dos veces el mismo aviso.

CREATE TABLE IF NOT EXISTS envios_avisos (
  id            BIGSERIAL    PRIMARY KEY,
  factura_id    UUID         NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  tipo          TEXT         NOT NULL CHECK (tipo IN ('recordatorio', 'deuda')),
  fecha_aviso   DATE         NOT NULL,
  destinatario  TEXT         NOT NULL,   -- correo del tutor
  enviado_a     TEXT         NOT NULL,   -- adonde salió de verdad (el de prueba, si hay)
  origen        TEXT         NOT NULL CHECK (origen IN ('programado', 'manual')),
  resultado     TEXT         NOT NULL CHECK (resultado IN ('enviado', 'error')),
  detalle       TEXT,                    -- id del correo en Resend, o el error
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- La tarea programada no repite un aviso que ya salió bien para el mismo tutor.
-- Los envíos manuales (simulaciones desde la web) sí se pueden repetir.
CREATE UNIQUE INDEX IF NOT EXISTS envio_programado_una_vez
  ON envios_avisos (factura_id, tipo, destinatario)
  WHERE origen = 'programado' AND resultado = 'enviado';

CREATE INDEX IF NOT EXISTS envios_avisos_recientes ON envios_avisos (created_at DESC);


-- ── PASO 2: LOS AVISOS DE UNA FECHA, CON EL CORREO DE CADA TUTOR ────────────
-- El correo de cada cuenta está en auth.users, que la aplicación no puede leer. Por
-- eso es una función SECURITY DEFINER, y solo la puede ejecutar el rol de servicio
-- que usa la Edge Function (PASO 5): ni un padre ni el navegador acceden a los correos.
-- Un aviso por tutor: si un alumno tiene dos tutores, les llega a los dos.

CREATE OR REPLACE FUNCTION public.avisos_para_enviar(p_fecha DATE)
RETURNS TABLE (
  factura_id   UUID,
  numero       INTEGER,
  tipo         TEXT,
  periodo      DATE,
  vencimiento  DATE,
  importe      NUMERIC,
  detalle      JSONB,
  total        NUMERIC,
  pagado       NUMERIC,
  saldo        NUMERIC,
  items        JSONB,
  alumno       TEXT,
  legajo       TEXT,
  tutor        TEXT,
  email        TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.factura_id,
         a.numero::INTEGER,
         a.tipo,
         a.periodo,
         a.vencimiento,
         a.importe::NUMERIC,
         a.detalle,
         e.total::NUMERIC,
         e.pagado::NUMERIC,
         e.saldo::NUMERIC,
         -- Todos los ítems con su estado, para la factura en PDF.
         (SELECT jsonb_agg(jsonb_build_object(
                   'descripcion', i.descripcion,
                   'importe', i.importe,
                   'estado', CASE c.estado WHEN 'informado' THEN 'Pagado'
                                           WHEN 'emitido'   THEN 'En proceso'
                                           ELSE 'Pendiente' END)
                   ORDER BY i.importe DESC)
            FROM factura_items i
            LEFT JOIN comprobantes c ON c.id = i.comprobante_id
           WHERE i.factura_id = a.factura_id),
         (al.nombre || ' ' || al.apellido)::TEXT,
         al.legajo::TEXT,
         p.nombre::TEXT,
         u.email::TEXT
    FROM avisos_cobranza a
    JOIN facturas_estado e ON e.id = a.factura_id
    JOIN alumnos al        ON al.id = a.alumno_id
    JOIN alumno_tutor t    ON t.alumno_id = a.alumno_id
    JOIN profiles p        ON p.id = t.tutor_id AND p.activo
    JOIN auth.users u      ON u.id = t.tutor_id
   WHERE a.fecha_envio = p_fecha
     AND u.email IS NOT NULL
   ORDER BY a.tipo DESC, a.numero;
$$;


-- ── PASO 3: CLAVE DE LA TAREA PROGRAMADA ────────────────────────────────────
-- La tarea diaria llama a la Edge Function sin una sesión de usuario. Para que nadie
-- más pueda disparar los envíos, manda esta clave, que se genera al azar y queda
-- guardada en Vault (cifrada). La función la compara con `es_clave_cron_avisos`:
-- nadie tiene que copiarla ni verla.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'avisos_clave_cron') THEN
    PERFORM vault.create_secret(
      replace(gen_random_uuid()::TEXT, '-', '') || replace(gen_random_uuid()::TEXT, '-', ''),
      'avisos_clave_cron',
      'Clave con la que la tarea programada llama a la Edge Function enviar-avisos');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.es_clave_cron_avisos(p_clave TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets
     WHERE name = 'avisos_clave_cron' AND decrypted_secret = p_clave
  );
$$;


-- ── PASO 4: TAREA DIARIA ────────────────────────────────────────────────────
-- Todos los días a las 12:00 UTC (9:00 en Argentina) llama a la Edge Function, que
-- envía los avisos cuya fecha de envío es hoy: el último día hábil, el recordatorio;
-- el día 20, la deuda. pg_cron programa la tarea y pg_net hace el pedido HTTP.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
DECLARE
  -- ⚠️ Reemplazar TU-PROYECTO por el identificador del proyecto de Supabase.
  v_url TEXT := 'https://TU-PROYECTO.supabase.co';
BEGIN
  IF v_url LIKE '%TU-PROYECTO%' THEN
    RAISE EXCEPTION 'Falta poner la URL del proyecto en el PASO 4 (reemplazar TU-PROYECTO).';
  END IF;
  IF EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'avisos_url') THEN
    PERFORM vault.update_secret(
      (SELECT id FROM vault.secrets WHERE name = 'avisos_url'), v_url);
  ELSE
    PERFORM vault.create_secret(v_url, 'avisos_url', 'URL del proyecto, para la tarea de avisos');
  END IF;
END $$;

-- cron.schedule con un nombre que ya existe reemplaza la tarea: no se duplica.
SELECT cron.schedule(
  'enviar-avisos-cobranza',
  '0 12 * * *',
  $$
  SELECT net.http_post(
    url     := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'avisos_url')
               || '/functions/v1/enviar-avisos',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-clave-cron', (SELECT decrypted_secret FROM vault.decrypted_secrets
                                   WHERE name = 'avisos_clave_cron')),
    body    := '{}'::jsonb
  );
  $$
);


-- ── PASO 5: SEGURIDAD Y PERMISOS ────────────────────────────────────────────

-- El registro lo leen la Administración y la Autoridad. Nadie escribe desde el
-- navegador: lo escribe solo la Edge Function, con el rol de servicio.
ALTER TABLE envios_avisos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS envios_avisos_lectura ON envios_avisos;
CREATE POLICY envios_avisos_lectura ON envios_avisos FOR SELECT
  USING (tiene_rol('admin', 'autoridad'));

REVOKE ALL ON envios_avisos FROM anon;
GRANT SELECT ON envios_avisos TO authenticated;

-- Las dos funciones las usa solo la Edge Function.
REVOKE ALL ON FUNCTION public.avisos_para_enviar(DATE)   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.es_clave_cron_avisos(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avisos_para_enviar(DATE)   TO service_role;
GRANT EXECUTE ON FUNCTION public.es_clave_cron_avisos(TEXT) TO service_role;
GRANT SELECT, INSERT ON envios_avisos TO service_role;
GRANT USAGE, SELECT ON SEQUENCE envios_avisos_id_seq TO service_role;


-- ── VERIFICACIÓN ────────────────────────────────────────────────────────────
-- Ejecutar de a una después del script.

-- 1. La tarea programada existe y está activa (1 fila, active = true).
-- SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'enviar-avisos-cobranza';

-- 2. Los avisos del 30/04/2027 con el correo de cada tutor (al menos 1 fila de yura).
-- SELECT tipo, numero, importe, alumno, tutor, email FROM avisos_para_enviar('2027-04-30');

-- 3. La clave y la URL quedaron guardadas (2 filas; no muestra los valores).
-- SELECT name, created_at FROM vault.secrets WHERE name IN ('avisos_clave_cron', 'avisos_url');

-- 4. Después de desplegar la Edge Function: el mismo pedido que hace la tarea diaria.
--    Hoy no hay avisos (son del ciclo 2027), así que tiene que responder 200 con
--    "origen":"programado" y "enviados":0. Primero el pedido:
-- SELECT net.http_post(
--   url     := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'avisos_url')
--              || '/functions/v1/enviar-avisos',
--   headers := jsonb_build_object('Content-Type', 'application/json',
--                'x-clave-cron', (SELECT decrypted_secret FROM vault.decrypted_secrets
--                                  WHERE name = 'avisos_clave_cron')),
--   body    := '{}'::jsonb);
--    y unos segundos después, la respuesta:
-- SELECT status_code, content FROM net._http_response ORDER BY created DESC LIMIT 1;

-- 5. Simular el envío de una fecha desde acá: el mismo pedido con la fecha en el cuerpo,
--    body := '{"fecha": "2027-04-30"}'::jsonb. Cuenta como envío manual: no marca el aviso
--    como ya enviado, así que la tarea diaria igual lo manda cuando llegue su fecha.
