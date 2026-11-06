import { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { BUSINESS } from '@ghs/config';
import { colors, fonts, radii, space } from '@ghs/ui';
import { signInSchema } from '@ghs/validation';
import { z } from 'zod';
import { DEMO_MODE, useSession } from '../../src/store/session';
import { hasAmbient, toggleAmbient, useAmbient } from '../../src/lib/ambient';
import { Body, Button, Card, Field, Notice, Screen, ScreenHeader } from '../../src/components/ui';

type SignIn = z.infer<typeof signInSchema>;
type Row = { label: string; icon: keyof typeof Ionicons.glyphMap; href?: string };

/** Lignes fonctionnelles (navigation réelle) puis lignes verrouillées tant que l'authentification n'est pas branchée. */
const LIVE: Row[] = [
  { label: 'Mes réservations', icon: 'calendar-outline', href: '/(tabs)/booking' },
  { label: 'Cartes cadeaux', icon: 'gift-outline', href: '/gift-card' },
  { label: 'Contact', icon: 'location-outline', href: '/contact' },
];
const LOCKED: Row[] = [
  { label: 'Mes commandes', icon: 'bag-outline' },
  { label: 'Mes favoris', icon: 'heart-outline' },
  { label: 'Notifications', icon: 'notifications-outline' },
  { label: 'Préférences', icon: 'options-outline' },
];

function RowItem({ row, locked }: { row: Row; locked?: boolean }) {
  const router = useRouter();
  return (
    <Pressable accessibilityRole={locked ? 'text' : 'button'} accessibilityState={{ disabled: !!locked }} disabled={locked} onPress={() => row.href && router.push(row.href as never)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 14, paddingHorizontal: space.md, borderBottomWidth: 1, borderBottomColor: colors.line, opacity: locked ? 0.5 : 1 }}>
      <Ionicons name={row.icon} size={20} color={colors.champagneDark} />
      <Text style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 15, color: colors.brown }}>{row.label}</Text>
      <Ionicons name={locked ? 'lock-closed-outline' : 'chevron-forward'} size={16} color={locked ? colors.muted : colors.champagneDark} />
    </Pressable>
  );
}

/** Authentification : formulaire validé, backend Supabase non connecté (phase 4). */
export default function Profile() {
  const { control, handleSubmit, formState: { errors } } = useForm<SignIn>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } });
  const [attempted, setAttempted] = useState(false);
  const { isMember, setMember } = useSession();
  const playing = useAmbient((st) => st.playing);
  return (
    <Screen>
      <ScreenHeader title="Mon espace" back={false} subtitle="Connectez-vous pour retrouver vos cartes cadeaux, commandes et favoris." />
      <View style={{ alignItems: 'center', marginVertical: space.md }}>
        <View style={{ width: 92, height: 92, borderRadius: 46, borderWidth: 1.5, borderColor: colors.champagne, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="person-outline" size={40} color={colors.champagne} />
        </View>
        {isMember && <Text style={{ marginTop: space.sm, fontFamily: fonts.sansSemi, fontSize: 12, color: colors.onGold, backgroundColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 4, overflow: 'hidden' }}>Membre</Text>}
      </View>
      <Card>
        <Controller control={control} name="email" render={({ field }) => (
          <Field label="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />)} />
        <Controller control={control} name="password" render={({ field }) => (
          <Field label="Mot de passe" secureTextEntry autoComplete="password" value={field.value} onChangeText={field.onChange} error={errors.password?.message} />)} />
        {attempted && <Notice>La connexion n'est pas encore disponible : le service d'authentification (Supabase) n'est pas configuré.</Notice>}
        <Button label="Se connecter" onPress={handleSubmit(() => setAttempted(true))} />
        {DEMO_MODE && <Button variant="ghost" label={isMember ? 'Quitter le mode démo membre' : 'Mode démo : simuler un membre'} onPress={() => setMember(!isMember)} style={{ marginTop: space.sm }} />}
      </Card>
      <Card style={{ marginTop: space.lg, padding: 0, overflow: 'hidden' }}>
        {LIVE.map((r) => <RowItem key={r.label} row={r} />)}
        {hasAmbient && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10, paddingHorizontal: space.md, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            <Ionicons name="musical-notes-outline" size={20} color={colors.champagneDark} />
            <Text style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 15, color: colors.brown }}>Ambiance sonore</Text>
            <Switch accessibilityLabel="Ambiance sonore" value={playing} onValueChange={() => { void toggleAmbient(); }} trackColor={{ true: colors.champagne, false: colors.line }} thumbColor={colors.brown} />
          </View>
        )}
        {LOCKED.map((r) => <RowItem key={r.label} row={r} locked />)}
      </Card>
      <Body muted style={{ marginTop: space.md, fontSize: 12, textAlign: 'center' }}>{BUSINESS.address}</Body>
    </Screen>
  );
}
