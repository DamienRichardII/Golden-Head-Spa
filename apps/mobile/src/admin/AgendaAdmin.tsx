// Chargement des données à chaque changement de période : usage légitime d'un effet (comme les autres onglets d'administration).
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, space } from '@ghs/ui';
import { adminBookingSchema, blockedSlotSchema } from '@ghs/validation';
import { Body, Button, Card, Field, Notice } from '../components/ui';
import { RITUALS } from '../data/rituals';
import { adminClient } from '../lib/adminClient';
import {
  addDays, blockLayout, dayLabel, floorHalfHour, minutesToHM, parisDay, parisHM, parisMinutes, parisToIso, todayParis, weekOf,
} from '../lib/agenda';

interface Appt {
  id: string; reference: string; starts_at: string; ends_at: string; customer_name: string; customer_email: string | null;
  customer_phone: string; notes: string | null; service: { name: string } | { name: string }[] | null;
}
interface Block { id: string; starts_at: string; ends_at: string; reason: string | null }
interface Hours { weekday: number; open_time: string | null; close_time: string | null }
interface Closure { starts_on: string; ends_on: string; reason: string | null }
type Sel = { kind: 'appt'; id: string } | { kind: 'block'; id: string } | undefined;
type Panel = { kind: 'create'; day: string; time: string } | { kind: 'move'; id: string; day: string; time: string } | { kind: 'block'; day: string } | undefined;

const PX = 1.1;
const DEFAULT_OPEN = 10 * 60 + 30;
const DEFAULT_CLOSE = 18 * 60 + 30;
const GUTTER = 46;
const svc = (s: Appt['service']) => (Array.isArray(s) ? s[0]?.name : s?.name) ?? 'Soin';
const shortName = (n: string) => { const [a = '', ...r] = n.trim().split(/\s+/); return r.length ? `${a} ${r[r.length - 1]?.[0] ?? ''}.` : a; };
const errText = (m?: string) =>
  m?.includes('slot_unavailable') ? 'Ce créneau chevauche un autre rendez-vous.'
  : m?.includes('forbidden') ? 'Droits insuffisants.'
  : "L'opération a échoué. Réessayez.";

