import { create } from 'zustand';

/** Mode démo : ne sert qu'à prévisualiser les espaces membres tant que l'authentification Supabase n'est pas branchée. */
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === '1';

interface SessionState { isMember: boolean; setMember: (v: boolean) => void }
export const useSession = create<SessionState>((set) => ({ isMember: false, setMember: (isMember) => set({ isMember }) }));
