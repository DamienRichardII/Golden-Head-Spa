import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@ghs/ui';
import { hasAmbient, toggleAmbient, useAmbient } from '../lib/ambient';

/** Visible uniquement lorsqu'une musique est configurée (pas de bouton mort). */
export function MusicToggle({ color = colors.brown }: { color?: string }) {
  const playing = useAmbient((s) => s.playing);
  if (!hasAmbient) return null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={playing ? 'Couper la musique' : 'Activer la musique'} onPress={() => { void toggleAmbient(); }} hitSlop={12}>
      <Ionicons name={playing ? 'volume-high-outline' : 'volume-mute-outline'} size={24} color={color} />
    </Pressable>
  );
}
