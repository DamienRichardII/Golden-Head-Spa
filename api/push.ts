import { handlePush } from '../apps/mobile/server/push';

// Vercel Function : pas de clé secrète ; la requête doit porter le jeton d'une administratrice (vérifié côté base).
export const POST = (req: Request) =>
  handlePush(req, { SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY });
