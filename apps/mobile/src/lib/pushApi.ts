import { Platform } from 'react-native';

const NATIVE_URL = process.env.EXPO_PUBLIC_PUSH_API_URL;
/** Fonction serveur d'envoi (api/push). Sur le web : même domaine ; sur mobile natif : URL à fournir. */
export const PUSH_URL: string | undefined = Platform.OS === 'web' ? (NATIVE_URL || '/api/push') : NATIVE_URL;

/** Envoie une notification aux appareils inscrits. `token` = jeton de session de l'administratrice. Retourne le nombre d'envois, ou undefined en cas d'échec. */
export async function sendPush(token: string, input: { title: string; body: string; postId?: string }): Promise<number | undefined> {
  if (!PUSH_URL) return undefined;
  try {
    const res = await fetch(PUSH_URL, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(input) });
    if (!res.ok) return undefined;
    return ((await res.json()) as { sent?: number }).sent;
  } catch { return undefined; }
}
