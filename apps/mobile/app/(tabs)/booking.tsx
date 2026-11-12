import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BUSINESS } from '@ghs/config';
import { colors, fonts, radii, space } from '@ghs/ui';
import { bookingSchema } from '@ghs/validation';
import { z } from 'zod';
import { Body, Button, Card, Field, Notice, Reveal, Screen, ScreenHeader } from '../../src/components/ui';
import { ritualImage } from '../../src/data/images';
import { formatDuration, formatPrice, getRitual, RITUALS } from '../../src/data/rituals';
import {
  BookingError, cancelBooking, createBooking, fetchClosedDays, fetchSlots, formatDayLabel, formatLongDate, formatTime, getLastBooking, nextDays,
  type BookingConfirmation,
} from '../../src/lib/booking';
import { isPlanityConfigured, openPlanity } from '../../src/lib/open';
import { isBackendConfigured } from '../../src/lib/supabase';

const DAYS_SHOWN = 21;
const ERRORS: Record<string, string> = {
  slot_unavailable: "Ce créneau vient d'être pris. Choisissez un autre horaire.",
  too_many_bookings: 'Vous avez déjà plusieurs rendez-vous à venir. Contactez-nous pour en ajouter.',
  service_not_found: "Ce soin n'est plus disponible à la réservation.",
  invalid: 'Certaines informations sont invalides. Vérifiez le formulaire.',
  network: 'Service indisponible pour le moment. Réessayez dans un instant.',
};

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const monthTitle = (ym: string) => new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(`${ym}-15T12:00:00Z`));
const CLOSED_NOTE = `Fermé le ${BUSINESS.hours.filter((h) => !h.close).map((h) => h.days.toLowerCase()).join(' et le ')}`;

