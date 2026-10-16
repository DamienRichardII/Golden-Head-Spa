import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, space } from '@ghs/ui';
import { signInSchema } from '@ghs/validation';
import { z } from 'zod';
import { Body, Button, Field, Notice, Screen, Title } from '../../src/components/ui';

type SignIn = z.infer<typeof signInSchema>;
const SECTIONS = ['Mes réservations', 'Mes commandes', 'Mes cartes cadeaux', 'Mes favoris', 'Notifications', 'Préférences'];

/** Authentification : formulaire validé, backend Supabase non connecté (phase 4). */
export default function Profile() {
  const { control, handleSubmit, formState: { errors } } = useForm<SignIn>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } });
  const [attempted, setAttempted] = useState(false);
  return (
    <Screen>
      <Title>Mon compte</Title>
      <Body muted style={{ marginTop: 4 }}>Connectez-vous pour retrouver vos cartes cadeaux, commandes et favoris.</Body>
      <View style={{ marginTop: space.lg }}>
        <Controller control={control} name="email" render={({ field }) => (
          <Field label="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />)} />
        <Controller control={control} name="password" render={({ field }) => (
          <Field label="Mot de passe" secureTextEntry autoComplete="password" value={field.value} onChangeText={field.onChange} error={errors.password?.message} />)} />
        {attempted && <Notice>La connexion n'est pas encore disponible : le service d'authentification (Supabase) n'est pas configuré.</Notice>}
        <Button label="Se connecter" onPress={handleSubmit(() => setAttempted(true))} />
      </View>
      <View style={{ marginTop: space.xl }}>
        {SECTIONS.map((label) => (
          <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line, opacity: 0.5 }}>
            <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: colors.brown }}>{label}</Text>
            <Ionicons name="lock-closed-outline" size={16} color={colors.muted} />
          </View>
        ))}
      </View>
    </Screen>
  );
}
