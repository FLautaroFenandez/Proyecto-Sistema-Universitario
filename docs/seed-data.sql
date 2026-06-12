-- ============================================================
-- DATOS DE EJEMPLO — Centro Educativo "Educar para Transformar"
-- Tablas: opiniones + noticias
--
-- INSTRUCCIONES:
-- 1. Supabase → SQL Editor → New query → pegar esto → Run
--
-- IMPORTANTE para noticias:
--   Las noticias requieren un autor_id válido (un usuario admin).
--   Si ya creaste tu usuario admin, el script lo detecta automáticamente.
--   Si la tabla profiles está vacía, las noticias se saltean con un aviso.
-- ============================================================


-- ── 1. OPINIONES (no requieren usuario) ──────────────────────
--   estado = 'aprobada' → visibles en el sitio público

INSERT INTO opiniones (autor_nombre, texto, estado) VALUES
  (
    'María González',
    'Excelente institución. Mis hijos están muy contentos, los docentes son muy comprometidos con cada alumno. Lo recomiendo sin dudas.',
    'aprobada'
  ),
  (
    'Carlos Rodríguez',
    'El nivel educativo es muy alto. Notamos un gran avance en los chicos desde que empezaron. La propuesta pedagógica es realmente diferente.',
    'aprobada'
  ),
  (
    'Laura Martínez',
    'La infraestructura es moderna y los espacios son amplios y cuidados. Se nota que le dan mucha importancia al ambiente de aprendizaje.',
    'aprobada'
  ),
  (
    'Ana López',
    'Muy contenta con las actividades de idiomas y deportes. Mi hija aprendió inglés en tiempo récord y además participa en volleyball.',
    'aprobada'
  ),
  (
    'Roberto Fernández',
    'Desde el primer día nos sentimos bienvenidos. La directora y el equipo docente están siempre disponibles para escuchar a los padres.',
    'aprobada'
  ),
  (
    'Patricia Díaz',
    'La atención de la secretaría es excelente. Cualquier trámite o consulta se resuelve rápido. Una institución muy organizada.',
    'aprobada'
  ),
  (
    'Martín Sosa',
    'Mi hijo tiene necesidades especiales y el acompañamiento que recibe es increíble. Nunca pensé encontrar tanto compromiso en una escuela.',
    'aprobada'
  ),
  (
    'Verónica Altamirano',
    'Elegimos esta institución por el proyecto de bilingüismo y no nos arrepentimos. Los resultados en los primeros meses superaron nuestras expectativas.',
    'aprobada'
  );


-- ── 2. NOTICIAS (requieren autor_id de un perfil existente) ──

DO $$
DECLARE
  v_autor UUID;
