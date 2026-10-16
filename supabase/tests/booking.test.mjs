import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'node:fs';
const R = fileURLToPath(new URL('../', import.meta.url));
const db = new PGlite({ extensions: { btree_gist, pgcrypto } });
await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users (id uuid primary key default gen_random_uuid(), raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql as $$ select null::uuid $$;`);
for (const f of ['migrations/20261015000000_init_core.sql', 'seed.sql', 'migrations/20261016000000_booking.sql']) await db.exec(fs.readFileSync(R + f, 'utf8'));
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
await db.exec('set role anon');
ok((await db.query('select * from get_available_slots($1,$2::date)', ['decouverte', tue])).rows.length > 0, 'anon peut lire les créneaux');
let denied = false; try { await db.query('select * from bookings'); } catch { denied = true; }
ok(denied, 'anon ne peut pas lire bookings directement');
console.log(fail ? `\n${fail} ECHEC(S)` : '\nTOUT OK'); process.exit(fail ? 1 : 0);
