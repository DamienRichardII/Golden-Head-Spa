import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

/**
 * Eau animée sur la photo d'accueil : de fines gouttes de lumière parcourent les jets de l'arche
 * (de l'arche vers la chevelure), comme de l'eau qui coule. La photo reste la même ; seule une
 * couche transparente est animée par-dessus. Désactivée si « réduire les animations » est activé.
 *
 * Les coordonnées sont celles de la photo d'origine (1290 × 1225 px) : centre des jets et longueur
 * des jets selon l'angle. La couche suit le recadrage « cover » du conteneur.
 */
const IMG_W = 1290;
const IMG_H = 1225;
const CX = 650;
const CY = 715;
const STRANDS = 27;
const SPAN = 96; // degrés de part et d'autre de la verticale
const INNER = 70; // distance où la goutte disparaît (près de la chevelure), px image
const PERIOD = 2600;

/** Longueur d'un jet (px image) : plus courte au sommet de l'arche, plus longue sur les côtés. */
const lengthAt = (deg: number) => 345 + 110 * (1 - Math.cos((deg * Math.PI) / 180));

function Drop({ deg, len, phase, scale, progress }: { deg: number; len: number; phase: number; scale: number; progress: { value: number } }) {
  const box = 2 * 470 * scale;
  const half = box / 2;
  const w = Math.max(2, 3.2 * scale);
  const h = Math.max(14, 46 * scale);
  const style = useAnimatedStyle(() => {
    const q = (progress.value + phase) % 1;
    const r = len * scale - q * (len - INNER) * scale; // de l'extérieur vers l'intérieur
    return { opacity: Math.sin(Math.PI * q) * 0.95, transform: [{ translateY: half - r - h / 2 - half }] };
  });
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: box, height: box, transform: [{ rotate: `${deg}deg` }] }}>
      <Animated.View style={[{ position: 'absolute', left: half - w / 2, top: half, width: w, height: h }, style]}>
        <LinearGradient colors={['rgba(255,236,190,0)', 'rgba(255,240,205,0.95)']} style={{ flex: 1, borderRadius: w }} />
      </Animated.View>
    </View>
  );
}

export function WaterJets() {
  const reduce = useReducedMotion();
  const progress = useSharedValue(0);
  const [size, setSize] = useState<{ w: number; h: number } | undefined>();

  useEffect(() => {
    if (reduce) return;
    progress.value = 0;
    progress.value = withRepeat(withTiming(1, { duration: PERIOD, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(progress);
  }, [reduce, progress]);

  const strands = useMemo(
    () => Array.from({ length: STRANDS }, (_, i) => {
      const deg = -SPAN + (i * 2 * SPAN) / (STRANDS - 1);
      // Phase déterministe, irrégulière : l'écoulement ne paraît pas mécanique.
      const phase = ((i * 0.618) % 1);
      return { deg, len: lengthAt(deg), phase };
    }),
    [],
  );

  if (reduce) return null;
  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const scale = size ? Math.max(size.w / IMG_W, size.h / IMG_H) : 0;
  const ox = size ? (size.w - IMG_W * scale) / 2 : 0;
  const oy = size ? (size.h - IMG_H * scale) / 2 : 0;
  const box = 2 * 470 * scale;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {size && (
        <View style={{ position: 'absolute', left: ox + CX * scale - box / 2, top: oy + CY * scale - box / 2, width: box, height: box }}>
          {strands.map((st) => <Drop key={st.deg} deg={st.deg} len={st.len} phase={st.phase} scale={scale} progress={progress} />)}
        </View>
      )}
    </View>
  );
}
