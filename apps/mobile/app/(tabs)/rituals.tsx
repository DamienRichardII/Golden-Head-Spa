import { useState } from 'react';
import { View } from 'react-native';
import { space } from '@ghs/ui';
import { Chip, Reveal, Screen, ScreenHeader } from '../../src/components/ui';
import { RitualCard } from '../../src/components/RitualCard';
import { CATEGORIES, RITUALS } from '../../src/data/rituals';

/** Onglet « Rituels » (liste filtrable). Le détail reste dans /rituals/[id]. */
export default function Rituals() {
  const [cat, setCat] = useState<string>('all');
  const list = cat === 'all' ? RITUALS : RITUALS.filter((r) => r.category === cat);
  return (
    <Screen>
      <ScreenHeader title="Nos rituels" back={false} subtitle="Une parenthèse hors du temps, à Compiègne." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md }}>
        {CATEGORIES.map((c) => <Chip key={c.key} label={c.label} active={cat === c.key} onPress={() => setCat(c.key)} />)}
      </View>
      {list.map((r, i) => <Reveal key={r.id} index={i}><RitualCard ritual={r} featured={i === 0 && cat === 'all'} /></Reveal>)}
    </Screen>
  );
}
