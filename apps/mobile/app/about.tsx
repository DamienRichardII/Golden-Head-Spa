import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BUSINESS } from '@ghs/config';
import { colors, space } from '@ghs/ui';
import { Body, Card, Notice, Screen, Title } from '../src/components/ui';

export default function About() {
  const router = useRouter();
  return (
    <Screen>
      <Pressable accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12} style={{ marginBottom: space.md }}>
        <Ionicons name="chevron-back" size={24} color={colors.brown} />
      </Pressable>
      <Title>À propos</Title>
      <Body style={{ marginTop: space.md }}>Golden Head Spa est le premier Head Spa de Compiègne, spécialisé en massages crâniens profonds. Fondé par {BUSINESS.founder}.</Body>
      <Card style={{ marginTop: space.md }}><Body>{BUSINESS.address}</Body></Card>
      <Notice>La présentation détaillée du cabinet privé (textes et photographies) sera fournie par Golden Head Spa.</Notice>
    </Screen>
  );
}
