import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'node:fs';
const R = fileURLToPath(new URL('../', import.meta.url));
const db = new PGlite({ extensions: { btree_gist, pgcrypto } });
await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users (id uuid primary key default gen_random_uuid(), raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.sub', true), '')::uuid $$;`);
for (const f of ['migrations/20261015000000_init_core.sql', 'seed.sql', 'migrations/20261016000000_booking.sql']) await db.exec(fs.readFileSync(R + f, 'utf8'));
// Comme sur Supabase : les droits de table sont accordés, c'est la RLS qui fait le tri.
await db.exec('grant usage on schema public, auth to anon, authenticated; grant all on all tables in schema public to anon, authenticated; grant select on auth.users to authenticated;');
let fail = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fail++; };
const day = (dow, minAhead = 10) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + minAhead); while (d.getUTCDay() !== dow) d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
const slots = async (slug, d) => (await db.query('select slot_start from get_available_slots($1,$2::date) order by 1', [slug, d])).rows.map(r => r.slot_start.toISOString());
const book = (slug, iso, email = 'a@b.fr') => db.query('select * from create_booking($1,$2::timestamptz,$3,$4,$5,$6)', [slug, iso, 'Lea Dupont', email, '06 12 34 56 78', null]);
const tue = day(2), mon = day(1), sat = day(6);
let s = await slots('decouverte', tue);
ok(s.length === 13 && s[0].includes('T08:30') || s[0].includes('T09:30'), `mardi: ${s.length} créneaux, premier ${s[0]}, dernier ${s.at(-1)}`);
ok((await slots('decouverte', mon)).length === 0, 'lundi fermé');
ok((await slots('decouverte', sat)).length === 0, 'samedi fermé (en attente de confirmation)');
ok((await slots('decouverte', '2020-01-01')).length === 0, 'passé refusé');
ok((await slots('inconnu', tue)).length === 0, 'service inconnu');
const first = s[0];
const b = (await book('decouverte', first)).rows[0];
ok(b.booking_ref.length === 8, `réservation créée, réf ${b.booking_ref}`);
const after = await slots('decouverte', tue);
ok(!after.includes(first) && !after.includes(s[1]) && after.includes(s[2]), 'créneaux chevauchants retirés (10h30 et 11h00), 11h30 libre');
let err; try { await book('decouverte', first, 'c@d.fr'); } catch (e) { err = e.message; }
ok(err === 'slot_unavailable', `double réservation refusée (${err})`);
err = undefined; try { await book('decouverte', '2030-01-01T09:15:00Z'); } catch (e) { err = e.message; }
ok(err === 'slot_unavailable', `créneau hors grille refusé (${err})`);
const tok = b.booking_cancel_token;
ok((await db.query('select cancel_booking($1,$2) as r', [b.booking_id, crypto.randomUUID()])).rows[0].r === false, 'annulation avec mauvais jeton refusée');
ok((await db.query('select cancel_booking($1,$2) as r', [b.booking_id, tok])).rows[0].r === true, 'annulation avec bon jeton OK');
ok((await slots('decouverte', tue)).includes(first), 'créneau libéré après annulation');
for (const i of [2, 4, 6]) await book('decouverte', s[i]);
err = undefined; try { await book('decouverte', s[8]); } catch (e) { err = e.message; }
ok(err === 'too_many_bookings', `limite par email (${err})`);
// Concurrence : deux réservations simultanées sur le même créneau
const cs = (await slots('essentielle', day(3)))[0];
const p = await Promise.allSettled([book('essentielle', cs, 'x@y.fr'), book('essentielle', cs, 'z@y.fr')]);
ok(p.filter(x => x.status === 'fulfilled').length === 1, 'concurrence: une seule des deux réussit');
await db.exec(`insert into closures (starts_on, ends_on) values ('${day(4)}','${day(4)}')`);
ok((await slots('decouverte', day(4))).length === 0, 'fermeture exceptionnelle respectée');
err = undefined; try { await db.query("select * from create_booking('decouverte',$1::timestamptz,'L','bad','x',null)", [s[10]]); } catch (e) { err = e.message; }
ok(!!err, `entrées invalides refusées (${err?.slice(0, 60)})`);
// --- RLS réelle : anon / client connecté / administratrice ---
const admin = crypto.randomUUID(), client = crypto.randomUUID();
await db.exec(`insert into auth.users (id) values ('${admin}'), ('${client}')`);
await db.exec(`insert into user_roles (user_id, role) values ('${admin}', 'admin') on conflict do nothing`);
const as = async (role, sub, sql) => {
  await db.exec(`reset role; set role ${role}; select set_config('request.jwt.sub', '${sub ?? ''}', false)`);
  const r = await db.query(sql).catch((e) => ({ error: e.message, rows: [] }));
  await db.exec('reset role');
  return r;
};
const total = (await db.query('select count(*)::int c from bookings')).rows[0].c;
ok(total > 0, `${total} réservations en base pour le test RLS`);
ok((await as('anon', null, 'select * from get_available_slots(\'decouverte\', \'' + tue + '\')')).rows.length > 0, 'anon peut lire les créneaux');
ok((await as('anon', null, 'select * from bookings')).rows.length === 0, 'anon ne voit aucune réservation');
ok((await as('authenticated', client, 'select * from bookings')).rows.length === 0, 'un client connecté ne voit pas les réservations des autres');
ok((await as('authenticated', admin, 'select * from bookings')).rows.length === total, 'l’admin voit toutes les réservations');
ok((await as('authenticated', admin, "select has_role('admin') as r")).rows[0]?.r === true, 'has_role(admin) vrai pour l’admin');
ok((await as('authenticated', client, "select has_role('admin') as r")).rows[0]?.r === false, 'has_role(admin) faux pour un client');
const cancelAll = (sub) => as('authenticated', sub, "update bookings set status = 'cancelled', cancelled_at = now() where status = 'confirmed' returning id");
ok((await cancelAll(client)).rows.length === 0, 'un client ne peut pas annuler via la table');
ok((await cancelAll(admin)).rows.length > 0, 'l’admin peut annuler via la table');
ok((await as('anon', null, "update business_hours set open_time = '00:00', close_time = '23:00' where weekday = 1 returning 1")).rows.length === 0, 'anon ne peut pas modifier les horaires');
ok((await as('authenticated', admin, "update business_hours set open_time = '10:00', close_time = '18:00' where weekday = 6 returning 1")).rows.length === 1, 'l’admin peut modifier les horaires');
ok((await as('authenticated', admin, "insert into closures (starts_on, ends_on, reason) values (current_date + 30, current_date + 32, 'test') returning 1")).rows.length === 1, 'l’admin peut ajouter une fermeture');
ok((await as('anon', null, "insert into closures (starts_on, ends_on) values (current_date, current_date) returning 1")).error !== undefined, 'anon ne peut pas ajouter de fermeture');
console.log(fail ? `\n${fail} ECHEC(S)` : '\nTOUT OK'); process.exit(fail ? 1 : 0);
