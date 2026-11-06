import { Platform } from 'react-native';
import { BUSINESS } from '@ghs/config';

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

const NATIVE_URL = process.env.EXPO_PUBLIC_CHAT_API_URL;
export const CHAT_URL: string | undefined = Platform.OS === 'web' ? (NATIVE_URL || '/api/chat') : NATIVE_URL;

export const FALLBACK_REPLY = `Je ne suis pas disponible pour le moment. Vous pouvez écrire à ${BUSINESS.email} ou appeler le ${BUSINESS.phone}.`;

/** Retourne la réponse de l'assistant, ou null si indisponible (le message de repli est alors affiché). */
export async function askAssistant(history: ChatMessage[]): Promise<string | null> {
  if (!CHAT_URL) return null;
  try {
    const res = await fetch(CHAT_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12) }) });
    if (!res.ok) return null;
    const data = (await res.json()) as { reply?: string };
    return data.reply ?? null;
  } catch { return null; }
}
