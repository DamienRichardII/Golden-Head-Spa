-- Golden Head Spa — schéma initial (fondations). Tables limitées aux fonctionnalités développées.
create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'staff', 'admin');
create type public.gift_card_status as enum ('pending_payment', 'active', 'redeemed', 'expired', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  primary key (user_id, role)
);

create or replace function public.has_role(_role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = _role);
$$;

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  sort_order int not null default 0
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid references public.service_categories (id),
  name text not null,
  duration_min int not null check (duration_min > 0),
  price_cents int not null check (price_cents >= 0),
  tagline text,
  description text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index services_category_idx on public.services (category_id);

create table public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  purchaser_id uuid references auth.users (id) on delete set null,
  service_id uuid references public.services (id),
  amount_cents int not null check (amount_cents between 2000 and 50000),
  recipient_name text not null,
  recipient_email text not null,
  message text check (char_length(message) <= 400),
  status public.gift_card_status not null default 'pending_payment',
  stripe_payment_intent_id text unique, -- idempotence : un paiement = une carte
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index gift_cards_purchaser_idx on public.gift_cards (purchaser_id);

create table public.corporate_leads (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text not null,
  email text not null,
  team_size int check (team_size > 0),
  message text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- RLS : activée partout, refus par défaut.
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.gift_cards enable row level security;
alter table public.corporate_leads enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.has_role('admin'));
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy roles_self_read on public.user_roles for select using (user_id = auth.uid() or public.has_role('admin'));
create policy categories_public_read on public.service_categories for select using (true);
create policy categories_admin_write on public.service_categories for all using (public.has_role('admin')) with check (public.has_role('admin'));
create policy services_public_read on public.services for select using (active and deleted_at is null);
create policy services_admin_all on public.services for all using (public.has_role('admin')) with check (public.has_role('admin'));
-- Cartes cadeaux : lecture par l'acheteur ; création/activation uniquement côté serveur (service_role, webhook Stripe).
create policy gift_cards_owner_read on public.gift_cards for select using (purchaser_id = auth.uid() or public.has_role('admin'));
-- Demandes entreprises : insertion publique via Edge Function (service_role) ; lecture admin.
create policy leads_admin_read on public.corporate_leads for select using (public.has_role('admin'));
create policy audit_admin_read on public.audit_logs for select using (public.has_role('admin'));

-- Profil + rôle client créés à l'inscription.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name');
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