BEGIN

  -- Busca cualquier perfil con rol admin o autoridad
  SELECT id INTO v_autor
  FROM profiles
  WHERE rol IN ('admin', 'autoridad')
  LIMIT 1;

  -- Si no hay ninguno, busca cualquier perfil
  IF v_autor IS NULL THEN
    SELECT id INTO v_autor FROM profiles LIMIT 1;
  END IF;

  -- Si la tabla profiles está vacía, avisa y no inserta noticias
  IF v_autor IS NULL THEN
    RAISE NOTICE
      'AVISO: No hay perfiles en la tabla profiles. '
      'Creá primero tu usuario admin en Supabase Auth, ejecutá el INSERT de profiles '
      'del paso 8 del schema principal, y luego volvé a correr este script.';
    RETURN;
  END IF;

  -- Insertar noticias usando el autor encontrado
  INSERT INTO noticias (titulo, resumen, contenido, publica, publicada, autor_id) VALUES

  (
    'Bienvenidos al ciclo lectivo 2027',
    'El Centro Educativo Educar para Transformar abre sus puertas con entusiasmo y compromiso para el nuevo año escolar.',
    'Con gran alegría damos inicio al ciclo lectivo 2027. Este año nos encontramos con aulas renovadas, nuevos recursos didácticos y un equipo docente fortalecido, listos para acompañar a cada estudiante en su camino de aprendizaje.

Nuestro proyecto educativo continúa apostando por una formación integral: académica, deportiva y artística. Invitamos a toda la comunidad educativa a sumarse con entusiasmo a esta nueva etapa.

Desde la dirección queremos agradecer la confianza de las familias que eligieron nuestra institución. ¡Los esperamos con los brazos abiertos!',
    TRUE, TRUE, v_autor
  ),

  (
    'Inscripciones abiertas: nivel primario y secundario 2027',
    'Abrimos el período de inscripción para los niveles primario y secundario. Cupos limitados. Conocé los requisitos y fechas.',
    'Informamos a las familias interesadas que se encuentran abiertas las inscripciones para el ciclo lectivo 2027 en los niveles primario y secundario.

Los interesados deben completar el formulario de inscripción disponible en este sitio web o acercarse personalmente a la secretaría de la institución en el horario de atención (lunes a viernes de 8:00 a 12:00 y de 16:00 a 19:00).

Documentación requerida:
- DNI del/la estudiante (original y fotocopia)
- Certificado de estudios del año anterior
- DNI del tutor/a (original y fotocopia)
- 2 fotos 4x4 del/la estudiante

Los cupos son limitados. Ante cualquier consulta comunicarse al WhatsApp institucional o por correo electrónico.',
    TRUE, TRUE, v_autor
  ),

  (
    'Programa deportivo del primer trimestre',
    'Presentamos las actividades deportivas programadas para el primer trimestre: fútbol, volleyball, atletismo y natación.',
    'El área de Educación Física presenta el programa deportivo para el primer trimestre del ciclo 2027. Nuestro objetivo es fomentar el trabajo en equipo, la disciplina y el cuidado del cuerpo en cada alumno.

Actividades disponibles por nivel:

Nivel Primario:
- Fútbol (martes y jueves, 15:00–16:30)
- Atletismo (miércoles, 15:00–16:00)

Nivel Secundario:
- Volleyball (lunes y miércoles, 16:30–18:00)
- Fútbol (martes y viernes, 16:30–18:00)
- Natación (jueves, previa inscripción, transporte incluido)

Las inscripciones a cada actividad se realizan a través de la secretaría. No se requiere experiencia previa. ¡Animense a participar!',
    TRUE, TRUE, v_autor
  ),

  (
    'Inauguración de la sala de idiomas con tecnología interactiva',
    'Inauguramos nuestra nueva sala de idiomas equipada con pizarras digitales, estaciones de audio y software de aprendizaje adaptativo.',
    'Con gran orgullo anunciamos la inauguración de nuestra nueva sala de idiomas, un espacio diseñado especialmente para el aprendizaje del inglés y portugués con metodologías modernas e interactivas.

La sala cuenta con:
- 25 puestos individuales con auriculares y micrófono
- Pizarra digital interactiva de 85 pulgadas
- Software de aprendizaje adaptativo con inteligencia artificial
- Cabinas de práctica de conversación
- Biblioteca multimedia con acceso a contenido en idioma original

El programa de idiomas abarca todos los niveles de la institución. Los alumnos de secundario tienen la posibilidad de prepararse para los exámenes internacionales Cambridge y DELE a través de convenios institucionales.

¡La educación del futuro ya tiene su espacio en nuestro centro!',
    TRUE, TRUE, v_autor
  ),

  (
    'Reconocimiento a docentes destacados — Semana del Educador',
    'En el marco de la Semana del Educador, la institución reconoció públicamente a tres docentes por su dedicación y compromiso.',
    'En el marco de la celebración de la Semana del Educador, el Centro Educativo Educar para Transformar realizó una emotiva ceremonia de reconocimiento a docentes que se destacaron durante el ciclo anterior por su compromiso, creatividad e impacto positivo en sus estudiantes.

Los docentes reconocidos fueron:

- Prof. Gabriela Morales (Matemática, Secundario): por la implementación de proyectos de aprendizaje basado en problemas que elevaron significativamente el rendimiento del curso.

- Prof. Diego Castillo (Educación Física): por su labor en la integración de alumnos con necesidades especiales en las actividades deportivas.

- Prof. Silvia Aranda (Lengua y Literatura, Primario): por el proyecto de animación lectora "Leer para soñar" que involucró a toda la comunidad educativa.

Desde la dirección agradecemos a todo el cuerpo docente su dedicación diaria. Son ellos quienes hacen posible nuestra misión de educar para transformar.',
    TRUE, TRUE, v_autor
  );

  RAISE NOTICE 'Listo: se insertaron 5 noticias con autor_id = %', v_autor;

END $$;


-- ── VERIFICACIÓN ─────────────────────────────────────────────
SELECT COUNT(*) AS total_opiniones FROM opiniones WHERE estado = 'aprobada';
SELECT COUNT(*) AS total_noticias  FROM noticias  WHERE publicada = TRUE;
