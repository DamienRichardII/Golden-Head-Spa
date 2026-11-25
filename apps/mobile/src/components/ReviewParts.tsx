import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, space } from '@ghs/ui';
import { SOURCE_LABEL, starName, type ExternalReview, type ReviewSource } from '../lib/externalReviews';
import { Body, Card } from './ui';

export const Stars = ({ value, size = 16 }: { value: number; size?: number }) => (
  <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${String(value).replace('.', ',')} étoiles sur 5`}>
    {[1, 2, 3, 4, 5].map((n) => <Ionicons key={n} name={starName(n, value)} size={size} color={colors.champagne} />)}
  </View>
);

/** Pastille indiquant d'où vient l'avis (Google, Planity ou application). */
export const SourceBadge = ({ source }: { source: ReviewSource | 'app' }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.champagne, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
    {source === 'google' && <Ionicons name="logo-google" size={12} color={colors.champagne} />}
    <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: colors.champagne }}>{source === 'app' ? "Avis de l'application" : SOURCE_LABEL[source]}</Text>
  </View>
);

/** Carte d'un avis Google / Planity : étoiles, note, pastille de source, texte, auteur et date. */
export const ExternalReviewCard = ({ r, lines }: { r: ExternalReview; lines?: number }) => (
  <Card style={{ marginBottom: space.sm }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Stars value={r.rating} />
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.champagne }}>{r.rating.toFixed(1).replace('.', ',')}</Text>
      </View>
      <SourceBadge source={r.source} />
    </View>
    <Body numberOfLines={lines} style={{ marginTop: space.sm }}>{r.text}</Body>
    {(r.author || r.date) && <Body muted style={{ fontSize: 13, marginTop: 6 }}>{[r.author, r.date].filter(Boolean).join(' · ')}</Body>}
  </Card>
);
