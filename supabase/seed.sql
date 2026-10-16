-- Données DEMO / initiales issues du site public. À vérifier avant production. Ne contient aucune donnée client.
insert into public.service_categories (slug, label, sort_order) values
  ('head-spa', 'Head Spa', 1), ('massage', 'Massage', 2), ('enfant', 'Enfant', 3)
on conflict (slug) do nothing;

insert into public.services (slug, category_id, name, duration_min, price_cents, tagline, sort_order)
select v.slug, c.id, v.name, v.dur, v.price, v.tag, v.ord from (values
  ('decouverte','head-spa','La Découverte',50,8000,'Un rituel d''initiation au luxe',1),
  ('essentielle','head-spa','L''Essentielle',70,11000,'Soin complet et profond',2),
  ('excellence','head-spa','L''Excellence',90,15000,'L''expérience ultime',3),
  ('exception','head-spa','L''Exception',120,20000,'Quand le bien-être devient une expérience rare',4),
  ('kids','enfant','Head Spa Kids',45,6000,'Une bulle de réconfort',5),
  ('golden-hour','massage','Golden Hour',60,9000,'Massage relaxant aux huiles chaudes',6),
  ('signature','massage','Golden Signature',60,10000,'Massage huiles chaudes & pierres chaudes',7),
  ('relax','massage','Golden Relax',90,14000,'Massage huiles chaudes & pierres chaudes',8)
) as v(slug,cat,name,dur,price,tag,ord) join public.service_categories c on c.slug = v.cat
on conflict (slug) do nothing;
