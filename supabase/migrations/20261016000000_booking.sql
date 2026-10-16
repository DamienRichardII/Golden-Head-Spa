-- Golden Head Spa — réservation intégrée (sans Planity).
-- Modèle : une seule praticienne => un seul rendez-vous à la fois (capacité 1).
-- Fuseau : tous les calculs de créneaux sont faits en Europe/Paris.
create extension if not exists btree_gist;

create type public.booking_status as enum ('confirmed', 'cancelled');

-- Horaires d'ouverture (weekday = extract(dow) : 0 dimanche … 6 samedi). open_time null => fermé.
create table public.business_hours (
  weekday smallint primary key check (weekday between 0 and 6),
  open_time time,
  close_time time,
  check ((open_time is null) = (close_time is null)),
  check (open_time is null or close_time > open_time)
);

-- Fermetures exceptionnelles (congés, jours fériés).
create table public.closures (
  id uuid primary key default gen_random_uuid(),
  starts_on date not null,
  ends_on date not null,
  reason text,
  check (ends_on >= starts_on)
);

-- Réglages (une seule ligne).
create table public.booking_settings (
  id boolean primary key default true check (id),
  slot_step_min int not null default 30 check (slot_step_min between 5 and 120),
  min_notice_hours int not null default 3 check (min_notice_hours >= 0),
  max_days_ahead int not null default 60 check (max_days_ahead between 1 and 365),
  cancel_notice_hours int not null default 24 check (cancel_notice_hours >= 0),
  max_active_per_email int not null default 3 check (max_active_per_email >= 1)
);
insert into public.booking_settings default values on conflict do nothing;

-- Horaires visibles sur Planity (mardi–vendredi 10h30–17h30). Samedi/dimanche fermés TANT QUE
-- les vrais horaires ne sont pas confirmés : à modifier par l'administration.
insert into public.business_hours (weekday, open_time, close_time) values
  (0, null, null), (1, null, null),
  (2, '10:30', '17:30'), (3, '10:30', '17:30'), (4, '10:30', '17:30'), (5, '10:30', '17:30'),
  (6, null, null)
