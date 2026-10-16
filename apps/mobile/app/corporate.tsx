import { useState } from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@ghs/ui';
import { corporateLeadSchema, type CorporateLeadInput } from '@ghs/validation';
import { Body, Button, Field, Notice, Screen, Title } from '../src/components/ui';

export default function Corporate() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<CorporateLeadInput>({
    resolver: zodResolver(corporateLeadSchema), defaultValues: { company: '', contactName: '', email: '', message: '' },
  });
  const [validated, setValidated] = useState(false);
  return (
    <Screen>
      <Pressable accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12} style={{ marginBottom: space.md }}>
        <Ionicons name="chevron-back" size={24} color={colors.brown} />
      </Pressable>
      <Title>Entreprises & CE</Title>
      <Body muted style={{ marginTop: 4, marginBottom: space.lg }}>Demandez une offre pour vos équipes.</Body>
      <Controller control={control} name="company" render={({ field }) => <Field label="Entreprise / CE" value={field.value} onChangeText={field.onChange} error={errors.company?.message} />} />
      <Controller control={control} name="contactName" render={({ field }) => <Field label="Nom du contact" value={field.value} onChangeText={field.onChange} error={errors.contactName?.message} />} />
      <Controller control={control} name="email" render={({ field }) => <Field label="Email" keyboardType="email-address" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />} />
      <Controller control={control} name="message" render={({ field }) => <Field label="Message (optionnel)" multiline value={field.value ?? ''} onChangeText={field.onChange} error={errors.message?.message} />} />
      {validated && <Notice>Formulaire valide. L'envoi n'est pas encore branché au serveur : aucune demande n'a été transmise.</Notice>}
      <Button label="Envoyer la demande" onPress={handleSubmit(() => setValidated(true))} />
    </Screen>
  );
}
