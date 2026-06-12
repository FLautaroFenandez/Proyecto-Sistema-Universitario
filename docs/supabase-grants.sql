-- ============================================================
-- GRANTS — Centro Educativo "Educar para Transformar"
-- Ejecutar en: Supabase → SQL Editor → New query → Run
--
-- Qué hace:
--   Otorga permisos de acceso a los roles 'anon' y 'authenticated'
--   sobre todas las tablas públicas. Sin esto, las tablas creadas
--   via SQL Editor no son accesibles desde el frontend.
--
-- Cuándo ejecutar:
--   Una sola vez, después de correr supabase-schema.sql
-- ============================================================

-- Permiso de uso del schema público
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Lectura pública (anon): solo las tablas que el sitio muestra sin login
GRANT SELECT ON noticias          TO anon;
GRANT SELECT ON opiniones         TO anon;
GRANT SELECT ON galeria           TO anon;
GRANT SELECT ON galeria_categorias TO anon;
GRANT SELECT ON empleos           TO anon;

-- Escritura pública (anon): formularios sin login
GRANT INSERT ON opiniones         TO anon;
GRANT INSERT ON inscripciones     TO anon;
GRANT INSERT ON contacto_mensajes TO anon;

-- Acceso completo para usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Secuencias (necesario para SERIAL como galeria_categorias.id)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verificación: mostrar los grants actuales sobre las tablas clave
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;