/** Calendrier mensuel (lundi en premier). Seuls les jours proposés et ouverts sont sélectionnables ; les autres sont grisés. */
function Calendar({ days, closed, selected, onPick }: { days: string[]; closed: Set<string>; selected?: string; onPick: (d: string) => void }) {
  const months = Array.from(new Set(days.map((d) => d.slice(0, 7))));
  const [mi, setMi] = useState(0);
  const ym = months[mi] ?? months[0] ?? days[0]?.slice(0, 7) ?? '1970-01';
  const y = Number(ym.slice(0, 4));
  const m = Number(ym.slice(5, 7));
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`)];
  const offered = new Set(days);
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mois précédent" disabled={mi === 0} onPress={() => setMi(mi - 1)} hitSlop={10} style={{ opacity: mi === 0 ? 0.3 : 1 }}>
          <Ionicons name="chevron-back" size={20} color={colors.brown} />
        </Pressable>
        <Text style={{ fontFamily: fonts.serifSemi, fontSize: 20, color: colors.brown, textTransform: 'capitalize' }}>{monthTitle(ym)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Mois suivant" disabled={mi >= months.length - 1} onPress={() => setMi(mi + 1)} hitSlop={10} style={{ opacity: mi >= months.length - 1 ? 0.3 : 1 }}>
          <Ionicons name="chevron-forward" size={20} color={colors.brown} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w) => <Text key={w} style={{ width: `${100 / 7}%`, textAlign: 'center', fontFamily: fonts.sansMedium, fontSize: 11, color: colors.muted, marginBottom: 6 }}>{w}</Text>)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          if (!d) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 40 }} />;
          const enabled = offered.has(d) && !closed.has(d);
          const active = d === selected;
          return (
            <View key={d} style={{ width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Pressable accessibilityRole="button" accessibilityLabel={formatDayLabel(d)} accessibilityState={{ selected: active, disabled: !enabled }} disabled={!enabled} onPress={() => onPick(d)}
                style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.champagne : 'transparent', borderWidth: enabled && !active ? 1 : 0, borderColor: colors.line }}>
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: active ? colors.onGold : enabled ? colors.brown : colors.muted, opacity: enabled || active ? 1 : 0.35 }}>{Number(d.slice(8))}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <Text style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: space.sm, fontStyle: 'italic' }}>{CLOSED_NOTE}</Text>
    </Card>
  );
}

/** Barre de progression en 3 étapes (Rituel, Date et heure, Confirmation). */
function Steps({ step }: { step: 1 | 2 | 3 }) {
  const items = ['Rituel', 'Date et heure', 'Confirmation'];
  return (
    <View accessibilityLabel={`Étape ${step} sur 3`} style={{ flexDirection: 'row', marginBottom: space.md }}>
      {items.map((label, i) => {
        const n = i + 1; const done = n < step; const on = n === step;
        return (
          <View key={label} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }}>
              <View style={{ flex: 1, height: 1, backgroundColor: i === 0 ? 'transparent' : n <= step ? colors.champagne : colors.line }} />
              <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: done || on ? colors.champagne : 'transparent', borderWidth: 1, borderColor: done || on ? colors.champagne : colors.line }}>
                {done ? <Ionicons name="checkmark" size={15} color={colors.onGold} /> : <Text style={{ fontFamily: fonts.sansSemi, fontSize: 12, color: on ? colors.onGold : colors.muted }}>{n}</Text>}
              </View>
              <View style={{ flex: 1, height: 1, backgroundColor: i === items.length - 1 ? 'transparent' : n < step ? colors.champagne : colors.line }} />
            </View>
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: on || done ? colors.champagneDark : colors.muted, marginTop: 4 }}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const detailsSchema = bookingSchema.pick({ name: true, email: true, phone: true, notes: true });
type Details = z.infer<typeof detailsSchema>;

/** Réservation intégrée : disponibilités et rendez-vous gérés par notre backend (Supabase), sans passer par Planity. */
export default function Booking() {
  const { ritual: preselected } = useLocalSearchParams<{ ritual?: string }>();
  const [serviceId, setServiceId] = useState<string | undefined>(preselected && getRitual(preselected) ? preselected : undefined);
  const [days] = useState(() => nextDays(DAYS_SHOWN));
  const [closedDays, setClosedDays] = useState<Set<string>>(new Set());
  const [day, setDay] = useState<string | undefined>();
  const [slots, setSlots] = useState<string[] | undefined>();
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<BookingConfirmation | undefined>();
  const [cancelMsg, setCancelMsg] = useState<string | undefined>();
  const ritual = serviceId ? getRitual(serviceId) : undefined;

  const { control, handleSubmit, formState: { errors } } = useForm<Details>({
    resolver: zodResolver(detailsSchema), defaultValues: { name: '', email: '', phone: '', notes: '' },
  });

  useEffect(() => { fetchClosedDays(days).then(setClosedDays).catch(() => {}); }, [days]);
  useEffect(() => { getLastBooking().then((b) => { if (b && new Date(b.endsAt) > new Date()) setDone(b); }); }, []);

  const loadSlots = useCallback(async (service: string, d: string) => {
    setSlotsLoading(true); setSlots(undefined); setSlot(undefined); setError(undefined);
    try { setSlots(await fetchSlots(service, d)); }
    catch (e) { setError(ERRORS[e instanceof BookingError ? e.code : 'network']); setSlots([]); }
    finally { setSlotsLoading(false); }
  }, []);

  const pickService = (id: string) => { setServiceId(id); setDay(undefined); setSlots(undefined); setSlot(undefined); };
  const pickDay = (d: string) => { setDay(d); if (serviceId) void loadSlots(serviceId, d); };

  const onSubmit = handleSubmit(async (details) => {
    if (!ritual || !slot) return;
    setSubmitting(true); setError(undefined);
    try {
      setDone(await createBooking({ ...details, serviceSlug: ritual.id, startsAt: slot }));
    } catch (e) {
      const code = e instanceof BookingError ? e.code : 'network';
      setError(ERRORS[code]);
      if (code === 'slot_unavailable' && day) void loadSlots(ritual.id, day);
    } finally { setSubmitting(false); }
  });

  const onCancel = async () => {
    if (!done) return;
    try {
      const ok = await cancelBooking(done);
      if (ok) { setDone(undefined); setCancelMsg('Votre rendez-vous a été annulé.'); setDay(undefined); setSlots(undefined); setSlot(undefined); }
      else setCancelMsg(`Annulation en ligne impossible (moins de 24 h avant le rendez-vous). Contactez-nous au ${BUSINESS.phone}.`);
    } catch { setCancelMsg(ERRORS.network); }
  };

  // Backend non configuré : repli explicite sur Planity (aucune disponibilité simulée).
  if (!isBackendConfigured) {
    return (
      <Screen>
        <ScreenHeader title="Réserver un rituel" back={false} />
        <Notice>La réservation intégrée n'est pas encore activée. En attendant, vous pouvez réserver sur Planity.</Notice>
        <Button label="Réserver sur Planity" disabled={!isPlanityConfigured()} onPress={() => { void openPlanity(); }} />
      </Screen>
    );
  }

  if (done) {
    const booked = getRitual(done.serviceSlug);
    return (
      <Screen>
        <ScreenHeader title="Rendez-vous confirmé" back={false} />
        <Card style={{ marginTop: space.md }}>
          <Text style={{ fontFamily: fonts.serifSemi, fontSize: 22, color: colors.brown }}>{booked?.name ?? 'Votre soin'}</Text>
          <Body style={{ marginTop: space.sm, textTransform: 'capitalize' }}>{formatLongDate(done.startsAt)} · {formatTime(done.startsAt)}</Body>
          <Body muted style={{ marginTop: 4 }}>{BUSINESS.address}</Body>
          <Body style={{ marginTop: space.md }}>Référence : <Text style={{ fontFamily: fonts.sansSemi }}>{done.reference}</Text></Body>
          {booked && <Body muted style={{ marginTop: 4 }}>Paiement sur place · {formatPrice(booked.priceEur)}</Body>}
        </Card>
        {cancelMsg && <Notice>{cancelMsg}</Notice>}
        <Button label="Annuler ce rendez-vous" variant="ghost" style={{ marginTop: space.md }} onPress={onCancel} />
        <Body muted style={{ marginTop: space.md, fontSize: 12 }}>
          Annulation gratuite en ligne jusqu'à 24 h avant. Besoin d'aide : {BUSINESS.phone} · {BUSINESS.email}
        </Body>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Réserver un rituel" back={false} />
      <Steps step={!ritual ? 1 : !slot ? 2 : 3} />
      {cancelMsg && <Notice>{cancelMsg}</Notice>}

      <Text style={sec}>Votre rituel</Text>
      {RITUALS.map((r, i) => {
        const active = r.id === serviceId;
        return (
          <Reveal key={r.id} index={i}>
            <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => pickService(r.id)}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.md, marginBottom: space.sm,
                borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: active ? colors.champagne : colors.line }}>
              <View>
                <Text style={{ fontFamily: fonts.sansSemi, fontSize: 15, color: colors.brown }}>{r.name}</Text>
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.muted }}>{formatDuration(r.durationMin)}</Text>
              </View>
              <Text style={{ fontFamily: fonts.sansSemi, color: colors.champagneDark }}>{formatPrice(r.priceEur)}</Text>
            </Pressable>
          </Reveal>
        );
      })}

      {ritual && (
        <>
          <Text style={sec}>Choisissez un jour</Text>
          <Calendar days={days} closed={closedDays} selected={day} onPick={pickDay} />
        </>
      )}

      {ritual && day && (
        <>
          <Text style={sec}>Choisissez un créneau</Text>
          {slotsLoading && <ActivityIndicator color={colors.champagneDark} />}
          {slots && slots.length === 0 && !slotsLoading && !error && <Body muted>Aucun créneau ce jour-là. Essayez un autre jour.</Body>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'flex-start' }}>
            {slots?.map((t) => {
              const active = t === slot;
              return (
                <Pressable key={t} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setSlot(t)}
                  style={{ width: '31%', alignItems: 'center', paddingVertical: 11, borderRadius: radii.pill, borderWidth: 1, borderColor: active ? colors.champagne : colors.line, backgroundColor: active ? colors.champagne : 'rgba(34,25,17,0.6)' }}>
                  <Text style={{ fontFamily: fonts.sansMedium, color: active ? colors.onGold : colors.brown }}>{formatTime(t)}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {ritual && slot && (
        <>
          <Text style={sec}>Vos coordonnées</Text>
          <Controller control={control} name="name" render={({ field }) => (
            <Field label="Nom et prénom" autoComplete="name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />)} />
          <Controller control={control} name="email" render={({ field }) => (
            <Field label="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />)} />
          <Controller control={control} name="phone" render={({ field }) => (
            <Field label="Téléphone" keyboardType="phone-pad" autoComplete="tel" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />)} />
          <Controller control={control} name="notes" render={({ field }) => (
            <Field label="Message (optionnel)" multiline value={field.value ?? ''} onChangeText={field.onChange} error={errors.notes?.message} />)} />
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Image source={ritualImage(ritual.id)} contentFit="cover" contentPosition="center" style={{ width: 64, height: 64, borderRadius: radii.md }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.serifSemi, fontSize: 20, color: colors.brown }}>{ritual.name}</Text>
              <Body muted>{formatDuration(ritual.durationMin)} · {formatPrice(ritual.priceEur)}</Body>
              <Body muted style={{ textTransform: 'capitalize' }}>{formatLongDate(slot)} · {formatTime(slot)}</Body>
            </View>
          </Card>
          {error && <Notice>{error}</Notice>}
          <Button label={submitting ? 'Confirmation…' : 'Confirmer le rendez-vous'} disabled={submitting} style={{ marginTop: space.md }} onPress={onSubmit} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: space.md }}>
            <Ionicons name="shield-checkmark-outline" size={15} color={colors.champagneDark} />
            <Body muted style={{ fontSize: 12, flexShrink: 1 }}>Paiement sur place. Vos données servent uniquement à gérer ce rendez-vous.</Body>
          </View>
        </>
      )}
      {error && !slot && <Notice>{error}</Notice>}
    </Screen>
  );
}

const sec = { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.brown, marginTop: space.lg, marginBottom: space.sm } as const;
