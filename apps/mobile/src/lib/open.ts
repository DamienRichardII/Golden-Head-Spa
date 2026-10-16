import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { PLANITY_BOOKING_URL } from '@ghs/config';

export const isPlanityConfigured = () => Boolean(PLANITY_BOOKING_URL);

/** Ouvre le parcours Planity officiel. Ne fait rien si l'URL n'est pas configurée. */
export async function openPlanity(): Promise<boolean> {
  if (!PLANITY_BOOKING_URL) return false;
  await WebBrowser.openBrowserAsync(PLANITY_BOOKING_URL);
  return true;
}
export const mailTo = (email: string) => Linking.openURL(`mailto:${email}`);
