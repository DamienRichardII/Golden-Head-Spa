// Chargement au montage de l'onglet : usage légitime d'un effet.
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, fonts, space } from '@ghs/ui';
import { Body, Button, Card, Field, Notice } from '../components/ui';
import { adminClient } from '../lib/adminClient';
import { validComment } from '../lib/reviews';

interface Row { id: string; author_name: string; rating: number; comment: string; source: 'app' | 'manuel'; status: 'pending' | 'approved' | 'rejected'; created_at: string }
const LABEL = { pending: 'EN ATTENTE', approved: 'PUBLIÉ', rejected: 'REFUSÉ' } as const;

/** Modération des avis : valider ou refuser ceux déposés dans l'application, ajouter un avis recueilli avec l'accord de la cliente. */
export function ReviewsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [confirming, setConfirming] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!adminClient) return;
    const { data, error } = await adminClient.from('reviews').select('id,author_name,rating,comment,source,status,created_at').order('created_at', { ascending: false }).limit(200);
    if (error) setMsg("Chargement impossible (la migration des avis est-elle appliquée ?)."); else setRows((data ?? []) as Row[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const setStatus = async (id: string, status: Row['status']) => { await adminClient?.from('reviews').update({ status }).eq('id', id); await load(); };
  const remove = async (id: string) => { await adminClient?.from('reviews').delete().eq('id', id); setConfirming(undefined); await load(); };
  const add = async () => {
    if (name.trim().length < 2 || !validComment(text)) { setMsg('Prénom et avis (3 caractères minimum) requis.'); return; }
    const { error } = await adminClient!.from('reviews').insert({ author_name: name.trim().slice(0, 40), rating, comment: text.trim(), source: 'manuel', status: 'approved' });
    if (error) { setMsg('Ajout impossible.'); return; }
    setMsg('Avis publié.'); setName(''); setText(''); setRating(5); await load();
  };
  const pending = rows.filter((r) => r.status === 'pending').length;

  return (
    <View>
      {msg && <Notice>{msg}</Notice>}
      <Body muted style={{ marginBottom: space.md }}>{pending > 0 ? `${pending} avis à valider.` : 'Aucun avis en attente.'} Seuls les avis publiés apparaissent dans l'application.</Body>
      {rows.map((r) => (
        <Card key={r.id} style={{ marginBottom: space.sm, opacity: r.status === 'rejected' ? 0.6 : 1 }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: r.status === 'pending' ? colors.champagneDark : colors.muted }}>
            {LABEL[r.status]} · {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} · {r.source === 'manuel' ? 'ajouté à la main' : 'application'}
          </Text>
          <Body style={{ marginTop: 4 }}>{r.comment}</Body>
          <Body muted style={{ fontSize: 13, marginTop: 4 }}>{r.author_name}</Body>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
            {r.status !== 'approved' && <Button label="Publier" onPress={() => setStatus(r.id, 'approved')} style={{ flex: 1, minHeight: 44 }} />}
            {r.status === 'approved' && <Button label="Dépublier" variant="ghost" onPress={() => setStatus(r.id, 'rejected')} style={{ flex: 1, minHeight: 44 }} />}
            {r.status === 'pending' && <Button label="Refuser" variant="ghost" onPress={() => setStatus(r.id, 'rejected')} style={{ flex: 1, minHeight: 44 }} />}
            {confirming === r.id
              ? <Button label="Confirmer" onPress={() => remove(r.id)} style={{ flex: 1, minHeight: 44 }} />
              : <Button label="Supprimer" variant="ghost" onPress={() => setConfirming(r.id)} style={{ flex: 1, minHeight: 44 }} />}
          </View>
        </Card>
      ))}

      <Card style={{ marginTop: space.md }}>
        <Text style={{ fontFamily: fonts.sansSemi, color: colors.brown, marginBottom: space.sm }}>Ajouter un avis recueilli</Text>
        <Body muted style={{ fontSize: 12, marginBottom: space.sm }}>À utiliser uniquement avec l'accord de la cliente (message ou parole). Ne recopiez pas les avis Google ou Planity.</Body>
        <Field label="Prénom (ex. Sophie M.)" value={name} onChangeText={setName} maxLength={40} />
        <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.md }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} accessibilityRole="button" accessibilityState={{ selected: rating === n }} onPress={() => setRating(n)}>
              <Text style={{ fontSize: 28, color: colors.champagne }}>{n <= rating ? '★' : '☆'}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Son avis" multiline value={text} onChangeText={setText} maxLength={1000} style={{ minHeight: 100, textAlignVertical: 'top' }} />
        <Button label="Publier cet avis" onPress={add} disabled={name.trim().length < 2 || !validComment(text)} />
      </Card>
    </View>
  );
}
