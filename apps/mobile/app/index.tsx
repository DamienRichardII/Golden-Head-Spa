import { useEffect, useState } from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, { FadeIn, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, space } from '@ghs/ui';
import { Button } from '../src/components/ui';
import { hasAmbient, startAmbient } from '../src/lib/ambient';

const FIRST = require('../assets/images/opening-first.jpg');
const POSTER = require('../assets/images/opening-poster.jpg');
const VIDEO = require('../assets/video/opening.mp4');

/**
 * Entrée immersive : vidéo d'ouverture (eau qui coule, vapeur, logo) jouée une seule fois, muette,
 * puis maintien sur la dernière image. Le bouton « Commencer » est disponible tout de suite (pas d'attente imposée).
 * Mouvement réduit, erreur de lecture ou vidéo indisponible : image finale fixe, navigation inchangée.
 * La musique de détente ne démarre qu'au toucher (les navigateurs bloquent l'autoplay).
 */
export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const staticMode = reduce || failed;
  const rm = ReduceMotion.System;

  const player = useVideoPlayer(VIDEO, (p) => {
    p.loop = false;
    p.muted = true;
  });

  useEffect(() => {
    if (staticMode) return;
    const sub = player.addListener('statusChange', ({ status }) => { if (status === 'error') setFailed(true); });
    try { player.play(); } catch { queueMicrotask(() => setFailed(true)); }
    return () => sub.remove();
  }, [player, staticMode]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.black, overflow: 'hidden' }}>
      <Image source={staticMode ? POSTER : FIRST} resizeMode="cover" style={s.fill} accessible={false} />
      {!staticMode && (
        <VideoView
          player={player}
          nativeControls={false}
          contentFit="cover"
          allowsPictureInPicture={false}
          style={s.fill}
          accessibilityLabel="Golden Head Spa"
        />
      )}
      <LinearGradient pointerEvents="none" colors={['rgba(23,20,17,0)', 'rgba(23,20,17,0)', 'rgba(23,20,17,0.85)']} style={StyleSheet.absoluteFill} />
      <View pointerEvents="box-none" style={[s.wrap, { paddingBottom: insets.bottom + space.lg }]}>
        <Animated.View entering={FadeIn.delay(600).duration(1200).reduceMotion(rm)}>
          <Text style={s.values}>Détente  ·  Beauté  ·  Raffinement</Text>
          <Button label="Commencer" onPress={() => { void startAmbient(); router.replace('/(tabs)'); }} />
          {hasAmbient && <Text style={s.hint}>Une musique de détente accompagne votre visite</Text>}
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  wrap: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: space.lg },
  values: { fontFamily: fonts.sans, color: '#F3E9D6', textAlign: 'center', marginBottom: space.lg, fontSize: 13, letterSpacing: 1 },
  hint: { fontFamily: fonts.sans, color: '#D9CDB8', textAlign: 'center', fontSize: 12, marginTop: space.md },
});