on conflict (weekday) do nothing;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
  service_id uuid not null references public.services (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  customer_email text not null check (char_length(customer_email) <= 254 and customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  customer_phone text not null check (customer_phone ~ '^[0-9+()\s.-]{6,20}$'),
  notes text check (char_length(notes) <= 500),
  status public.booking_status not null default 'confirmed',
  cancel_token uuid not null default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  check (ends_at > starts_at),
  -- Garde-fou ultime contre la double réservation, même en cas de requêtes simultanées.
  constraint bookings_no_overlap exclude using gist (tstzrange(starts_at, ends_at) with &&) where (status = 'confirmed')
);
create index bookings_starts_idx on public.bookings (starts_at);
create index bookings_email_idx on public.bookings (customer_email);

alter table public.business_hours enable row level security;
alter table public.closures enable row level security;
alter table public.booking_settings enable row level security;
alter table public.bookings enable row level security;

create policy hours_public_read on public.business_hours for select using (true);
create policy hours_admin_write on public.business_hours for all using (public.has_role('admin')) with check (public.has_role('admin'));
create policy closures_public_read on public.closures for select using (true);
create policy closures_admin_write on public.closures for all using (public.has_role('admin')) with check (public.has_role('admin'));
create policy settings_public_read on public.booking_settings for select using (true);
create policy settings_admin_write on public.booking_settings for all using (public.has_role('admin')) with check (public.has_role('admin'));
-- Réservations : aucune écriture/lecture directe pour le public (passage obligé par les fonctions ci-dessous).
create policy bookings_owner_read on public.bookings for select using (user_id = auth.uid() or public.has_role('admin'));
create policy bookings_admin_update on public.bookings for update using (public.has_role('admin')) with check (public.has_role('admin'));

-- Créneaux libres d'un soin pour un jour donné (heure de Paris).
create or replace function public.get_available_slots(p_service_slug text, p_date date)
returns table (slot_start timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare
  v_dur int;
  s public.booking_settings;
  h public.business_hours;
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_close timestamptz;
  v_t timestamptz;
  v_end timestamptz;
begin
  select duration_min into v_dur from public.services
   where slug = p_service_slug and active and deleted_at is null;
  if v_dur is null then return; end if;

  select * into s from public.booking_settings;
  if p_date < v_today or p_date > v_today + s.max_days_ahead then return; end if;
  if exists (select 1 from public.closures c where p_date between c.starts_on and c.ends_on) then return; end if;

  select * into h from public.business_hours where weekday = extract(dow from p_date)::int;
  if h.open_time is null then return; end if;

  v_t := (p_date + h.open_time) at time zone 'Europe/Paris';
  v_close := (p_date + h.close_time) at time zone 'Europe/Paris';
  while v_t + make_interval(mins => v_dur) <= v_close loop
    v_end := v_t + make_interval(mins => v_dur);
    if v_t >= now() + make_interval(hours => s.min_notice_hours)
       and not exists (
         select 1 from public.bookings b
          where b.status = 'confirmed' and tstzrange(b.starts_at, b.ends_at) && tstzrange(v_t, v_end)
       ) then
      slot_start := v_t;
      return next;
    end if;
    v_t := v_t + make_interval(mins => s.slot_step_min);
  end loop;
end $$;

-- Création d'une réservation. Erreurs applicatives : slot_unavailable, service_not_found, too_many_bookings.
create or replace function public.create_booking(
  p_service_slug text, p_starts_at timestamptz, p_name text, p_email text, p_phone text, p_notes text default null
)
returns table (booking_id uuid, booking_ref text, booking_cancel_token uuid, booking_starts_at timestamptz, booking_ends_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_service public.services;
  s public.booking_settings;
  r public.bookings;
  v_email text := lower(btrim(p_email));
begin
  select * into v_service from public.services where slug = p_service_slug and active and deleted_at is null;
  if v_service.id is null then raise exception 'service_not_found' using errcode = 'P0002'; end if;

  select * into s from public.booking_settings;
  if (select count(*) from public.bookings
       where customer_email = v_email and status = 'confirmed' and starts_at > now()) >= s.max_active_per_email then
    raise exception 'too_many_bookings' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.get_available_slots(p_service_slug, (p_starts_at at time zone 'Europe/Paris')::date) g
     where g.slot_start = p_starts_at
  ) then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  begin
    insert into public.bookings (service_id, starts_at, ends_at, customer_name, customer_email, customer_phone, notes, user_id)
    values (v_service.id, p_starts_at, p_starts_at + make_interval(mins => v_service.duration_min),
            btrim(p_name), v_email, btrim(p_phone), nullif(btrim(p_notes), ''), auth.uid())
    returning * into r;
  exception when exclusion_violation then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end;

  return query select r.id, r.reference, r.cancel_token, r.starts_at, r.ends_at;
end $$;

-- Annulation par le client (jeton reçu à la réservation), jusqu'à N heures avant. Retourne false si impossible.
create or replace function public.cancel_booking(p_booking_id uuid, p_cancel_token uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  s public.booking_settings;
  n int;
begin
  select * into s from public.booking_settings;
  update public.bookings
     set status = 'cancelled', cancelled_at = now()
   where id = p_booking_id and cancel_token = p_cancel_token and status = 'confirmed'
     and starts_at > now() + make_interval(hours => s.cancel_notice_hours);
  get diagnostics n = row_count;
  return n > 0;
end $$;

revoke all on function public.get_available_slots(text, date) from public;
revoke all on function public.create_booking(text, timestamptz, text, text, text, text) from public;
revoke all on function public.cancel_booking(uuid, uuid) from public;
grant execute on function public.get_available_slots(text, date) to anon, authenticated;
grant execute on function public.create_booking(text, timestamptz, text, text, text, text) to anon, authenticated;
grant execute on function public.cancel_booking(uuid, uuid) to anon, authenticated;