/** Agenda jour / semaine : créer, déplacer, annuler un rendez-vous, bloquer un créneau. Droits imposés par la base (rôle admin). */
export function AgendaAdmin() {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [anchor, setAnchor] = useState(todayParis());
  const [appts, setAppts] = useState<Appt[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [hours, setHours] = useState<Hours[]>([]);
  const [closures, setClosures] = useState<Closure[]>([]);
  const [sel, setSel] = useState<Sel>();
  const [panel, setPanel] = useState<Panel>();
  const [msg, setMsg] = useState<string | undefined>();
  const [confirming, setConfirming] = useState(false);

  const days = useMemo(() => (view === 'week' ? weekOf(anchor) : [anchor]), [view, anchor]);
  const first = days[0] as string;
  const last = days[days.length - 1] as string;

  const load = useCallback(async () => {
    if (!adminClient) return;
    const start = parisToIso(first, '00:00');
    const end = parisToIso(addDays(last, 1), '00:00');
    const [a, b, h, c] = await Promise.all([
      adminClient.from('bookings').select('id,reference,starts_at,ends_at,customer_name,customer_email,customer_phone,notes,service:services(name)')
        .eq('status', 'confirmed').gte('starts_at', start).lt('starts_at', end).order('starts_at'),
      adminClient.from('blocked_slots').select('id,starts_at,ends_at,reason').lt('starts_at', end).gt('ends_at', start).order('starts_at'),
      adminClient.from('business_hours').select('weekday,open_time,close_time'),
      adminClient.from('closures').select('starts_on,ends_on,reason').lte('starts_on', last).gte('ends_on', first),
    ]);
    if (a.error || b.error) { setMsg("Chargement impossible (les migrations de l'agenda sont-elles appliquées ?)."); return; }
    setAppts((a.data ?? []) as unknown as Appt[]); setBlocks((b.data ?? []) as Block[]);
    setHours((h.data ?? []) as Hours[]); setClosures((c.data ?? []) as Closure[]);
  }, [first, last]);
  useEffect(() => { setSel(undefined); void load(); }, [load]);

  const dow = (day: string) => new Date(`${day}T12:00:00Z`).getUTCDay();
  const hoursOf = (day: string) => hours.find((h) => h.weekday === dow(day));
  const closureOf = (day: string) => closures.find((c) => day >= c.starts_on && day <= c.ends_on);
  const closedReason = (day: string) => (closureOf(day) ? closureOf(day)?.reason || 'Fermeture' : hoursOf(day) && !hoursOf(day)?.open_time ? 'Fermé' : undefined);
  const hmMin = (t?: string | null) => (t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)) : undefined);

  const step = view === 'week' ? 7 : 1;
  const title = view === 'week' ? `${dayLabel(first, { day: 'numeric', month: 'short' })} – ${dayLabel(last, { day: 'numeric', month: 'short' })}` : dayLabel(anchor, { weekday: 'long', day: 'numeric', month: 'long' });

  const run = async (p: PromiseLike<{ error: { message: string } | null }>, ok: string) => {
    const { error } = await p;
    if (error) { setMsg(errText(error.message)); return false; }
    setMsg(ok); setPanel(undefined); setSel(undefined); setConfirming(false); await load(); return true;
  };

  const cancelAppt = (id: string) => run(
    adminClient!.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id), 'Rendez-vous annulé.');
  const removeBlock = (id: string) => run(adminClient!.from('blocked_slots').delete().eq('id', id), 'Créneau débloqué.');

  const selected = sel?.kind === 'appt' ? appts.find((x) => x.id === sel.id) : undefined;
  const selectedBlock = sel?.kind === 'block' ? blocks.find((x) => x.id === sel.id) : undefined;

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.md }}>
        {(['day', 'week'] as const).map((v) => (
          <Pressable key={v} accessibilityRole="tab" accessibilityState={{ selected: view === v }} onPress={() => { setView(v); setPanel(undefined); }}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radii.pill, backgroundColor: view === v ? colors.champagne : colors.beige }}>
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: view === v ? colors.onGold : colors.brown }}>{v === 'day' ? 'Jour' : 'Semaine'}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Précédent" hitSlop={10} onPress={() => setAnchor(addDays(anchor, -step))} style={nav}><Ionicons name="chevron-back" size={20} color={colors.brown} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Aujourd'hui" onPress={() => setAnchor(todayParis())} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.serifSemi, fontSize: 20, color: colors.brown, textTransform: 'capitalize' }}>{title}</Text>
          {anchor !== todayParis() && <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.champagneDark }}>Revenir à aujourd'hui</Text>}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Suivant" hitSlop={10} onPress={() => setAnchor(addDays(anchor, step))} style={nav}><Ionicons name="chevron-forward" size={20} color={colors.brown} /></Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.md }}>
        <Button label="Nouveau rendez-vous" onPress={() => setPanel({ kind: 'create', day: anchor, time: '10:30' })} style={{ flex: 1, minHeight: 46 }} />
        <Button label="Bloquer" variant="ghost" onPress={() => setPanel({ kind: 'block', day: anchor })} style={{ minHeight: 46 }} />
      </View>
      {msg && <Notice>{msg}</Notice>}

      {panel?.kind === 'create' && <CreateForm key={`${panel.day}${panel.time}`} init={panel} onDone={(m) => { setMsg(m); setPanel(undefined); void load(); }} onCancel={() => setPanel(undefined)} />}
      {panel?.kind === 'move' && <MoveForm key={panel.id} init={panel} onDone={(m) => { setMsg(m); setPanel(undefined); setSel(undefined); void load(); }} onCancel={() => setPanel(undefined)} />}
      {panel?.kind === 'block' && <BlockForm key={panel.day} init={panel} onDone={(m) => { setMsg(m); setPanel(undefined); void load(); }} onCancel={() => setPanel(undefined)} />}

      {view === 'day' ? (
        <DayGrid day={anchor} appts={appts} blocks={blocks} closed={closedReason(anchor)} openMin={hmMin(hoursOf(anchor)?.open_time)} closeMin={hmMin(hoursOf(anchor)?.close_time)}
          sel={sel} onSel={(s) => { setSel(s); setConfirming(false); }} onEmpty={(time) => setPanel({ kind: 'create', day: anchor, time })} />
      ) : (
        <WeekList days={days} appts={appts} blocks={blocks} closedReason={closedReason} onOpenDay={(d) => { setAnchor(d); setView('day'); }} />
      )}

      {selected && (
        <Card style={{ marginTop: space.md }}>
          <Text style={{ fontFamily: fonts.sansSemi, fontSize: 16, color: colors.brown }}>{parisHM(selected.starts_at)} – {parisHM(selected.ends_at)} · {svc(selected.service)}</Text>
          <Body style={{ marginTop: 2 }}>{selected.customer_name}</Body>
          <Body muted style={{ fontSize: 13 }}>{selected.customer_phone}{selected.customer_email ? ` · ${selected.customer_email}` : ''}</Body>
          {selected.notes ? <Body muted style={{ fontSize: 13, marginTop: 4 }}>« {selected.notes} »</Body> : null}
          <Body muted style={{ fontSize: 12, marginTop: 4 }}>Réf. {selected.reference}</Body>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
            <Button label="Déplacer" variant="ghost" onPress={() => setPanel({ kind: 'move', id: selected.id, day: parisDay(selected.starts_at), time: parisHM(selected.starts_at) })} style={{ flex: 1, minHeight: 44 }} />
            {confirming
              ? <Button label="Confirmer l'annulation" onPress={() => cancelAppt(selected.id)} style={{ flex: 1.4, minHeight: 44 }} />
              : <Button label="Annuler" variant="ghost" onPress={() => setConfirming(true)} style={{ flex: 1, minHeight: 44 }} />}
          </View>
        </Card>
      )}
      {selectedBlock && (
        <Card style={{ marginTop: space.md }}>
          <Text style={{ fontFamily: fonts.sansSemi, fontSize: 16, color: colors.brown }}>Bloqué {parisHM(selectedBlock.starts_at)} – {parisHM(selectedBlock.ends_at)}</Text>
          {selectedBlock.reason ? <Body muted>{selectedBlock.reason}</Body> : null}
          <Button label="Débloquer" variant="ghost" onPress={() => removeBlock(selectedBlock.id)} style={{ marginTop: space.sm, minHeight: 44 }} />
        </Card>
      )}
    </View>
  );
}

