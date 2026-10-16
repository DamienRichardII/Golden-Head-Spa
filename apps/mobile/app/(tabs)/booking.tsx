import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BUSINESS } from '@ghs/config';
import { colors, fonts, radii, space } from '@ghs/ui';
import { bookingSchema } from '@ghs/validation';
import { z } from 'zod';
import { Body, Button, Card, Field, Notice, Reveal, Screen, Title } from '../../src/components/ui';
import { formatDuration, formatPrice, getRitual, RITUALS } from '../../src/data/rituals';
import {
  BookingError, cancelBooking, createBooking, fetchSlots, formatDayLabel, formatLongDate, formatTime, getLastBooking, nextDays,
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

const detailsSchema = bookingSchema.pick({ name: true, email: true, phone: true, notes: true });
type Details = z.infer<typeof detailsSchema>;

/** Réservation intégrée : disponibilités et rendez-vous gérés par notre backend (Supabase), sans passer par Planity. */
export default function Booking() {
  const { ritual: preselected } = useLocalSearchParams<{ ritual?: string }>();
  const [serviceId, setServiceId] = useState<string | undefined>(preselected && getRitual(preselected) ? preselected : undefined);
  const [days] = useState(() => nextDays(DAYS_SHOWN));
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
        <Title>Réserver un soin</Title>
        <Notice>La réservation intégrée n'est pas encore activée. En attendant, vous pouvez réserver sur Planity.</Notice>
        <Button label="Réserver sur Planity" disabled={!isPlanityConfigured()} onPress={() => { void openPlanity(); }} />
      </Screen>
    );
  }

  if (done) {
    const booked = getRitual(done.serviceSlug);
    return (
      <Screen>
        <Title>Rendez-vous confirmé</Title>
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
      <Title>Réserver un soin</Title>
      {cancelMsg && <Notice>{cancelMsg}</Notice>}

      <Text style={sec}>1. Votre soin</Text>
      {RITUALS.map((r, i) => {
        const active = r.id === serviceId;
        return (
          <Reveal key={r.id} index={i}>
            <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => pickService(r.id)}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.md, marginBottom: space.sm,
                borderRadius: radii.lg, backgroundColor: colors.white, borderWidth: 1.5, borderColor: active ? colors.champagne : 'transparent' }}>
              <View>
                <Text style={{ fontFamily: fonts.sansSemi, fontSize: 15, color: colors.black }}>{r.name}</Text>
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.muted }}>{formatDuration(r.durationMin)}</Text>
              </View>
              <Text style={{ fontFamily: fonts.sansSemi, color: colors.champagneDark }}>{formatPrice(r.priceEur)}</Text>
            </Pressable>
          </Reveal>
        );
      })}

      {ritual && (
        <>
          <Text style={sec}>2. Le jour</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
            {days.map((d) => {
              const active = d === day;
              return (
                <Pressable key={d} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => pickDay(d)}
                  style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.md, backgroundColor: active ? colors.champagne : colors.white }}>
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: active ? colors.white : colors.brown, textTransform: 'capitalize' }}>{formatDayLabel(d)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}

      {ritual && day && (
        <>
          <Text style={sec}>3. L'heure</Text>
          {slotsLoading && <ActivityIndicator color={colors.champagneDark} />}
          {slots && slots.length === 0 && !slotsLoading && !error && <Body muted>Aucun créneau ce jour-là. Essayez un autre jour.</Body>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {slots?.map((t) => {
              const active = t === slot;
              return (
                <Pressable key={t} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setSlot(t)}
                  style={{ minWidth: 78, alignItems: 'center', paddingVertical: 10, borderRadius: radii.pill, backgroundColor: active ? colors.champagne : colors.white }}>
                  <Text style={{ fontFamily: fonts.sansMedium, color: active ? colors.white : colors.brown }}>{formatTime(t)}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {ritual && slot && (
        <>
          <Text style={sec}>4. Vos coordonnées</Text>
          <Controller control={control} name="name" render={({ field }) => (
            <Field label="Nom et prénom" autoComplete="name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />)} />
          <Controller control={control} name="email" render={({ field }) => (
            <Field label="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />)} />
          <Controller control={control} name="phone" render={({ field }) => (
            <Field label="Téléphone" keyboardType="phone-pad" autoComplete="tel" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />)} />
          <Controller control={control} name="notes" render={({ field }) => (
            <Field label="Message (optionnel)" multiline value={field.value ?? ''} onChangeText={field.onChange} error={errors.notes?.message} />)} />
          <Card>
            <Body>{ritual.name} · {formatDuration(ritual.durationMin)} · {formatPrice(ritual.priceEur)}</Body>
            <Body muted style={{ textTransform: 'capitalize' }}>{formatLongDate(slot)} · {formatTime(slot)}</Body>
          </Card>
          {error && <Notice>{error}</Notice>}
          <Button label={submitting ? 'Confirmation…' : 'Confirmer le rendez-vous'} disabled={submitting} style={{ marginTop: space.md }} onPress={onSubmit} />
          <Body muted style={{ marginTop: space.md, fontSize: 12 }}>Paiement sur place. Vos données servent uniquement à gérer ce rendez-vous.</Body>
        </>
      )}
      {error && !slot && <Notice>{error}</Notice>}
    </Screen>
  );
}

const sec = { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.brown, marginTop: space.lg, marginBottom: space.sm } as const;
