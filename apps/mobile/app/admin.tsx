// Chargement des données au montage des onglets : usage légitime des effets (pas de bibliothèque de requêtes ici).
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, fonts, radii, space } from '@ghs/ui';
import { Body, Button, Card, Field, Notice, Screen, Title } from '../src/components/ui';
import { formatLongDate, formatTime } from '../src/lib/booking';
import { adminClient } from '../src/lib/adminClient';

type Tab = 'bookings' | 'hours' | 'closures';
interface BookingRow {
  id: string; reference: string; starts_at: string; ends_at: string; customer_name: string; customer_email: string;
  customer_phone: string; notes: string | null; status: 'confirmed' | 'cancelled'; service: { name: string } | { name: string }[] | null;
}
interface HourRow { weekday: number; open: boolean; openTime: string; closeTime: string }
interface Closure { id: string; starts_on: string; ends_on: string; reason: string | null }

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const serviceName = (s: BookingRow['service']) => (Array.isArray(s) ? s[0]?.name : s?.name) ?? 'Soin';

/** Administration : réservée aux comptes ayant le rôle `admin` (contrôlé côté base par la RLS). */
export default function Admin() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [tab, setTab] = useState<Tab>('bookings');

  const check = useCallback(async () => {
    if (!adminClient) { setReady(true); return; }
    const { data } = await adminClient.auth.getSession();
    setSignedIn(Boolean(data.session));
    if (data.session) {
      const { data: ok } = await adminClient.rpc('has_role', { _role: 'admin' });
      setIsAdmin(ok === true);
    } else setIsAdmin(false);
    setReady(true);
  }, []);
  useEffect(() => { void check(); }, [check]);

  const signIn = async () => {
    if (!adminClient) return;
    setError(undefined);
    const { error: e } = await adminClient.auth.signInWithPassword({ email: email.trim(), password });
    if (e) { setError('Identifiants incorrects.'); return; }
    setPassword('');
    await check();
  };
  const signOut = async () => { await adminClient?.auth.signOut(); setIsAdmin(false); setSignedIn(false); };

  if (!adminClient) return <Screen><Title>Administration</Title><Notice>Le service de réservation n'est pas configuré.</Notice></Screen>;
  if (!ready) return <Screen><Title>Administration</Title></Screen>;

  if (!signedIn) {
    return (
      <Screen>
        <Title>Administration</Title>
        <Body muted style={{ marginTop: 4, marginBottom: space.lg }}>Espace réservé à la gérante.</Body>
        <Field label="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={email} onChangeText={setEmail} />
        <Field label="Mot de passe" secureTextEntry autoComplete="password" value={password} onChangeText={setPassword} />
        {error && <Notice>{error}</Notice>}
        <Button label="Se connecter" onPress={signIn} disabled={!email || !password} />
      </Screen>
    );
  }

  if (!isAdmin) {
    return (
      <Screen>
        <Title>Accès refusé</Title>
        <Notice>Ce compte n'a pas les droits d'administration.</Notice>
        <Button label="Se déconnecter" variant="ghost" onPress={signOut} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title>Administration</Title>
        <Pressable onPress={signOut} accessibilityRole="button"><Text style={{ fontFamily: fonts.sansMedium, color: colors.champagneDark }}>Déconnexion</Text></Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, marginVertical: space.md }}>
        {([['bookings', 'Rendez-vous'], ['hours', 'Horaires'], ['closures', 'Fermetures']] as const).map(([key, label]) => (
          <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: tab === key }} onPress={() => setTab(key)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: tab === key ? colors.champagne : colors.beige }}>
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: tab === key ? colors.white : colors.brown }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {tab === 'bookings' && <Bookings />}
      {tab === 'hours' && <Hours />}
      {tab === 'closures' && <Closures />}
    </Screen>
  );
}

