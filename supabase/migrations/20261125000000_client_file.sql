-- Fiche cliente à la réservation : prénom, adresse, allergies, douleurs, grossesse, carte cadeau.
-- Allergies, douleurs et grossesse sont des données de santé (RGPD art. 9) :
--  * collectées seulement avec un consentement explicite (health_consent_at) ;
--  * lisibles uniquement par la cliente (user_id) et l'admin, via la RLS existante de bookings.
alter table public.bookings
  add column if not exists customer_first_name text check (char_length(customer_first_name) <= 80),
  add column if not exists customer_address text check (char_length(customer_address) <= 200),
  add column if not exists health_allergies text check (char_length(health_allergies) <= 300),
  add column if not exists health_pain text check (char_length(health_pain) <= 300),
  add column if not exists health_pregnant boolean,
  add column if not exists gift_card_number text check (char_length(gift_card_number) <= 40),
  add column if not exists health_consent_at timestamptz;

drop function if exists public.create_booking(text, timestamptz, text, text, text, text);

-- Erreurs applicatives : slot_unavailable, service_not_found, too_many_bookings, consent_required.
create or replace function public.create_booking(
  p_service_slug text, p_starts_at timestamptz, p_name text, p_email text, p_phone text, p_notes text default null,
  p_first_name text default null, p_address text default null, p_allergies text default null, p_pain text default null,
  p_pregnant boolean default null, p_gift_card text default null, p_health_consent boolean default false
)
returns table (booking_id uuid, booking_ref text, booking_cancel_token uuid, booking_starts_at timestamptz, booking_ends_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_service public.services;
  s public.booking_settings;
  r public.bookings;
  v_email text := lower(btrim(p_email));
  v_allergies text := nullif(btrim(p_allergies), '');
  v_pain text := nullif(btrim(p_pain), '');
  v_has_health boolean;
begin
  v_has_health := v_allergies is not null or v_pain is not null or p_pregnant is not null;
  if v_has_health and not coalesce(p_health_consent, false) then
    raise exception 'consent_required' using errcode = 'P0001';
  end if;

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
    insert into public.bookings (service_id, starts_at, ends_at, customer_name, customer_email, customer_phone, notes, user_id,
                                 customer_first_name, customer_address, health_allergies, health_pain, health_pregnant, gift_card_number, health_consent_at)
    values (v_service.id, p_starts_at, p_starts_at + make_interval(mins => v_service.duration_min),
            btrim(p_name), v_email, btrim(p_phone), nullif(btrim(p_notes), ''), auth.uid(),
            nullif(btrim(p_first_name), ''), nullif(btrim(p_address), ''), v_allergies, v_pain, p_pregnant,
            nullif(btrim(p_gift_card), ''), case when v_has_health then now() end)
    returning * into r;
  exception when exclusion_violation then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end;

  return query select r.id, r.reference, r.cancel_token, r.starts_at, r.ends_at;
end $$;

revoke all on function public.create_booking(text, timestamptz, text, text, text, text, text, text, text, text, boolean, text, boolean) from public;
grant execute on function public.create_booking(text, timestamptz, text, text, text, text, text, text, text, text, boolean, text, boolean) to anon, authenticated;
