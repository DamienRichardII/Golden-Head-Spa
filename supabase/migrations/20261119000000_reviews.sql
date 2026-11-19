-- Avis des clientes : déposés après le rendez-vous, publiés seulement après validation par la gérante.
create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings (id) on delete set null,
  author_name text not null check (char_length(author_name) between 2 and 40),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 3 and 1000),
  source text not null default 'app' check (source in ('app', 'manuel')),
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
create index reviews_approved_idx on public.reviews (approved_at desc) where status = 'approved';

create or replace function public.reviews_set_approved_at() returns trigger language plpgsql as $$
begin
  if new.status = 'approved' and new.approved_at is null then new.approved_at := now(); end if;
  if new.status <> 'approved' then new.approved_at := null; end if;
  return new;
end $$;
create trigger reviews_approved_at before insert or update on public.reviews
  for each row execute function public.reviews_set_approved_at();

alter table public.reviews enable row level security;
create policy reviews_public_read on public.reviews for select to anon, authenticated using (status = 'approved');
create policy reviews_admin_all on public.reviews for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- Dépôt d'un avis : preuve = identifiant + jeton de la réservation (reçus à la réservation). Le prénom affiché est tiré de la réservation,
-- jamais saisi par le client. Uniquement après la fin du rendez-vous, une seule fois.
create or replace function public.submit_review(p_booking_id uuid, p_cancel_token uuid, p_rating int, p_comment text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  b public.bookings;
  v_parts text[];
  v_author text;
begin
  select * into b from public.bookings where id = p_booking_id and cancel_token = p_cancel_token;
  if b.id is null or b.status <> 'confirmed' or b.ends_at > now() then raise exception 'not_eligible' using errcode = 'P0001'; end if;
  if p_rating is null or p_rating not between 1 and 5 then raise exception 'invalid' using errcode = '23514'; end if;
  if exists (select 1 from public.reviews where booking_id = b.id) then raise exception 'already_reviewed' using errcode = 'P0001'; end if;
  v_parts := regexp_split_to_array(btrim(b.customer_name), '\s+');
  v_author := initcap(v_parts[1]);
  if array_length(v_parts, 1) > 1 then v_author := v_author || ' ' || upper(left(v_parts[array_length(v_parts, 1)], 1)) || '.'; end if;
  insert into public.reviews (booking_id, author_name, rating, comment) values (b.id, left(v_author, 40), p_rating, btrim(p_comment));
  return true;
end $$;
revoke all on function public.submit_review(uuid, uuid, int, text) from public;
grant execute on function public.submit_review(uuid, uuid, int, text) to anon, authenticated;
