-- Journal bien-être : phrases et articles publiés par la gérante, lus par tout le monde une fois publiés.
create type public.journal_kind as enum ('phrase', 'article');

create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  kind public.journal_kind not null default 'article',
  title text check (char_length(title) between 2 and 120),
  body text not null check (char_length(body) between 2 and 8000),
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (kind = 'phrase' or title is not null)
);
create index journal_posts_published_idx on public.journal_posts (published_at desc) where published;

-- La date de publication est posée par la base : publier = maintenant ; dépublier = on l'efface.
create or replace function public.journal_set_published_at() returns trigger language plpgsql as $$
begin
  if new.published and new.published_at is null then new.published_at := now(); end if;
  if not new.published then new.published_at := null; end if;
  return new;
end $$;
create trigger journal_posts_published_at before insert or update on public.journal_posts
  for each row execute function public.journal_set_published_at();

alter table public.journal_posts enable row level security;
create policy journal_public_read on public.journal_posts for select to anon, authenticated
  using (published and published_at <= now());
create policy journal_admin_all on public.journal_posts for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));