const nav = { width: 40, height: 40, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(34,25,17,0.6)', alignItems: 'center', justifyContent: 'center' } as const;

function DayGrid({ day, appts, blocks, closed, openMin, closeMin, sel, onSel, onEmpty }: {
  day: string; appts: Appt[]; blocks: Block[]; closed?: string; openMin?: number; closeMin?: number; sel: Sel; onSel: (s: Sel) => void; onEmpty: (time: string) => void;
}) {
  const todays = appts.filter((a) => parisDay(a.starts_at) === day);
  const todaysBlocks = blocks.filter((b) => parisDay(b.starts_at) <= day && parisDay(new Date(new Date(b.ends_at).getTime() - 1)) >= day);
  let start = Math.floor((openMin ?? DEFAULT_OPEN) / 60) * 60;
  let end = Math.ceil((closeMin ?? DEFAULT_CLOSE) / 60) * 60;
  for (const a of todays) { start = Math.min(start, Math.floor(parisMinutes(a.starts_at) / 60) * 60); end = Math.max(end, Math.ceil((parisMinutes(a.ends_at) || 1440) / 60) * 60); }
  const rows = Array.from({ length: Math.max(0, (end - start) / 30) }, (_, i) => start + i * 30);
  return (
    <View>
      {closed && <Notice>{closed} ce jour-là : aucun créneau en ligne. Vous pouvez tout de même ajouter un rendez-vous.</Notice>}
      <View style={{ height: (end - start) * PX, position: 'relative' }}>
        {rows.map((m) => (
          <Pressable key={m} accessibilityRole="button" accessibilityLabel={`Ajouter un rendez-vous à ${minutesToHM(m)}`} onPress={() => onEmpty(minutesToHM(floorHalfHour(m)))}
            style={{ position: 'absolute', left: 0, right: 0, top: (m - start) * PX, height: 30 * PX, borderTopWidth: 1, borderTopColor: m % 60 === 0 ? colors.line : 'rgba(212,175,106,0.1)' }}>
            {m % 60 === 0 && <Text style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.muted, marginTop: 2 }}>{minutesToHM(m)}</Text>}
          </Pressable>
        ))}
        {todaysBlocks.map((b) => {
          const l = blockLayout(b.starts_at, b.ends_at, start, end, PX);
          return (
            <Pressable key={b.id} accessibilityRole="button" accessibilityLabel={`Créneau bloqué ${parisHM(b.starts_at)}`} onPress={() => onSel({ kind: 'block', id: b.id })}
              style={{ position: 'absolute', left: GUTTER, right: 0, top: l.top, height: l.height, borderRadius: 10, padding: 6, backgroundColor: '#2A2118', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.muted, overflow: 'hidden' }}>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted }}>Bloqué{b.reason ? ` · ${b.reason}` : ''}</Text>
            </Pressable>
          );
        })}
        {todays.map((a) => {
          const l = blockLayout(a.starts_at, a.ends_at, start, end, PX);
          const on = sel?.kind === 'appt' && sel.id === a.id;
          return (
            <Pressable key={a.id} accessibilityRole="button" accessibilityLabel={`${parisHM(a.starts_at)} ${a.customer_name}, ${svc(a.service)}`} onPress={() => onSel({ kind: 'appt', id: a.id })}
              style={{ position: 'absolute', left: GUTTER, right: 0, top: l.top, height: l.height, borderRadius: 10, padding: 6, backgroundColor: on ? colors.champagne : '#4A3921', borderWidth: 1, borderColor: colors.champagne, overflow: 'hidden' }}>
              <Text numberOfLines={1} style={{ fontFamily: fonts.sansSemi, fontSize: 13, color: on ? colors.onGold : colors.brown }}>{parisHM(a.starts_at)} · {shortName(a.customer_name)}</Text>
              {l.height > 40 && <Text numberOfLines={1} style={{ fontFamily: fonts.sans, fontSize: 12, color: on ? colors.onGold : colors.muted }}>{svc(a.service)}</Text>}
            </Pressable>
          );
        })}
      </View>
      {todays.length === 0 && todaysBlocks.length === 0 && <Body muted style={{ marginTop: space.sm }}>Aucun rendez-vous. Touchez une heure pour en ajouter un.</Body>}
    </View>
  );
}

