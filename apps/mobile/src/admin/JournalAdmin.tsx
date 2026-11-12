// Chargement au montage de l'onglet : usage légitime d'un effet (même approche que les autres onglets d'administration).
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, fonts, radii, space } from '@ghs/ui';
import { journalPostSchema } from '@ghs/validation';
import { Body, Button, Card, Field, Notice } from '../components/ui';
import { adminClient } from '../lib/adminClient';
import { excerpt, formatPostDate } from '../lib/journal';

interface Row { id: string; kind: 'phrase' | 'article'; title: string | null; body: string; published: boolean; published_at: string | null; created_at: string }

/** Journal bien-être : la gérante écrit ici ; seuls les textes publiés apparaissent dans l'application. */
export function JournalAdmin() {
  const [rows, setRows] = useState<Row[] | undefined>();
  const [kind, setKind] = useState<'phrase' | 'article'>('phrase');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState<string | undefined>();
  const [confirming, setConfirming] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!adminClient) return;
    const { data, error } = await adminClient.from('journal_posts').select('id,kind,title,body,published,published_at,created_at').order('created_at', { ascending: false }).limit(100);
    if (error) setMsg('Chargement impossible (la migration du journal est-elle appliquée ?).'); else setRows((data ?? []) as Row[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const save = async (publish: boolean) => {
    if (!adminClient) return;
    const parsed = journalPostSchema.safeParse({ kind, title: kind === 'article' ? title : undefined, body });
    if (!parsed.success) { setMsg(parsed.error.issues[0]?.message ?? 'Champs invalides.'); return; }
    const v = parsed.data;
    const { error } = await adminClient.from('journal_posts').insert({ kind: v.kind, title: v.kind === 'article' ? v.title : null, body: v.body, published: publish });
    if (error) { setMsg('Enregistrement impossible.'); return; }
    setMsg(publish ? 'Publié : visible dans l\'application.' : 'Enregistré en brouillon.');
    setTitle(''); setBody(''); await load();
  };
  const toggle = async (r: Row) => { await adminClient?.from('journal_posts').update({ published: !r.published }).eq('id', r.id); await load(); };
  const remove = async (id: string) => { await adminClient?.from('journal_posts').delete().eq('id', id); setConfirming(undefined); await load(); };

  return (
    <View>
      <Body muted style={{ marginBottom: space.md }}>Une phrase s'affiche en grand sur l'accueil et dans le Journal. Un article a un titre et se lit dans le Journal.</Body>
      <Card style={{ marginBottom: space.md }}>
        <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.md }}>
          {([['phrase', 'Phrase'], ['article', 'Article']] as const).map(([k, label]) => (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: kind === k }} onPress={() => setKind(k)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: kind === k ? colors.champagne : colors.beige }}>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: kind === k ? colors.onGold : colors.brown }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {kind === 'article' && <Field label="Titre" value={title} onChangeText={setTitle} maxLength={120} />}
        <Field label={kind === 'phrase' ? 'Votre phrase' : 'Texte de l\'article'} multiline value={body} onChangeText={setBody} maxLength={8000} style={{ minHeight: kind === 'phrase' ? 90 : 180, textAlignVertical: 'top' }} />
        {msg && <Notice>{msg}</Notice>}
        <Button label="Publier maintenant" onPress={() => save(true)} disabled={body.trim().length < 2} />
        <Button label="Enregistrer en brouillon" variant="ghost" onPress={() => save(false)} disabled={body.trim().length < 2} style={{ marginTop: space.sm }} />
      </Card>
      {rows && rows.length === 0 && <Body muted>Aucun texte pour le moment.</Body>}
      {rows?.map((r) => (
        <Card key={r.id} style={{ marginBottom: space.sm, opacity: r.published ? 1 : 0.7 }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: r.published ? colors.champagneDark : colors.muted }}>
            {r.kind === 'phrase' ? 'PHRASE' : 'ARTICLE'} · {r.published && r.published_at ? `publié le ${formatPostDate(r.published_at)}` : 'brouillon'}
          </Text>
          {r.title ? <Text style={{ fontFamily: fonts.serifSemi, fontSize: 20, color: colors.brown, marginTop: 2 }}>{r.title}</Text> : null}
          <Body style={{ marginTop: 4 }}>{excerpt(r.body, 160)}</Body>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
            <Button label={r.published ? 'Dépublier' : 'Publier'} variant="ghost" onPress={() => toggle(r)} style={{ flex: 1, minHeight: 44 }} />
            {confirming === r.id
              ? <Button label="Confirmer" onPress={() => remove(r.id)} style={{ flex: 1, minHeight: 44 }} />
              : <Button label="Supprimer" variant="ghost" onPress={() => setConfirming(r.id)} style={{ flex: 1, minHeight: 44 }} />}
          </View>
        </Card>
      ))}
    </View>
  );
}
