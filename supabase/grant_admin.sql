-- Donner les droits d'administration à un compte existant (créé avant dans Supabase :
-- Authentication > Users > Add user, ou invitation par email). À exécuter dans l'éditeur SQL.
-- Remplacer l'email puis exécuter. Pour retirer les droits : delete from public.user_roles where role = 'admin' and user_id = ...
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'CHANGER@exemple.fr'
on conflict do nothing;
