import { handleChat } from '../apps/mobile/server/chat';

// Vercel Function (projet buildé depuis la racine). La clé reste côté serveur : ANTHROPIC_API_KEY.
const run = (req: Request) =>
  handleChat(req, { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY, ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL });
export const POST = run;
export const OPTIONS = run;