function WeekList({ days, appts, blocks, closedReason, onOpenDay }: {
  days: string[]; appts: Appt[]; blocks: Block[]; closedReason: (d: string) => string | undefined; onOpenDay: (d: string) => void;
}) {
  const today = todayParis();
  return (
    <View>
      {days.map((d) => {
        const list = appts.filter((a) => parisDay(a.starts_at) === d);
        const bl = blocks.filter((b) => parisDay(b.starts_at) === d);
        const closed = closedReason(d);
        return (
          <Pressable key={d} accessibilityRole="button" accessibilityLabel={`Ouvrir ${dayLabel(d, { weekday: 'long', day: 'numeric', month: 'long' })}`} onPress={() => onOpenDay(d)}>
            <Card style={{ marginBottom: space.sm, borderColor: d === today ? colors.champagne : colors.line, opacity: closed && list.length === 0 ? 0.6 : 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fonts.sansSemi, color: colors.brown, textTransform: 'capitalize' }}>{dayLabel(d)}</Text>
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: colors.champagneDark }}>{closed && list.length === 0 ? closed : `${list.length} rdv`}</Text>
              </View>
              {list.map((a) => <Text key={a.id} style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.brown, marginTop: 4 }}>{parisHM(a.starts_at)} · {shortName(a.customer_name)} · {svc(a.service)}</Text>)}
              {bl.map((b) => <Text key={b.id} style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 }}>{parisHM(b.starts_at)} – {parisHM(b.ends_at)} · Bloqué{b.reason ? ` (${b.reason})` : ''}</Text>)}
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

function CreateForm({ init, onDone, onCancel }: { init: { day: string; time: string }; onDone: (m: string) => void; onCancel: () => void }) {
  const [slug, setSlug] = useState<string | undefined>();
  const [day, setDay] = useState(init.day);
  const [time, setTime] = useState(init.time);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState<string | undefined>();
  const submit = async () => {
    const p = adminBookingSchema.safeParse({ serviceSlug: slug ?? '', day, time, name, phone, email, notes: notes || undefined });
    if (!p.success) { setErr(p.error.issues[0]?.message); return; }
    const v = p.data;
    const { error } = await adminClient!.rpc('admin_create_booking', { p_service_slug: v.serviceSlug, p_starts_at: parisToIso(v.day, v.time), p_name: v.name, p_phone: v.phone, p_email: v.email || null, p_notes: v.notes ?? null });
    if (error) { setErr(errText(error.message)); return; }
    onDone('Rendez-vous créé.');
  };
  return (
    <Card style={{ marginBottom: space.md }}>
      <Text style={{ fontFamily: fonts.serifSemi, fontSize: 20, color: colors.brown, marginBottom: space.sm }}>Nouveau rendez-vous</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md }}>
        {RITUALS.map((r) => (
          <Pressable key={r.id} accessibilityRole="button" accessibilityState={{ selected: slug === r.id }} onPress={() => setSlug(r.id)}
            style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: slug === r.id ? colors.champagne : colors.beige }}>
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: slug === r.id ? colors.onGold : colors.brown }}>{r.name}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={{ flex: 1.4 }}><Field label="Jour (AAAA-MM-JJ)" value={day} onChangeText={setDay} autoCapitalize="none" /></View>
        <View style={{ flex: 1 }}><Field label="Heure" value={time} onChangeText={setTime} placeholder="10:30" autoCapitalize="none" /></View>
      </View>
      <Field label="Nom et prénom" value={name} onChangeText={setName} autoComplete="off" />
      <Field label="Téléphone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Field label="Email (facultatif)" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <Field label="Note (facultatif)" multiline value={notes} onChangeText={setNotes} />
      {err && <Notice>{err}</Notice>}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Button label="Créer" onPress={submit} style={{ flex: 1 }} />
        <Button label="Fermer" variant="ghost" onPress={onCancel} />
      </View>
    </Card>
  );
}

