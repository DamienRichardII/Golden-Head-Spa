-- Golden Académie : contenu de formation réservé aux élèves inscrites (jamais exposé publiquement).
create table public.academie_modules (
  id uuid primary key default gen_random_uuid(),
  position int not null unique check (position between 1 and 99),
  title text not null check (char_length(title) between 2 and 160),
  body text not null default '' check (char_length(body) <= 60000),
  video_url text check (video_url is null or video_url ~ '^https://'),
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Une ligne = une élève autorisée (e-mail en minuscules). Ajoutée par l'administratrice après inscription / paiement.
create table public.academie_access (
  email text primary key check (email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  note text check (char_length(note) <= 200),
  granted_at timestamptz not null default now()
);

-- L'e-mail du jeton est vérifié par Supabase Auth (code reçu par mail) : on s'y fie, jamais à une saisie du client.
create or replace function public.has_academie_access() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_role('admin')
    or exists (select 1 from public.academie_access a where a.email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.has_academie_access() from public, anon;
grant execute on function public.has_academie_access() to authenticated;

alter table public.academie_modules enable row level security;
alter table public.academie_access enable row level security;
create policy academie_modules_read on public.academie_modules for select to authenticated
  using (published and public.has_academie_access());
create policy academie_modules_admin on public.academie_modules for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));
create policy academie_access_self on public.academie_access for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy academie_access_admin on public.academie_access for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- Notifications : appareils inscrits (jeton Expo). Inscription/désinscription via fonctions ; lecture réservée à l'admin.
create table public.push_devices (
  token text primary key check (token ~ '^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]{10,}\]$'),
  platform text not null check (platform in ('ios', 'android')),
  topics text[] not null default array['journal'],
  created_at timestamptz not null default now()
);
alter table public.push_devices enable row level security;
create policy push_devices_admin on public.push_devices for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

create or replace function public.register_push_device(p_token text, p_platform text) returns void
language sql security definer set search_path = public as $$
  insert into public.push_devices (token, platform) values (p_token, p_platform)
  on conflict (token) do update set platform = excluded.platform;
$$;
create or replace function public.unregister_push_device(p_token text) returns void
language sql security definer set search_path = public as $$
  delete from public.push_devices where token = p_token;
$$;
revoke all on function public.register_push_device(text, text), public.unregister_push_device(text) from public;
grant execute on function public.register_push_device(text, text), public.unregister_push_device(text) to anon, authenticated;

-- Un post du journal ne peut être notifié qu'une fois : l'envoi note la date.
alter table public.journal_posts add column notified_at timestamptz;
