import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { create } from 'zustand';
import { AMBIENT_TRACK } from '../data/audio';
import { getFlag, setFlag, clearFlag } from './storage';

const MUTED_KEY = 'ghs_music_off';
const TARGET_VOLUME = 0.5;
export const hasAmbient = AMBIENT_TRACK !== null;

interface AudioState { playing: boolean; muted: boolean }
export const useAmbient = create<AudioState>(() => ({ playing: false, muted: false }));

let player: AudioPlayer | null = null;
let timer: ReturnType<typeof setInterval> | undefined;

function fadeTo(target: number, done?: () => void) {
  if (!player) return;
  clearInterval(timer);
  timer = setInterval(() => {
    if (!player) return clearInterval(timer);
    const v = player.volume;
    const next = v < target ? Math.min(target, v + 0.05) : Math.max(target, v - 0.05);
    player.volume = next;
    if (next === target) { clearInterval(timer); done?.(); }
  }, 120);
}

/** À appeler depuis un geste utilisateur (les navigateurs bloquent l'autoplay). Sans fichier : ne fait rien. */
export async function startAmbient(): Promise<void> {
  if (!hasAmbient || AMBIENT_TRACK === null) return;
  try {
    if (await getFlag(MUTED_KEY)) { useAmbient.setState({ muted: true }); return; }
    await setAudioModeAsync({ playsInSilentMode: true });
    player ??= createAudioPlayer(AMBIENT_TRACK);
    player.loop = true;
    player.volume = 0;
    player.play();
    useAmbient.setState({ playing: true, muted: false });
    fadeTo(TARGET_VOLUME);
  } catch { /* audio indisponible : l'app continue sans musique */ }
}

export async function toggleAmbient(): Promise<void> {
  if (!hasAmbient) return;
  if (useAmbient.getState().playing) {
    fadeTo(0, () => player?.pause());
    useAmbient.setState({ playing: false, muted: true });
    await setFlag(MUTED_KEY);
  } else {
    await clearFlag(MUTED_KEY);
    await startAmbient();
  }
}
