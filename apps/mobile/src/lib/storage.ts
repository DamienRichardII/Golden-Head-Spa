import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** SecureStore sur mobile ; localStorage sur le web (SecureStore n'y existe pas). */
async function read(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
    return await SecureStore.getItemAsync(key);
  } catch { return null; }
}
async function write(key: string, value: string | null): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (value === null) globalThis.localStorage?.removeItem(key); else globalThis.localStorage?.setItem(key, value);
      return;
    }
    if (value === null) await SecureStore.deleteItemAsync(key); else await SecureStore.setItemAsync(key, value);
  } catch { /* stockage indisponible : non bloquant */ }
}

export async function getFlag(key: string): Promise<boolean> { return (await read(key)) === '1'; }
export async function setFlag(key: string): Promise<void> { await write(key, '1'); }

export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await read(key);
  try { return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}
export async function setJson(key: string, value: unknown): Promise<void> {
  await write(key, value === null ? null : JSON.stringify(value));
}
