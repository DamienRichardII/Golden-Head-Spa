import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BUSINESS } from '@ghs/config';
import { colors, fonts, radii, shadow, space } from '@ghs/ui';
import { Body, Button, Card, Reveal, Screen, SectionTitle } from '../../src/components/ui';
import { MusicToggle } from '../../src/components/MusicToggle';
import { DEMO_MODE } from '../../src/store/session';
import { RitualTile } from '../../src/components/RitualCard';
import { IMAGES } from '../../src/data/images';
import { RITUALS } from '../../src/data/rituals';
import { fetchJournal } from '../../src/lib/journal';

const QUICK = [
  { label: 'Nos soins', icon: 'sparkles-outline', href: '/rituals' },
  { label: 'Formation', icon: 'school-outline', href: '/formation' },
  { label: 'Écrire', icon: 'mail-outline', href: '/contact' },
  { label: 'Boutique', icon: 'bag-outline', href: '/(tabs)/shop' },
] as const;

// Extraits fournis par le client (visuel carte cadeau). Anonymes : à remplacer par des avis vérifiés.
const REVIEW_QUOTES = ['Une expérience inoubliable.', 'Un lieu magique.', 'Un vrai moment de sérénité.', 'Un cadeau parfait.'];

export default function Home() {
  const router = useRouter();
  const { data: posts } = useQuery({ queryKey: ['journal'], queryFn: () => fetchJournal(), staleTime: 60_000 });
  const phrase = posts?.find((p) => p.kind === 'phrase');
  return (
    <Screen>
      <Reveal>
        <View style={s.header}>
          <View accessibilityRole="header" accessibilityLabel="Golden Head Spa">
            <Text style={s.brand}>GOLDEN</Text>
            <Text style={s.brandSub}>HEAD SPA</Text>
          </View>
          <View style={s.tools}>
            <MusicToggle />
            <Pressable accessibilityRole="button" accessibilityLabel="Assistant" onPress={() => router.push('/assistant')} style={s.assistant}>
              <Ionicons name="sparkles-outline" size={16} color={colors.champagneDark} />
              <Text style={s.assistantText}>Assistant</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={() => router.push('/menu')} hitSlop={8} style={s.menuBtn}>
              <Ionicons name="menu-outline" size={22} color={colors.brown} />
            </Pressable>
          </View>
        </View>
      </Reveal>

      <Reveal index={1}>
        <View style={s.hero}>
          <Image source={IMAGES.hero} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(14,10,7,0.1)', 'rgba(14,10,7,0.92)']} style={StyleSheet.absoluteFill} />
          <View style={{ padding: space.md }}>
            <Text style={s.heroText}>Bienvenue chez{'\n'}Golden Head Spa</Text>
            <Button label="Réserver mon rituel" onPress={() => router.push('/(tabs)/booking')} style={{ alignSelf: 'flex-start', minHeight: 46 }} />
          </View>
        </View>
      </Reveal>

      <Reveal index={2}>
        <SectionTitle action="Voir tout" onAction={() => router.push('/rituals')}>Nos rituels</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm + 2, paddingRight: space.md }} style={{ marginHorizontal: -space.md, paddingLeft: space.md }}>
          {RITUALS.filter((r) => r.category === 'head-spa').map((r) => <RitualTile key={r.id} ritual={r} />)}
        </ScrollView>
      </Reveal>

      <Reveal index={3}>
        {phrase && (
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/journal')} style={s.phrase}>
            <Ionicons name="leaf-outline" size={18} color={colors.champagne} />
            <Text style={s.phraseText} numberOfLines={3}>{phrase.body}</Text>
          </Pressable>
        )}
        {DEMO_MODE && (
          <Pressable accessibilityRole="button" onPress={() => router.push('/offers')} style={[s.flash, shadow.glow]}>
            <Ionicons name="flash-outline" size={22} color={colors.champagneDark} />
            <View style={{ flex: 1 }}><Text style={s.flashTitle}>Offres flash</Text><Text style={s.flashSub}>Réservées aux membres de l'application</Text></View>
            <Ionicons name="chevron-forward" size={18} color={colors.champagneDark} />
          </Pressable>
        )}
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

      <Reveal index={4}>
        <SectionTitle>Le premier Head Spa de Compiègne</SectionTitle>
        <Card>
          <Body>Spécialisé en massages crâniens profonds : massage crânien, vapeur, soin et sérénité.</Body>
          <View style={s.addr}>
            <Ionicons name="location-outline" size={16} color={colors.champagneDark} />
            <Body muted style={{ flex: 1 }}>{BUSINESS.address}</Body>
          </View>
        </Card>
      </Reveal>

      <Reveal index={5}>
        <SectionTitle>Ce que disent nos clientes</SectionTitle>
        {REVIEW_QUOTES.map((q) => (
          <Card key={q} style={{ marginBottom: space.sm }}>
            <Text style={{ color: colors.champagne, letterSpacing: 2 }} accessibilityLabel="5 étoiles">★★★★★</Text>
            <Text style={s.quote}>« {q} »</Text>
          </Card>
        ))}
      </Reveal>
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: fonts.serif, fontSize: 24, color: colors.champagne, letterSpacing: 3 },
  brandSub: { fontFamily: fonts.serif, fontSize: 13, color: colors.champagne, letterSpacing: 2.5 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 },
  assistant: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 12, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(34,25,17,0.6)' },
  assistantText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown },
  menuBtn: { width: 38, height: 38, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(34,25,17,0.6)', alignItems: 'center', justifyContent: 'center' },
  hero: { height: 300, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end', marginTop: space.lg, backgroundColor: colors.black, borderWidth: 1, borderColor: colors.line },
  heroText: { fontFamily: fonts.serif, fontSize: 32, color: '#FFF6E4', marginBottom: space.md, lineHeight: 38 },
  quick: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: space.lg },
  quickItem: { alignItems: 'center', width: '23%' },
  quickIcon: { width: 56, height: 56, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.brown, marginTop: 6, textAlign: 'center' },
  flash: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.surface, borderRadius: radii.lg, padding: space.md, marginTop: space.md, borderWidth: 1, borderColor: colors.champagne },
  phrase: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, backgroundColor: colors.surface, borderRadius: radii.lg, padding: space.md, marginTop: space.md, borderWidth: 1, borderColor: colors.line },
  phraseText: { flex: 1, fontFamily: fonts.serif, fontSize: 19, lineHeight: 25, color: colors.brown },
  flashTitle: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.brown },
  flashSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  addr: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: space.sm },
  quote: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, color: colors.brown, marginTop: 4 },
});