function Bookings() {
  const [rows, setRows] = useState<BookingRow[] | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [confirming, setConfirming] = useState<string | undefined>();
  const [showCancelled, setShowCancelled] = useState(false);

  const load = useCallback(async () => {
    if (!adminClient) return;
    const from = new Date(); from.setHours(0, 0, 0, 0);
    const { data, error: e } = await adminClient.from('bookings')
      .select('id,reference,starts_at,ends_at,customer_name,customer_email,customer_phone,notes,status,service:services(name)')
      .gte('starts_at', from.toISOString()).order('starts_at');
    if (e) setError('Chargement impossible.'); else { setError(undefined); setRows((data ?? []) as unknown as BookingRow[]); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const cancel = async (id: string) => {
    if (!adminClient) return;
    const { error: e } = await adminClient.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id);
    setConfirming(undefined);
    if (e) setError("Annulation impossible."); else await load();
  };

  const visible = (rows ?? []).filter((r) => showCancelled || r.status === 'confirmed');
  return (
    <View>
      {error && <Notice>{error}</Notice>}
      <Pressable onPress={() => setShowCancelled((v) => !v)} accessibilityRole="switch" accessibilityState={{ checked: showCancelled }} style={{ marginBottom: space.md }}>
        <Text style={{ fontFamily: fonts.sansMedium, color: colors.champagneDark }}>{showCancelled ? 'Masquer les annulés' : 'Afficher les annulés'}</Text>
      </Pressable>
      {rows && visible.length === 0 && <Body muted>Aucun rendez-vous à venir.</Body>}
      {visible.map((r) => (
        <Card key={r.id} style={{ marginBottom: space.sm, opacity: r.status === 'cancelled' ? 0.55 : 1 }}>
          <Text style={{ fontFamily: fonts.sansSemi, color: colors.brown, textTransform: 'capitalize' }}>{formatLongDate(r.starts_at)} · {formatTime(r.starts_at)} – {formatTime(r.ends_at)}</Text>
          <Body style={{ marginTop: 2 }}>{serviceName(r.service)} · {r.customer_name}</Body>
          <Body muted style={{ fontSize: 13 }}>{r.customer_phone} · {r.customer_email}</Body>
          {r.notes ? <Body muted style={{ fontSize: 13, marginTop: 4 }}>« {r.notes} »</Body> : null}
          <Body muted style={{ fontSize: 12, marginTop: 4 }}>Réf. {r.reference}{r.status === 'cancelled' ? ' · ANNULÉ' : ''}</Body>
          {r.status === 'confirmed' && (
            confirming === r.id
              ? <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
                  <Button label="Confirmer l'annulation" onPress={() => cancel(r.id)} style={{ flex: 1, minHeight: 44 }} />
                  <Button label="Non" variant="ghost" onPress={() => setConfirming(undefined)} style={{ minHeight: 44 }} />
                </View>
              : <Button label="Annuler" variant="ghost" onPress={() => setConfirming(r.id)} style={{ marginTop: space.sm, minHeight: 44 }} />
          )}
        </Card>
      ))}
    </View>
  );
}

function Hours() {
  const [rows, setRows] = useState<HourRow[] | undefined>();
  const [msg, setMsg] = useState<string | undefined>();

  useEffect(() => {
    void (async () => {
      if (!adminClient) return;
      const { data } = await adminClient.from('business_hours').select('weekday,open_time,close_time');
      const byDay = new Map((data ?? []).map((h: { weekday: number; open_time: string | null; close_time: string | null }) => [h.weekday, h]));
      setRows(WEEK_ORDER.map((weekday) => {
        const h = byDay.get(weekday);
        return { weekday, open: Boolean(h?.open_time), openTime: h?.open_time?.slice(0, 5) ?? '10:30', closeTime: h?.close_time?.slice(0, 5) ?? '17:30' };
      }));
    })();
  }, []);

  const patch = (weekday: number, p: Partial<HourRow>) => setRows((rs) => rs?.map((r) => (r.weekday === weekday ? { ...r, ...p } : r)));
  const save = async () => {
    if (!adminClient || !rows) return;
    for (const r of rows) {
      if (r.open && (!TIME_RE.test(r.openTime) || !TIME_RE.test(r.closeTime) || r.closeTime <= r.openTime)) {
        setMsg(`${WEEKDAYS[r.weekday]} : horaires invalides (format 10:30, fermeture après ouverture).`); return;
      }
    }
    const { error: e } = await adminClient.from('business_hours').upsert(
      rows.map((r) => ({ weekday: r.weekday, open_time: r.open ? r.openTime : null, close_time: r.open ? r.closeTime : null })));
    setMsg(e ? 'Enregistrement impossible.' : 'Horaires enregistrés. Ils s\'appliquent immédiatement aux nouvelles réservations.');
  };

  return (
    <View>
      <Body muted style={{ marginBottom: space.md }}>Un créneau ne peut commencer que si le soin se termine avant l'heure de fermeture. Les rendez-vous déjà pris ne sont pas modifiés.</Body>
      {rows?.map((r) => (
        <Card key={r.weekday} style={{ marginBottom: space.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.sansSemi, color: colors.brown }}>{WEEKDAYS[r.weekday]}</Text>
            <Pressable accessibilityRole="switch" accessibilityState={{ checked: r.open }} onPress={() => patch(r.weekday, { open: !r.open })}>
              <Text style={{ fontFamily: fonts.sansMedium, color: r.open ? colors.champagneDark : colors.muted }}>{r.open ? 'Ouvert' : 'Fermé'}</Text>
            </Pressable>
          </View>
          {r.open && (
            <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.sm }}>
              <View style={{ flex: 1 }}><Field label="Ouverture" value={r.openTime} onChangeText={(v) => patch(r.weekday, { openTime: v })} placeholder="10:30" /></View>
              <View style={{ flex: 1 }}><Field label="Fermeture" value={r.closeTime} onChangeText={(v) => patch(r.weekday, { closeTime: v })} placeholder="17:30" /></View>
            </View>
          )}
        </Card>
      ))}
      {msg && <Notice>{msg}</Notice>}
      <Button label="Enregistrer les horaires" onPress={save} />
    </View>
  );
}

