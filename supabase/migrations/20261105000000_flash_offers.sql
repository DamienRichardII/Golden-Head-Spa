-- Offres flash réservées aux utilisateurs connectés de l'application.
create table public.flash_offers (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 80),
  description text check (char_length(description) <= 300),
  service_id uuid references public.services (id),
  discount_percent int not null check (discount_percent between 1 and 90),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  code text check (char_length(code) <= 24),
  active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index flash_offers_window_idx on public.flash_offers (starts_at, ends_at) where active;

alter table public.flash_offers enable row level security;
-- Lecture : uniquement les utilisateurs authentifiés, pour les offres actives en cours. Jamais anonyme.
create policy flash_offers_members_read on public.flash_offers for select to authenticated
  using (active and now() between starts_at and ends_at);
create policy flash_offers_admin_all on public.flash_offers for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));
