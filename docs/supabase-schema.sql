-- ============================================================
-- ESQUEMA COMPLETO — Centro Educativo "Educar para Transformar"
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- ── 1. EXTENSIONES ──────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 2. TABLA PROFILES (ligada a auth.users de Supabase) ──────
create table public.profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  nombre    text not null,
  rol       text not null default 'padre'
              check (rol in ('admin','autoridad','docente','personal','padre','estudiante')),
  activo    boolean not null default true,
  created_at timestamptz default now()
);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)), 'padre');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 3. TABLA NOTICIAS ────────────────────────────────────────
create table public.noticias (
  id          uuid primary key default uuid_generate_v4(),
  titulo      text not null,
  resumen     text,
  cuerpo      text,
  imagen_url  text,
  publicada   boolean not null default false,
  publica     boolean not null default true,
  autor_id    uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── 4. TABLA GALERIA_CATEGORIAS ──────────────────────────────
create table public.galeria_categorias (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  descripcion text,
  orden       int default 0
);

insert into public.galeria_categorias (nombre, descripcion, orden) values
  ('Instalaciones', 'Edificio, aulas y espacios comunes', 1),
  ('Deportes',      'Canchas, pileta y gimnasio',         2),
  ('Idiomas',       'Clases y talleres de idiomas',       3),
  ('Arte y Música', 'Talleres de expresión artística',    4),
  ('Laboratorios',  'Ciencia y tecnología',               5),
  ('Eventos',       'Actos y celebraciones',              6);

-- ── 5. TABLA GALERIA ─────────────────────────────────────────
create table public.galeria (
  id           uuid primary key default uuid_generate_v4(),
  titulo       text,
  descripcion  text,
  imagen_url   text not null,
  categoria_id uuid references public.galeria_categorias(id),
  activa       boolean not null default true,
  created_at   timestamptz default now()
);

-- ── 6. TABLA OPINIONES ───────────────────────────────────────
create table public.opiniones (
  id            uuid primary key default uuid_generate_v4(),
  autor_nombre  text not null,
  texto         text not null,
  estado        text not null default 'pendiente'
                  check (estado in ('pendiente','aprobada','rechazada')),
  moderado_por  uuid references public.profiles(id),
  moderado_at   timestamptz,
  created_at    timestamptz default now()
);

-- ── 7. TABLA INSCRIPCIONES ───────────────────────────────────
create table public.inscripciones (
  id                uuid primary key default uuid_generate_v4(),
  estudiante_nombre text not null,
  estudiante_dni    text,
  fecha_nacimiento  date,
  nivel             text not null check (nivel in ('inicial','primario','secundario')),
  grado_solicitado  text,
  tutor_nombre      text not null,
  tutor_email       text not null,
  tutor_telefono    text,
  estado            text not null default 'pendiente'
                      check (estado in ('pendiente','en_revision','aceptada','rechazada')),
  observaciones     text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── 8. TABLA EMPLEOS ─────────────────────────────────────────
create table public.empleos (
  id           uuid primary key default uuid_generate_v4(),
  titulo       text not null,
  descripcion  text,
  requisitos   text,
  modalidad    text default 'presencial',
  activo       boolean not null default true,
  fecha_limite date,
  created_at   timestamptz default now()
);

-- ── 9. TABLA CONTACTO ────────────────────────────────────────
create table public.contacto (
  id         uuid primary key default uuid_generate_v4(),
  nombre     text not null,
  email      text not null,
  asunto     text,
  mensaje    text not null,
  leido      boolean default false,
  created_at timestamptz default now()
);

-- ── 10. ROW LEVEL SECURITY (RLS) ─────────────────────────────

-- Profiles
alter table public.profiles enable row level security;
create policy "Perfil propio" on public.profiles for select using (auth.uid() = id);
create policy "Todos los perfiles (admin)" on public.profiles for all
  using (exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','autoridad')));

-- Noticias: públicas visibles para todos; privadas solo autenticados
alter table public.noticias enable row level security;
create policy "Noticias publicas" on public.noticias for select
  using (publicada = true and publica = true);
create policy "Noticias internas (auth)" on public.noticias for select
  using (publicada = true and auth.uid() is not null);
create policy "Admin gestiona noticias" on public.noticias for all
  using (exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','autoridad')));

-- Galería
alter table public.galeria enable row level security;
create policy "Galeria publica" on public.galeria for select using (activa = true);
create policy "Admin gestiona galeria" on public.galeria for all
  using (exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','autoridad')));

alter table public.galeria_categorias enable row level security;
create policy "Categorias publicas" on public.galeria_categorias for select using (true);

-- Opiniones
alter table public.opiniones enable row level security;
create policy "Opiniones aprobadas" on public.opiniones for select using (estado = 'aprobada');
create policy "Insertar opinion (publico)" on public.opiniones for insert with check (true);
create policy "Admin gestiona opiniones" on public.opiniones for all
  using (exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','autoridad')));

-- Inscripciones
alter table public.inscripciones enable row level security;
create policy "Insertar inscripcion (publico)" on public.inscripciones for insert with check (true);
create policy "Admin gestiona inscripciones" on public.inscripciones for all
  using (exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','autoridad')));

-- Empleos
alter table public.empleos enable row level security;
create policy "Empleos activos (publico)" on public.empleos for select using (activo = true);
create policy "Admin gestiona empleos" on public.empleos for all
  using (exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','autoridad')));

-- Contacto
alter table public.contacto enable row level security;
create policy "Insertar contacto (publico)" on public.contacto for insert with check (true);
create policy "Admin ve contactos" on public.contacto for select
  using (exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','autoridad')));

-- ── 11. STORAGE BUCKET PARA IMÁGENES ────────────────────────
-- Ejecutar en Supabase → Storage → New bucket
-- Nombre: "imagenes" (público)
-- O con SQL:
insert into storage.buckets (id, name, public) values ('imagenes', 'imagenes', true)
on conflict (id) do nothing;

create policy "Imagenes publicas" on storage.objects for select
  using (bucket_id = 'imagenes');
create policy "Admin sube imagenes" on storage.objects for insert
  with check (
    bucket_id = 'imagenes' and
    exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','autoridad'))
  );
create policy "Admin elimina imagenes" on storage.objects for delete
  using (
    bucket_id = 'imagenes' and
    exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','autoridad'))
  );

-- ── 12. CREAR PRIMER USUARIO ADMIN ──────────────────────────
-- Después de correr este script:
-- 1. Registrarse en /registro con tu email
-- 2. Ir a Supabase → Table Editor → profiles
-- 3. Buscar tu fila y cambiar "rol" a "admin"
-- ============================================================
