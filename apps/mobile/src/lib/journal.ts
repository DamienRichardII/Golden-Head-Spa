import { supabase } from './supabase';

export interface JournalPost {
  id: string;
  kind: 'phrase' | 'article';
  title: string | null;
  body: string;
  published_at: string;
}

/** Posts publiés, du plus récent au plus ancien. La RLS ne renvoie jamais les brouillons. Tableau vide si le service n'est pas configuré. */
export async function fetchJournal(limit = 30): Promise<JournalPost[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('journal_posts').select('id,kind,title,body,published_at')
    .order('published_at', { ascending: false }).limit(limit);
  if (error) throw new Error('journal_unavailable');
  return (data ?? []) as JournalPost[];
}

export const formatPostDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

/** Début du texte pour la liste (coupe proprement sur un mot). */
export function excerpt(body: string, max = 140): string {
  const t = body.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).replace(/\s+\S*$/, '')}…`;
}
