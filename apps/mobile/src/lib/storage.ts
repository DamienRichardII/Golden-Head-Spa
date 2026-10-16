import * as SecureStore from 'expo-secure-store';

export async function getFlag(key: string): Promise<boolean> {
  try { return (await SecureStore.getItemAsync(key)) === '1'; } catch { return false; }
}
export async function setFlag(key: string): Promise<void> {
  try { await SecureStore.setItemAsync(key, '1'); } catch { /* stockage indisponible : non bloquant */ }
}
