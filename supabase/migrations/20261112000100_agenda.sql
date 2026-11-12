-- Agenda d'administration : rendez-vous saisis à la main, déplacement, créneaux bloqués.

-- Une cliente qui réserve par téléphone n'a pas forcément d'email.
alter table public.bookings alter column customer_email drop not null;

-- Créneaux bloqués (pause, formation, absence ponctuelle) : retirés de l'offre de réservation en ligne.
create table public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text check (char_length(reason) <= 120),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index blocked_slots_range_idx on public.blocked_slots (starts_at, ends_at);
alter table public.blocked_slots enable row level security;
create policy blocked_slots_admin_all on public.blocked_slots for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- Même fonction que la migration de réservation, avec la prise en compte des créneaux bloqués.
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
       )
       and not exists (
         select 1 from public.blocked_slots bs where tstzrange(bs.starts_at, bs.ends_at) && tstzrange(v_t, v_end)
       ) then
      slot_start := v_t;
      return next;
    end if;
    v_t := v_t + make_interval(mins => s.slot_step_min);
  end loop;
end $$;

-- Rendez-vous créé par la gérante : hors horaires possible (c'est elle qui décide), jamais en chevauchement d'un autre rendez-vous.
create or replace function public.admin_create_booking(
  p_service_slug text, p_starts_at timestamptz, p_name text, p_phone text, p_email text default null, p_notes text default null
)
returns table (booking_id uuid, booking_ref text)
language plpgsql security definer set search_path = public as $$
declare
  v_service public.services;
  r public.bookings;
begin
  if not public.has_role('admin') then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into v_service from public.services where slug = p_service_slug and deleted_at is null;
  if v_service.id is null then raise exception 'service_not_found' using errcode = 'P0002'; end if;
  begin
    insert into public.bookings (service_id, starts_at, ends_at, customer_name, customer_email, customer_phone, notes, user_id)
    values (v_service.id, p_starts_at, p_starts_at + make_interval(mins => v_service.duration_min),
            btrim(p_name), nullif(lower(btrim(p_email)), ''), btrim(p_phone), nullif(btrim(p_notes), ''), null)
    returning * into r;
  exception when exclusion_violation then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end;
  return query select r.id, r.reference;
end $$;

-- Déplacement d'un rendez-vous confirmé : la durée du soin est conservée.
create or replace function public.admin_move_booking(p_booking_id uuid, p_new_starts_at timestamptz)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_dur int;
  n int;
begin
  if not public.has_role('admin') then raise exception 'forbidden' using errcode = '42501'; end if;
  select s.duration_min into v_dur from public.bookings b join public.services s on s.id = b.service_id
   where b.id = p_booking_id and b.status = 'confirmed';
  if v_dur is null then return false; end if;
  begin
    update public.bookings set starts_at = p_new_starts_at, ends_at = p_new_starts_at + make_interval(mins => v_dur)
     where id = p_booking_id and status = 'confirmed';
  exception when exclusion_violation then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end;
  get diagnostics n = row_count;
  return n > 0;
end $$;

revoke all on function public.admin_create_booking(text, timestamptz, text, text, text, text) from public, anon;
revoke all on function public.admin_move_booking(uuid, timestamptz) from public, anon;
grant execute on function public.admin_create_booking(text, timestamptz, text, text, text, text) to authenticated;
grant execute on function public.admin_move_booking(uuid, timestamptz) to authenticated;
