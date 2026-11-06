import { useEffect, useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, shadow, space } from '@ghs/ui';
import { Body, Button, Notice, Reveal, Screen, ScreenHeader } from '../src/components/ui';
import { useSession } from '../src/store/session';
import { IMAGES } from '../src/data/images';
import { demoOffers, formatRemaining, type FlashOffer } from '../src/data/offers';
import { formatDuration, formatPrice, getRitual } from '../src/data/rituals';

function Countdown({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return (
    <View style={s.countdown}>
      <Ionicons name="time-outline" size={16} color={colors.champagneDark} />
      <Text accessibilityLabel={`Temps restant ${formatRemaining(endsAt - now)}`} style={s.countdownText}>Plus que {formatRemaining(endsAt - now)}</Text>
    </View>
  );
}

function OfferCard({ offer }: { offer: FlashOffer }) {
  const router = useRouter();
  const ritual = offer.ritualId ? getRitual(offer.ritualId) : undefined;
  return (
    <View style={[s.offer, shadow.card]}>
      <Image source={IMAGES.hero} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(14,10,7,0.35)', 'rgba(14,10,7,0.95)']} style={StyleSheet.absoluteFill} />
      <View style={{ padding: space.md }}>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <Text style={s.badge}>-{offer.discountPercent} %</Text>
          {offer.demo && <Text style={s.demo}>DÉMO</Text>}
        </View>
        <Text style={s.offerTitle}>{offer.title}</Text>
        {offer.description ? <Body muted style={{ marginTop: 2 }}>{offer.description}</Body> : null}
        {ritual && <Body style={{ marginTop: 4 }}>{ritual.name} · {formatDuration(ritual.durationMin)} · {formatPrice(ritual.priceEur)}</Body>}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md, gap: space.sm }}>
          <Countdown endsAt={offer.endsAt} />
          <Button label="Réserver" onPress={() => router.push({ pathname: '/(tabs)/booking', params: ritual ? { ritual: ritual.id } : {} })} style={{ minHeight: 42, paddingHorizontal: space.lg }} />
        </View>
        {offer.code && <Body muted style={{ marginTop: space.sm }}>Code : <Text style={{ fontFamily: fonts.sansSemi, color: colors.brown }}>{offer.code}</Text></Body>}
      </View>
    </View>
  );
}

/** Aperçu flouté (décor) des offres derrière le panneau verrouillé : aucune offre réelle n'est affichée aux non-membres. */
function LockedPreview() {
  const router = useRouter();
  return (
    <View style={{ marginTop: space.md }}>
      {[0, 1].map((i) => (
        <View key={i} style={[s.offer, { height: 170, opacity: 0.28 }]}>
          <Image source={IMAGES.hero} contentFit="cover" contentPosition="center" blurRadius={18} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(14,10,7,0.4)', 'rgba(14,10,7,0.9)']} style={StyleSheet.absoluteFill} />
        </View>
      ))}
      <View style={s.lockPanel}>
        <Ionicons name="lock-closed" size={34} color={colors.champagne} />
        <Text style={s.lockTitle}>Réservé aux membres</Text>
        <Body muted style={{ textAlign: 'center', marginVertical: space.sm }}>Connectez-vous pour découvrir les offres flash en cours.</Body>
        <Button label="Se connecter" onPress={() => router.push('/(tabs)/profile')} style={{ alignSelf: 'stretch' }} />
      </View>
    </View>
  );
}

export default function Offers() {
  const isMember = useSession((st) => st.isMember);
  const offers = useMemo(() => demoOffers(), []);
  return (
    <Screen>
      <ScreenHeader title="Offres flash" />
      <View style={s.sub}>
        <Ionicons name="lock-closed-outline" size={15} color={colors.champagneDark} />
        <Text style={s.subText}>Réservé aux membres</Text>
        <Text style={s.tag}>Exclusif app</Text>
      </View>
      {!isMember ? <LockedPreview /> : (
        <View style={{ marginTop: space.md }}>
          <Notice>Mode démo : ces offres sont des exemples. Les offres réelles seront créées par Golden Head Spa et lues depuis Supabase.</Notice>
          {offers.map((o, i) => <Reveal key={o.id} index={i}><OfferCard offer={o} /></Reveal>)}
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  sub: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.brown },
  tag: { fontFamily: fonts.sansSemi, fontSize: 11, color: colors.champagneDark, borderWidth: 1, borderColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2, overflow: 'hidden' },
  offer: { borderRadius: radii.lg, overflow: 'hidden', marginBottom: space.md, backgroundColor: colors.black, borderWidth: 1, borderColor: colors.line, justifyContent: 'flex-end' },
  badge: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.onGold, backgroundColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4, overflow: 'hidden' },
  demo: { fontFamily: fonts.sansSemi, fontSize: 11, color: colors.brown, borderWidth: 1, borderColor: colors.line, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  offerTitle: { fontFamily: fonts.serifSemi, fontSize: 28, color: colors.brown, marginTop: space.sm },
  countdown: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  countdownText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.champagneDark },
  lockPanel: { position: 'absolute', left: space.md, right: space.md, top: 60, alignItems: 'center', padding: space.lg, borderRadius: radii.lg, backgroundColor: 'rgba(24,17,11,0.94)', borderWidth: 1, borderColor: colors.champagne, ...shadow.glow },
  lockTitle: { fontFamily: fonts.serifSemi, fontSize: 26, color: colors.brown, marginTop: space.sm },
});
