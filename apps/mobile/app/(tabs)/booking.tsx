import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, fonts, radii, space } from '@ghs/ui';
import { Body, Button, Card, Notice, Reveal, Screen, Title } from '../../src/components/ui';
import { formatDuration, formatPrice, getRitual, RITUALS } from '../../src/data/rituals';
import { isPlanityConfigured, openPlanity } from '../../src/lib/open';

/**
 * Réservation : aucune disponibilité n'est simulée. Le site utilise Planity et aucune API officielle
 * n'est confirmée : l'app prépare le choix du soin puis redirige vers le parcours Planity officiel.
 */
export default function Booking() {
  const { ritual: preselected } = useLocalSearchParams<{ ritual?: string }>();
  const [selected, setSelected] = useState<string | undefined>(preselected && getRitual(preselected) ? preselected : undefined);
  const ritual = selected ? getRitual(selected) : undefined;
  const configured = isPlanityConfigured();

  return (
    <Screen>
      <Title>Réserver un soin</Title>
      <Body muted style={{ marginTop: 4 }}>1. Choisissez votre soin · 2. Date, créneau et confirmation sur Planity</Body>

      <View style={{ marginTop: space.md }}>
        {RITUALS.map((r, i) => {
          const active = r.id === selected;
          return (
            <Reveal key={r.id} index={i}>
              <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => setSelected(r.id)}
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
      </View>

      <Card style={{ marginTop: space.md }}>
        <Body>{ritual ? `${ritual.name} · ${formatDuration(ritual.durationMin)} · ${formatPrice(ritual.priceEur)}` : 'Sélectionnez un soin pour continuer.'}</Body>
      </Card>

      {!configured && (
        <Notice>Le lien de réservation Planity officiel n'est pas encore configuré. Il doit être fourni par Golden Head Spa.</Notice>
      )}
      <Button label="Continuer sur Planity" disabled={!ritual || !configured} onPress={() => { void openPlanity(); }} />
      <Body muted style={{ marginTop: space.md, fontSize: 12 }}>
        Les rendez-vous sont gérés sur Planity, qui reste la source de vérité des disponibilités.
      </Body>
    </Screen>
  );
}
