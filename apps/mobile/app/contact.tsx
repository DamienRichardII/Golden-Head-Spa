import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BUSINESS } from '@ghs/config';
import { colors, space } from '@ghs/ui';
import { Body, Button, Card, Notice, Screen, Title } from '../src/components/ui';
import * as Linking from 'expo-linking';
import { mailTo } from '../src/lib/open';

export default function Contact() {
  const router = useRouter();
  return (
    <Screen>
      <Pressable accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12} style={{ marginBottom: space.md }}>
        <Ionicons name="chevron-back" size={24} color={colors.brown} />
      </Pressable>
      <Title>Contact</Title>
      <Card style={{ marginTop: space.md }}>
        <Body>{BUSINESS.address}</Body>
        <View style={{ height: space.md }} />
        {BUSINESS.hours.map((h) => <Body key={h.days}>{h.days} : {h.close ? `${h.open} – ${h.close}` : h.open}</Body>)}
      </Card>
      <View style={{ marginTop: space.md }}>
        <Button label={`Appeler ${BUSINESS.phone}`} variant="ghost" onPress={() => { void Linking.openURL(`tel:${BUSINESS.phone.replace(/ /g, '')}`); }} style={{ marginBottom: space.sm }} />
        <Button label={BUSINESS.email} onPress={() => { void mailTo(BUSINESS.email); }} />
      </View>
      <Notice>Horaires vus sur Planity (samedi et dimanche à confirmer). Les liens vers les réseaux sociaux seront ajoutés dès leur communication.</Notice>
    </Screen>
  );
}
