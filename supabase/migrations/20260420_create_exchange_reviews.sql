-- Tabla para reseñas por intercambio y por habilidad.
create table if not exists public.exchange_reviews (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.skill_exchanges(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id),

  -- Calificaciones por criterio (1 a 5)
  general_rating numeric(2,1) not null check (general_rating between 1 and 5),
  mastery_rating numeric(2,1) not null check (mastery_rating between 1 and 5),
  clarity_rating numeric(2,1) not null check (clarity_rating between 1 and 5),
  punctuality_rating numeric(2,1) not null check (punctuality_rating between 1 and 5),
  attitude_rating numeric(2,1) not null check (attitude_rating between 1 and 5),
  respect_rating numeric(2,1) not null check (respect_rating between 1 and 5),

  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Evita que el usuario se reseñe a sí mismo.
  constraint exchange_reviews_reviewer_not_reviewee check (reviewer_id <> reviewee_id),

  -- Una reseña por usuario por intercambio (si quieres permitir edición, se actualiza la existente).
  constraint exchange_reviews_unique_reviewer_per_exchange unique (exchange_id, reviewer_id)
);

-- Índices para rendimiento de listados y métricas.
create index if not exists idx_exchange_reviews_reviewee_created_at
  on public.exchange_reviews (reviewee_id, created_at desc);

create index if not exists idx_exchange_reviews_reviewer_created_at
  on public.exchange_reviews (reviewer_id, created_at desc);

create index if not exists idx_exchange_reviews_skill
  on public.exchange_reviews (skill_id);

-- Trigger para updated_at.
create or replace function public.set_exchange_reviews_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_exchange_reviews_updated_at on public.exchange_reviews;
create trigger trg_set_exchange_reviews_updated_at
before update on public.exchange_reviews
for each row execute function public.set_exchange_reviews_updated_at();

-- Recomendado: activar RLS.
alter table public.exchange_reviews enable row level security;

-- Lectura: un usuario puede ver reseñas recibidas y hechas por él.
drop policy if exists "exchange_reviews_select_own" on public.exchange_reviews;
create policy "exchange_reviews_select_own"
on public.exchange_reviews
for select
using (auth.uid() = reviewee_id or auth.uid() = reviewer_id);

-- Inserción: solo el autor autenticado puede insertar su reseña.
drop policy if exists "exchange_reviews_insert_own" on public.exchange_reviews;
create policy "exchange_reviews_insert_own"
on public.exchange_reviews
for insert
with check (auth.uid() = reviewer_id);

-- Update/Delete: solo el autor de la reseña puede modificarla/eliminarla.
drop policy if exists "exchange_reviews_update_own" on public.exchange_reviews;
create policy "exchange_reviews_update_own"
on public.exchange_reviews
for update
using (auth.uid() = reviewer_id)
with check (auth.uid() = reviewer_id);

drop policy if exists "exchange_reviews_delete_own" on public.exchange_reviews;
create policy "exchange_reviews_delete_own"
on public.exchange_reviews
for delete
using (auth.uid() = reviewer_id);