function MoveForm({ init, onDone, onCancel }: { init: { id: string; day: string; time: string }; onDone: (m: string) => void; onCancel: () => void }) {
  const [day, setDay] = useState(init.day);
  const [time, setTime] = useState(init.time);
  const [err, setErr] = useState<string | undefined>();
  const submit = async () => {
    const p = adminBookingSchema.pick({ day: true, time: true }).safeParse({ day, time });
    if (!p.success) { setErr(p.error.issues[0]?.message); return; }
    const { data, error } = await adminClient!.rpc('admin_move_booking', { p_booking_id: init.id, p_new_starts_at: parisToIso(p.data.day, p.data.time) });
    if (error) { setErr(errText(error.message)); return; }
    if (data !== true) { setErr('Rendez-vous introuvable ou déjà annulé.'); return; }
    onDone('Rendez-vous déplacé.');
  };
  return (
    <Card style={{ marginBottom: space.md }}>
      <Text style={{ fontFamily: fonts.serifSemi, fontSize: 20, color: colors.brown, marginBottom: space.sm }}>Déplacer le rendez-vous</Text>
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={{ flex: 1.4 }}><Field label="Nouveau jour (AAAA-MM-JJ)" value={day} onChangeText={setDay} autoCapitalize="none" /></View>
        <View style={{ flex: 1 }}><Field label="Heure" value={time} onChangeText={setTime} autoCapitalize="none" /></View>
      </View>
      <Body muted style={{ marginBottom: space.sm }}>Pensez à prévenir la cliente du nouvel horaire.</Body>
      {err && <Notice>{err}</Notice>}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Button label="Déplacer" onPress={submit} style={{ flex: 1 }} />
        <Button label="Fermer" variant="ghost" onPress={onCancel} />
      </View>
    </Card>
  );
}

function BlockForm({ init, onDone, onCancel }: { init: { day: string }; onDone: (m: string) => void; onCancel: () => void }) {
  const [day, setDay] = useState(init.day);
  const [start, setStart] = useState('12:00');
  const [end, setEnd] = useState('13:00');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | undefined>();
  const submit = async () => {
    const p = blockedSlotSchema.safeParse({ day, start, end, reason: reason || undefined });
    if (!p.success) { setErr(p.error.issues[0]?.message); return; }
    const v = p.data;
    const { error } = await adminClient!.from('blocked_slots').insert({ starts_at: parisToIso(v.day, v.start), ends_at: parisToIso(v.day, v.end), reason: v.reason ?? null });
    if (error) { setErr(errText(error.message)); return; }
    onDone('Créneau bloqué : il n\'est plus proposé en ligne.');
  };
  return (
    <Card style={{ marginBottom: space.md }}>
      <Text style={{ fontFamily: fonts.serifSemi, fontSize: 20, color: colors.brown, marginBottom: space.sm }}>Bloquer un créneau</Text>
      <Field label="Jour (AAAA-MM-JJ)" value={day} onChangeText={setDay} autoCapitalize="none" />
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={{ flex: 1 }}><Field label="De" value={start} onChangeText={setStart} autoCapitalize="none" /></View>
        <View style={{ flex: 1 }}><Field label="À" value={end} onChangeText={setEnd} autoCapitalize="none" /></View>
      </View>
      <Field label="Motif (facultatif)" value={reason} onChangeText={setReason} maxLength={120} />
      <Body muted style={{ marginBottom: space.sm }}>Les rendez-vous déjà pris pendant ce créneau ne sont pas modifiés.</Body>
      {err && <Notice>{err}</Notice>}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Button label="Bloquer" onPress={submit} style={{ flex: 1 }} />
        <Button label="Fermer" variant="ghost" onPress={onCancel} />
      </View>
    </Card>
  );
}
