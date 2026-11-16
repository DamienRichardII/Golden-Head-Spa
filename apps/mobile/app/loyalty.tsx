import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, radii, space } from '@ghs/ui';
import { Body, Button, Card, Notice, Screen, ScreenHeader } from '../src/components/ui';
import { LOYALTY_TIERS } from '../src/lib/loyalty';

/** Programme Fidélité : information publique. La remise est appliquée par l'institut en cabinet, au moment du règlement. */
export default function Loyalty() {
  const router = useRouter();
  return (
    <Screen>
      <ScreenHeader title="Programme Fidélité" subtitle="Plus vous revenez, plus nous vous remercions." />
      <Card>
        {LOYALTY_TIERS.map((t, i, a) => (
          <View key={t.visit} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: i === a.length - 1 ? 0 : 1, borderBottomColor: colors.line }}>
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: colors.brown }}>{t.visit}e rendez-vous{i === a.length - 1 ? ' et suivants' : ''}</Text>
            <Text style={{ fontFamily: fonts.sansSemi, fontSize: 15, color: colors.onGold, backgroundColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 4, overflow: 'hidden' }}>−{t.percent} %</Text>
          </View>
        ))}
      </Card>
      <Body muted style={{ marginTop: space.md }}>Votre fidélité est suivie par l'institut à partir de vos rendez-vous. La remise est déduite directement lors de votre passage au cabinet.</Body>
      <Notice>Les rendez-vous annulés ne sont pas comptés.</Notice>
      <Button label="Prendre un rendez-vous" onPress={() => router.push('/(tabs)/booking')} style={{ marginTop: space.lg }} />
    </Screen>
  );
}
