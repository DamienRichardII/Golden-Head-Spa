import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, space } from '@ghs/ui';
import { Reveal, Screen, Title } from '../../src/components/ui';
import { RitualCard } from '../../src/components/RitualCard';
import { CATEGORIES, RITUALS } from '../../src/data/rituals';

export default function Rituals() {
  const router = useRouter();
  const [cat, setCat] = useState<string>('all');
  const list = cat === 'all' ? RITUALS : RITUALS.filter((r) => r.category === cat);
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md }}>
        <Pressable accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={24} color={colors.brown} /></Pressable>
        <Title>Nos rituels</Title>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md }}>
        {CATEGORIES.map((c) => {
          const active = cat === c.key;
          return (
            <Pressable key={c.key} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setCat(c.key)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: active ? colors.champagne : colors.beige }}>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: active ? colors.white : colors.brown }}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {list.map((r, i) => <Reveal key={r.id} index={i}><RitualCard ritual={r} /></Reveal>)}
    </Screen>
  );
}
