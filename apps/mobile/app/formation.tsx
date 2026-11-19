import { useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { BUSINESS } from '@ghs/config';
import { colors, fonts, space } from '@ghs/ui';
import { Body, Button, Card, Field, Notice, Screen, ScreenHeader, SectionTitle } from '../src/components/ui';
import { mailTo } from '../src/lib/open';

const COVER = require('../assets/images/academie.jpg');

/** Sommaire de la Golden Académie, tel que fourni par l'institut (PDF du 15/11/2026). Le détail des modules reste réservé aux élèves. */
const MODULES = [
  'Le Head Spa',
  'Les bienfaits',
  'Le cheveu',
  'Les étapes du soin',
  'Les massages',
  'Les muscles',
  'Les accessoires',
  '3 protocoles Golden',
  'Les différentes pathologies',
  "L'auto-entrepreneuriat",
  'Se faire connaître',
  'Fournisseurs',
] as const;

/**
 * Golden Académie : présentation publique (visuel, promesse, sommaire des 12 modules) + demande d'information par mail.
 * Aucun tarif ni date n'est affiché : ils n'ont pas été communiqués. Le formulaire ouvre la messagerie de la personne
 * avec un message pré-rempli ; rien n'est envoyé par l'application elle-même.
 */
export default function Formation() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [msg, setMsg] = useState('');
  const send = () => {
    const body = [`Nom : ${name.trim() || '—'}`, `Email : ${from.trim() || '—'}`, '', msg.trim() || 'Je suis intéressée par la Golden Académie.'].join('\n');
    void mailTo(BUSINESS.email, { subject: "Demande d'information – Golden Académie", body });
  };
  return (
    <Screen>
      <ScreenHeader title="Golden Académie" subtitle="Plus qu'une formation, la clé d'une réussite" />
      <View style={{ height: 220, borderRadius: 16, overflow: 'hidden', marginBottom: space.md }}>
        <Image source={COVER} contentFit="cover" contentPosition="center" style={{ width: '100%', height: '100%' }} accessibilityLabel="Soin head spa : l'eau tombe sur les cheveux" />
      </View>
      <Card>
        <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.brown }}>12 modules complets & vidéos</Text>
        <Body style={{ marginTop: space.xs }}>Avec des protocoles clés en main.</Body>
        <Body muted style={{ marginTop: space.sm }}>Tous nos secrets révélés.</Body>
      </Card>
      <SectionTitle>Au programme</SectionTitle>
      <Card>
        {MODULES.map((title, i) => (
          <View key={title} style={{ flexDirection: 'row', paddingVertical: 6, gap: space.sm }}>
            <Text style={{ fontFamily: fonts.serif, color: colors.champagne, width: 76 }}>Module {i + 1}</Text>
            <Body style={{ flex: 1 }}>{title}</Body>
          </View>
        ))}
      </Card>
      <Card style={{ marginTop: space.md }}>
        <Body>Vous êtes déjà inscrite à la Golden Académie ?</Body>
        <Button label="Accéder à mes modules" onPress={() => router.push('/academie')} style={{ marginTop: space.sm }} />
      </Card>
      <SectionTitle>Intéressée ?</SectionTitle>
      <Body muted style={{ marginBottom: space.sm }}>Envoyez-nous un mail : l'équipe vous répondra personnellement avec le programme, les dates et les tarifs.</Body>
      <Field label="Nom et prénom" autoComplete="name" value={name} onChangeText={setName} />
      <Field label="Votre email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={from} onChangeText={setFrom} />
      <Field label="Votre message (optionnel)" multiline value={msg} onChangeText={setMsg} />
      <View style={{ paddingBottom: 120 }}>
        <Button label="Envoyer ma demande par mail" onPress={send} />
        <Notice>Ce bouton ouvre votre messagerie avec un message prêt à envoyer à {BUSINESS.email}.</Notice>
      </View>
    </Screen>
  );
}
