import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { BUSINESS } from '@ghs/config';
import { colors, fonts, radii, space } from '@ghs/ui';
import { giftCardPurchaseSchema, type GiftCardPurchaseInput } from '@ghs/validation';
import { Body, Button, Field, Notice, Screen, Title } from '../src/components/ui';
import { formatPrice, getRitual, RITUALS } from '../src/data/rituals';

export default function GiftCard() {
  const router = useRouter();
  const { ritual } = useLocalSearchParams<{ ritual?: string }>();
  const initial = ritual ? getRitual(ritual) : undefined;
  const [ritualId, setRitualId] = useState<string | undefined>(initial?.id);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<GiftCardPurchaseInput>({
    resolver: zodResolver(giftCardPurchaseSchema),
    defaultValues: { amountEur: initial?.priceEur ?? 80, ritualId: initial?.id, recipientName: '', recipientEmail: '', message: '' },
  });
  const [validated, setValidated] = useState(false);

  return (
    <Screen>
      <Pressable accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12} style={{ marginBottom: space.md }}>
        <Ionicons name="chevron-back" size={24} color={colors.brown} />
      </Pressable>
      <Title>Offrez un moment unique</Title>
      <Body muted style={{ marginTop: 4 }}>{BUSINESS.giftCardRules}</Body>

      <Text style={{ fontFamily: fonts.sansSemi, marginTop: space.lg, marginBottom: space.sm, color: colors.brown }}>Choisir un rituel</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md }}>
        {RITUALS.map((r) => {
          const active = r.id === ritualId;
          return (
            <Pressable key={r.id} accessibilityRole="button" accessibilityState={{ selected: active }}
              onPress={() => { setRitualId(r.id); setValue('ritualId', r.id); setValue('amountEur', r.priceEur); }}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: active ? colors.champagne : colors.beige }}>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: active ? colors.white : colors.brown }}>{r.name} · {formatPrice(r.priceEur)}</Text>
            </Pressable>
          );
        })}
      </View>

      <Controller control={control} name="recipientName" render={({ field }) => (
        <Field label="Nom du bénéficiaire" value={field.value} onChangeText={field.onChange} error={errors.recipientName?.message} />)} />
      <Controller control={control} name="recipientEmail" render={({ field }) => (
        <Field label="Email du bénéficiaire" keyboardType="email-address" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={errors.recipientEmail?.message} />)} />
      <Controller control={control} name="message" render={({ field }) => (
        <Field label="Message personnel (optionnel)" multiline value={field.value ?? ''} onChangeText={field.onChange} error={errors.message?.message} />)} />

      {validated && <Notice>Informations valides. Le paiement sécurisé (Stripe) n'est pas encore branché : aucune carte cadeau n'est émise.</Notice>}
      <Button label="Continuer vers le paiement" onPress={handleSubmit(() => setValidated(true))} />
      <Body muted style={{ marginTop: space.md, fontSize: 12 }}>Paiement, envoi par email et code unique : disponibles après configuration Stripe/Resend côté serveur.</Body>
    </Screen>
  );
}
