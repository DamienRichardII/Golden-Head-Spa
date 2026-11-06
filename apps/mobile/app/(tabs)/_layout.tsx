import { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@ghs/ui';

const icon = (name: keyof typeof Ionicons.glyphMap) => {
  const TabIcon = ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} size={size} color={color as string} />;
  return TabIcon;
};

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      sceneStyle: { backgroundColor: colors.ivory },
      tabBarActiveTintColor: colors.champagne,
      tabBarInactiveTintColor: colors.muted,
      tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
      tabBarStyle: { backgroundColor: colors.black, borderTopColor: colors.line },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="rituals" options={{ title: 'Rituels', tabBarIcon: icon('flower-outline') }} />
      <Tabs.Screen name="booking" options={{ title: 'Réservation', tabBarIcon: icon('calendar-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('person-outline') }} />
      <Tabs.Screen name="shop" options={{ href: null, title: 'Boutique' }} />
    </Tabs>
  );
}
