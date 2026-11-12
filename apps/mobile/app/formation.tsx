import { useState } from 'react';
import { View } from 'react-native';
import { BUSINESS } from '@ghs/config';
import { space } from '@ghs/ui';
import { Body, Button, Card, Field, Notice, Screen, ScreenHeader, SectionTitle } from '../src/components/ui';
import { mailTo } from '../src/lib/open';

/**
 * Espace formation : page prête, contenu à fournir par Golden Head Spa (programme, dates, tarifs, lieu).
 * Aucun contenu n'est inventé : le formulaire ouvre simplement l'application de messagerie de la personne,
 * avec un message pré-rempli adressé à l'institut. Rien n'est envoyé par l'application elle-même.
 */
export default function Formation() {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [msg, setMsg] = useState('');
  const send = () => {
    const body = [`Nom : ${name.trim() || '—'}`, `Email : ${from.trim() || '—'}`, '', msg.trim() || "Je souhaite recevoir des informations sur vos formations."].join('\n');
    void mailTo(BUSINESS.email, { subject: 'Demande d\'information – Formation', body });
  };
  return (
    <Screen>
      <ScreenHeader title="Formation" subtitle="L'art du Head Spa, transmis par l'institut" />
      <Card>
        <Body>Le programme, les dates et les tarifs de nos formations seront communiqués très prochainement.</Body>
        <Body muted style={{ marginTop: space.sm }}>Laissez-nous votre demande : l'équipe vous répondra personnellement par mail.</Body>
      </Card>
      <SectionTitle>Être informé(e)</SectionTitle>
      <Field label="Nom et prénom" autoComplete="name" value={name} onChangeText={setName} />
      <Field label="Votre email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={from} onChangeText={setFrom} />
      <Field label="Votre message (optionnel)" multiline value={msg} onChangeText={setMsg} />
      <View>
        <Button label="Envoyer ma demande par mail" onPress={send} />
        <Notice>Ce bouton ouvre votre messagerie avec un message prêt à envoyer à {BUSINESS.email}.</Notice>
      </View>
    </Screen>
  );
}
