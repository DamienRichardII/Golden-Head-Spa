import { Pressable, Text } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, space } from '@ghs/ui';
import { Button, Screen } from '../src/components/ui';

const ITEMS = [
  { label: 'Accueil', href: '/(tabs)' },
  { label: 'Nos rituels', href: '/rituals' },
  { label: 'Carte cadeau', href: '/gift-card' },
  { label: 'Boutique', href: '/(tabs)/shop' },
  { label: 'Entreprises & CE', href: '/corporate' },
  { label: 'Notre cabinet privé', href: '/about' },
  { label: 'À propos', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export default function Menu() {
  const router = useRouter();
  return (
    <Screen dark>
      <Pressable accessibilityLabel="Fermer" onPress={() => router.back()} hitSlop={12} style={{ alignSelf: 'flex-end' }}>
        <Ionicons name="close" size={28} color={colors.champagne} />
      </Pressable>
      <Text style={{ fontFamily: fonts.serif, fontSize: 36, color: colors.champagne, letterSpacing: 3 }}>GOLDEN</Text>
      <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.champagne, letterSpacing: 3, marginBottom: space.xl }}>HEAD SPA</Text>
      {ITEMS.map((i) => (
        <Link key={i.label} href={i.href} replace asChild>
          <Pressable accessibilityRole="link" style={{ paddingVertical: 12 }}>
            <Text style={{ fontFamily: fonts.sans, fontSize: 18, color: '#F3E9D6' }}>{i.label}</Text>
          </Pressable>
        </Link>
      ))}
      <Button label="Prendre rendez-vous" onPress={() => router.replace('/(tabs)/booking')} style={{ marginTop: space.xl }} />
    </Screen>
  );
}
