-- Durcissement (conseils de sécurité Supabase).
-- Le trigger d'inscription n'a pas à être appelable via l'API.
revoke all on function public.handle_new_user() from public, anon, authenticated;
-- Extension hors du schéma public.
create schema if not exists extensions;
alter extension btree_gist set schema extensions;