function Closures() {
  const [rows, setRows] = useState<Closure[] | undefined>();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!adminClient) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await adminClient.from('closures').select('id,starts_on,ends_on,reason').gte('ends_on', today).order('starts_on');
    setRows((data ?? []) as Closure[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!adminClient) return;
    const end = to || from;
    if (!DATE_RE.test(from) || !DATE_RE.test(end) || end < from) { setMsg('Dates invalides (format AAAA-MM-JJ, fin après début).'); return; }
    const { error: e } = await adminClient.from('closures').insert({ starts_on: from, ends_on: end, reason: reason.trim() || null });
    if (e) { setMsg('Ajout impossible.'); return; }
    setMsg(undefined); setFrom(''); setTo(''); setReason(''); await load();
  };
  const remove = async (id: string) => { await adminClient?.from('closures').delete().eq('id', id); await load(); };

  return (
    <View>
      <Body muted style={{ marginBottom: space.md }}>Jours fermés exceptionnellement (congés, jours fériés) : aucun créneau n'est proposé ces jours-là.</Body>
      <Card style={{ marginBottom: space.md }}>
        <Field label="Du (AAAA-MM-JJ)" value={from} onChangeText={setFrom} placeholder="2026-12-24" autoCapitalize="none" />
        <Field label="Au (optionnel)" value={to} onChangeText={setTo} placeholder="2026-12-26" autoCapitalize="none" />
        <Field label="Motif (optionnel)" value={reason} onChangeText={setReason} />
        {msg && <Notice>{msg}</Notice>}
        <Button label="Ajouter la fermeture" onPress={add} disabled={!from} />
      </Card>
      {rows && rows.length === 0 && <Body muted>Aucune fermeture à venir.</Body>}
      {rows?.map((c) => (
        <Card key={c.id} style={{ marginBottom: space.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.sansSemi, color: colors.brown }}>{c.starts_on === c.ends_on ? c.starts_on : `${c.starts_on} → ${c.ends_on}`}</Text>
            {c.reason ? <Body muted style={{ fontSize: 13 }}>{c.reason}</Body> : null}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Supprimer la fermeture" onPress={() => remove(c.id)}><Text style={{ color: colors.danger, fontFamily: fonts.sansMedium }}>Supprimer</Text></Pressable>
        </Card>
      ))}
    </View>
  );
}
