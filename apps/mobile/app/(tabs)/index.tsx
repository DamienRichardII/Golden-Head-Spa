import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BUSINESS } from '@ghs/config';
import { colors, fonts, radii, space } from '@ghs/ui';
import { Body, Button, Card, Reveal, Screen, Title } from '../../src/components/ui';
import { RitualCard } from '../../src/components/RitualCard';
import { IMAGES } from '../../src/data/images';
import { RITUALS } from '../../src/data/rituals';

const QUICK = [
  { label: 'Réserver', icon: 'calendar-outline', href: '/(tabs)/booking' },
  { label: 'Carte cadeau', icon: 'gift-outline', href: '/gift-card' },
  { label: 'Nos soins', icon: 'sparkles-outline', href: '/rituals' },
  { label: 'Boutique', icon: 'bag-outline', href: '/(tabs)/shop' },
] as const;

// Extraits fournis par le client (visuel carte cadeau). Anonymes : à remplacer par des avis vérifiés.
const REVIEW_QUOTES = ['Une expérience inoubliable.', 'Un lieu magique.', 'Un vrai moment de sérénité.', 'Un cadeau parfait.'];

export default function Home() {
  const router = useRouter();
  return (
    <Screen>
      <Reveal>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>GOLDEN</Text>
            <Text style={s.brandSub}>HEAD SPA</Text>
          </View>
          <Pressable accessibilityLabel="Menu" onPress={() => router.push('/menu')} hitSlop={12}>
            <Ionicons name="menu-outline" size={28} color={colors.brown} />
          </Pressable>
        </View>
        <Title style={{ marginTop: space.lg }}>Bonjour,</Title>
        <Body muted>Prenez soin de vous</Body>
      </Reveal>

      <Reveal index={1}>
        <View style={s.hero}>
          <Image source={IMAGES.hero} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['transparent', 'rgba(23,20,17,0.85)']} style={StyleSheet.absoluteFill} />
          <View style={{ padding: space.md }}>
            <Text style={s.heroText}>Offrez-vous{'\n'}un moment d'exception</Text>
            <Button label="Réserver un soin" onPress={() => router.push('/(tabs)/booking')} style={{ alignSelf: 'flex-start', minHeight: 44 }} />
          </View>
        </View>
      </Reveal>

      <Reveal index={2}>
        <View style={s.quick}>
          {QUICK.map((q) => (
            <Link key={q.label} href={q.href} asChild>
              <Pressable accessibilityRole="button" style={s.quickItem}>
                <View style={s.quickIcon}><Ionicons name={q.icon} size={22} color={colors.champagneDark} /></View>
                <Text style={s.quickLabel}>{q.label}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </Reveal>

      <Reveal index={3}>
        <View style={s.sectionHead}>
          <Text style={s.section}>Nos rituels phares</Text>
          <Link href="/rituals"><Text style={s.link}>Voir tout</Text></Link>
        </View>
        {RITUALS.slice(0, 3).map((r) => <RitualCard key={r.id} ritual={r} />)}
      </Reveal>

      <Reveal index={4}>
        <Text style={s.section}>Le premier Head Spa de Compiègne</Text>
        <Card style={{ marginTop: space.sm }}>
          <Body>Spécialisé en massages crâniens profonds : massage crânien, vapeur, soin et sérénité.</Body>
          <Body muted style={{ marginTop: space.sm }}>{BUSINESS.address}</Body>
        </Card>
      </Reveal>

      <Reveal index={5}>
        <Text style={[s.section, { marginTop: space.lg }]}>Ce que disent nos clientes</Text>
        {REVIEW_QUOTES.map((q) => (
          <Card key={q} style={{ marginTop: space.sm }}>
            <Text style={{ color: colors.champagne }} accessibilityLabel="5 étoiles">★★★★★</Text>
            <Body>« {q} »</Body>
          </Card>
        ))}
      </Reveal>
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: fonts.serif, fontSize: 24, color: colors.champagneDark, letterSpacing: 3 },
  brandSub: { fontFamily: fonts.serif, fontSize: 13, color: colors.champagneDark, letterSpacing: 2.5 },
  hero: { height: 220, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end', marginTop: space.md, backgroundColor: colors.black },
  heroText: { fontFamily: fonts.serif, fontSize: 24, color: '#FFF6E4', marginBottom: space.md, lineHeight: 30 },
  quick: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: space.lg },
  quickItem: { alignItems: 'center', width: '23%' },
  quickIcon: { width: 56, height: 56, borderRadius: radii.md, backgroundColor: colors.beige, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.brown, marginTop: 6, textAlign: 'center' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.sm },
  section: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.brown },
  link: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.champagneDark },
});
