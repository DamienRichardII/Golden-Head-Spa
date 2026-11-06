import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, space } from '@ghs/ui';
import { Body, Button, Card, EmptyState, Notice, Reveal, Screen, Title } from '../src/components/ui';
import { useSession } from '../src/store/session';
import { demoOffers, formatRemaining, type FlashOffer } from '../src/data/offers';
import { getRitual } from '../src/data/rituals';

function Countdown({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return <Text accessibilityLabel={`Temps restant ${formatRemaining(endsAt - now)}`} style={{ fontFamily: fonts.sansSemi, color: colors.champagneDark, fontSize: 15 }}>⏳ {formatRemaining(endsAt - now)}</Text>;
}

function OfferCard({ offer }: { offer: FlashOffer }) {
  const router = useRouter();
  const ritual = offer.ritualId ? getRitual(offer.ritualId) : undefined;
  return (
    <Card style={{ marginBottom: space.md }}>
      {offer.demo && <Text style={{ alignSelf: 'flex-start', backgroundColor: colors.beige, color: colors.brown, fontFamily: fonts.sansSemi, fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill, marginBottom: 6 }}>DÉMO</Text>}
      <Text style={{ fontFamily: fonts.serifSemi, fontSize: 22, color: colors.brown }}>-{offer.discountPercent} % · {offer.title}</Text>
      <Body muted style={{ marginTop: 4 }}>{offer.description}</Body>
      {ritual && <Body style={{ marginTop: 4 }}>{ritual.name} · {ritual.priceEur} €</Body>}
      <View style={{ marginVertical: space.sm }}><Countdown endsAt={offer.endsAt} /></View>
      {offer.code && <Body>Code : <Text style={{ fontFamily: fonts.sansSemi }}>{offer.code}</Text></Body>}
      <Button label="Réserver" onPress={() => router.push({ pathname: '/(tabs)/booking', params: ritual ? { ritual: ritual.id } : {} })} style={{ marginTop: space.sm }} />
    </Card>
  );
}

export default function Offers() {
  const router = useRouter();
  const isMember = useSession((s) => s.isMember);
  const offers = useMemo(() => demoOffers(), []);
  return (
    <Screen>
      <Pressable accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12} style={{ marginBottom: space.md }}>
        <Ionicons name="chevron-back" size={24} color={colors.brown} />
      </Pressable>
      <Title>Offres flash</Title>
      <Body muted style={{ marginTop: 4 }}>Des offres éphémères réservées aux membres de l'application.</Body>
      {!isMember ? (
        <>
          <EmptyState title="Réservé aux membres" text="Connectez-vous pour découvrir les offres flash en cours." />
          <Button label="Se connecter" onPress={() => router.push('/(tabs)/profile')} />
        </>
      ) : (
        <View style={{ marginTop: space.md }}>
          <Notice>Mode démo : ces offres sont des exemples. Les offres réelles seront créées par Golden Head Spa et lues depuis Supabase.</Notice>
          {offers.map((o, i) => <Reveal key={o.id} index={i}><OfferCard offer={o} /></Reveal>)}
        </View>
      )}
    </Screen>
  );
}
