import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
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
const ARCH = require('../assets/images/hero.jpg');

/**
 * Vidéo d'ouverture désactivée par défaut : la version actuelle (générée) montre une vasque et non l'arche d'eau, et le nom
 * n'apparaît qu'à la fin. On affiche à la place la vraie photo de l'arche avec le nom tout de suite. Passer à `true` pour
 * rejouer la vidéo (code conservé) quand la nouvelle vidéo « arche d'eau » sera prête.
 */
const USE_VIDEO = false;

/** Si la lecture n'a pas démarré après ce délai (autoplay bloqué, économie d'énergie iOS…), on affiche l'image finale fixe. */
const START_TIMEOUT_MS = 3500;
/** Format de la vidéo (largeur / hauteur) et part de largeur qui doit toujours rester visible (le logo en occupe ~64 %). */
const VIDEO_RATIO = 2 / 3;
const SAFE_WIDTH = 0.8;

/**
 * Cadre de la vidéo selon l'écran : plein écran « cover » sur les téléphones courants ; sur les écrans très allongés
 * (ratio < 0,5) la vidéo est calée en bas et réduite pour que le logo ne soit jamais rogné sur les côtés.
 */
function videoBox(w: number, h: number) {
  const r = w / h;
  if (r < 0.5) {
    const boxW = w / SAFE_WIDTH;
    return { width: boxW, height: boxW / VIDEO_RATIO, left: (w - boxW) / 2, top: h - boxW / VIDEO_RATIO, safe: true };
  }
  if (r >= VIDEO_RATIO) { const boxH = w / VIDEO_RATIO; return { width: w, height: boxH, left: 0, top: (h - boxH) / 2, safe: false }; }
  const boxW = h * VIDEO_RATIO;
  return { width: boxW, height: h, left: (w - boxW) / 2, top: 0, safe: false };
}

/**
 * Entrée immersive : vidéo d'ouverture (eau qui coule, vapeur, logo) jouée une seule fois, muette, en ligne (playsInline,
 * indispensable sur iPhone), puis maintien sur la dernière image. Le bouton « Commencer » est disponible tout de suite.
 * Mouvement réduit, erreur, lecture bloquée ou vidéo indisponible : image finale fixe, navigation inchangée.
 * La musique de détente ne démarre qu'au toucher (les navigateurs bloquent l'autoplay).
 */
export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const staticMode = !USE_VIDEO || reduce || failed;
  const rm = ReduceMotion.System;
  const box = videoBox(width, height);

  const player = useVideoPlayer(VIDEO, (p) => {
    p.loop = false;
    p.muted = true;
  });

  useEffect(() => {
    if (staticMode) return;
    const status = player.addListener('statusChange', ({ status: st }) => { if (st === 'error') setFailed(true); });
    // L'événement « play » part dès la demande de lecture, même si rien ne démarre : on vérifie que la vidéo avance vraiment.
    const timer = setTimeout(() => { if (player.currentTime < 0.05) setFailed(true); }, START_TIMEOUT_MS);
    try { player.play(); } catch { queueMicrotask(() => setFailed(true)); }
    return () => { clearTimeout(timer); status.remove(); };
  }, [player, staticMode]);

  const frame = { position: 'absolute' as const, left: box.left, top: box.top, width: box.width, height: box.height };

  return (
    <View style={{ flex: 1, backgroundColor: colors.black, overflow: 'hidden' }}>
      {USE_VIDEO ? (
        <Image source={staticMode ? POSTER : FIRST} resizeMode="cover" style={frame} accessible={false} />
      ) : (
        <Image source={ARCH} resizeMode="cover" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }} accessible={false} />
      )}
      {!staticMode && (
        <VideoView
          player={player}
          nativeControls={false}
          contentFit="cover"
          allowsPictureInPicture={false}
          playsInline
          style={frame}
          accessibilityLabel="Golden Head Spa"
        />
      )}
      {box.safe && <LinearGradient pointerEvents="none" colors={[colors.black, 'rgba(14,10,7,0)']} style={[s.topFade, { top: box.top, width }]} />}
      <LinearGradient pointerEvents="none" colors={['rgba(14,10,7,0.78)', 'rgba(14,10,7,0)', 'rgba(14,10,7,0.2)', 'rgba(14,10,7,0.92)']} locations={[0, 0.3, 0.55, 1]} style={s.fill} />
      <View pointerEvents="none" style={[s.brandWrap, { top: insets.top + space.xl }]}>
        <Animated.View entering={FadeIn.duration(500).reduceMotion(rm)} accessibilityRole="header" accessibilityLabel="Golden Head Spa">
          <Text style={s.brand}>GOLDEN</Text>
          <Text style={s.brandSub}>HEAD SPA</Text>
          <Text style={s.values}>Compiègne</Text>
        </Animated.View>
      </View>
      <View pointerEvents="box-none" style={[s.wrap, { paddingBottom: insets.bottom + space.lg }]}>
        <Animated.View entering={FadeIn.delay(300).duration(900).reduceMotion(rm)}>
          <Button label="Prendre un RDV" onPress={() => { void startAmbient(); router.replace('/(tabs)/booking'); }} style={{ marginBottom: space.sm }} />
          <Button label="Offrir" variant="ghost" onPress={() => { void startAmbient(); router.replace('/gift-card'); }} style={{ marginBottom: space.sm }} />
          <Pressable accessibilityRole="button" onPress={() => { void startAmbient(); router.replace('/(tabs)'); }} hitSlop={8} style={s.discover}>
            <Text style={s.discoverText}>Tout découvrir</Text>
          </Pressable>
          {hasAmbient && <Text style={s.hint}>Une musique de détente accompagne votre visite</Text>}
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  topFade: { position: 'absolute', left: 0, height: 110 },
  wrap: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: space.lg },
  brandWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  brand: { fontFamily: fonts.serif, fontSize: 46, color: colors.champagne, letterSpacing: 6, textAlign: 'center' },
  brandSub: { fontFamily: fonts.serif, fontSize: 22, color: colors.champagne, letterSpacing: 6, textAlign: 'center' },
  values: { fontFamily: fonts.sans, color: '#F3E9D6', textAlign: 'center', marginTop: space.sm, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase' },
  discover: { alignItems: 'center', paddingVertical: space.sm },
  discoverText: { fontFamily: fonts.sansMedium, fontSize: 15, color: '#F3E9D6', textDecorationLine: 'underline' },
  hint: { fontFamily: fonts.sans, color: '#D9CDB8', textAlign: 'center', fontSize: 12, marginTop: space.md },
});
