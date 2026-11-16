import { memberClient } from './memberClient';

export interface AcademieModule { id: string; position: number; title: string; body: string; video_url: string | null }

/** Vrai si l'élève connectée est autorisée (liste d'inscription gérée par l'administratrice). */
export async function hasAcademieAccess(): Promise<boolean> {
  if (!memberClient) return false;
  const { data, error } = await memberClient.rpc('has_academie_access');
  return !error && data === true;
}

/** Modules publiés. La base ne renvoie rien aux personnes non inscrites. */
export async function fetchModules(): Promise<AcademieModule[]> {
  if (!memberClient) return [];
  const { data, error } = await memberClient.from('academie_modules').select('id,position,title,body,video_url').order('position');
  if (error) throw new Error('academie_unavailable');
  return (data ?? []) as AcademieModule[];
}

export type Block = { kind: 'h'; text: string } | { kind: 'li'; text: string } | { kind: 'p'; text: string };

/** Mise en forme minimale du texte saisi : « # titre », « - puce », le reste en paragraphes. */
export function parseBody(body: string): Block[] {
  const out: Block[] = [];
  for (const raw of body.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('# ')) out.push({ kind: 'h', text: line.slice(2).trim() });
    else if (/^[-•]\s+/.test(line)) out.push({ kind: 'li', text: line.replace(/^[-•]\s+/, '') });
    else out.push({ kind: 'p', text: line });
  }
  return out;
}
