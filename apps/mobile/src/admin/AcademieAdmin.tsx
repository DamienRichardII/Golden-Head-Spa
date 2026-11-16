// Chargement au montage de l'onglet : usage légitime d'un effet (comme les autres onglets d'administration).
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, fonts, space } from '@ghs/ui';
import { Body, Button, Card, Field, Notice, SectionTitle } from '../components/ui';
import { adminClient } from '../lib/adminClient';

interface Mod { id: string; position: number; title: string; body: string; video_url: string | null; published: boolean }
interface Access { email: string; note: string | null; granted_at: string }
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Golden Académie côté gérante : qui a accès, et le contenu des modules (visible uniquement des élèves inscrites). */
export function AcademieAdmin() {
  const [access, setAccess] = useState<Access[]>([]);
  const [mods, setMods] = useState<Mod[]>([]);
  const [msg, setMsg] = useState<string | undefined>();
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [edit, setEdit] = useState<Partial<Mod> & { isNew?: boolean } | undefined>();
  const [confirming, setConfirming] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!adminClient) return;
    const [a, m] = await Promise.all([
      adminClient.from('academie_access').select('email,note,granted_at').order('granted_at', { ascending: false }),
      adminClient.from('academie_modules').select('id,position,title,body,video_url,published').order('position'),
    ]);
    if (a.error || m.error) { setMsg("Chargement impossible (la migration de l'Académie est-elle appliquée ?)."); return; }
    setAccess((a.data ?? []) as Access[]); setMods((m.data ?? []) as Mod[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const grant = async () => {
    const e = email.trim().toLowerCase();
    if (!EMAIL_RE.test(e)) { setMsg('Adresse e-mail invalide.'); return; }
    const { error } = await adminClient!.from('academie_access').upsert({ email: e, note: note.trim() || null });
    if (error) { setMsg("Ajout impossible."); return; }
    setMsg(`Accès donné à ${e}.`); setEmail(''); setNote(''); await load();
  };
  const revoke = async (e: string) => { await adminClient!.from('academie_access').delete().eq('email', e); setConfirming(undefined); setMsg(`Accès retiré pour ${e}.`); await load(); };

  const saveMod = async () => {
    if (!edit) return;
    const position = Number(edit.position); const title = (edit.title ?? '').trim();
    const video = (edit.video_url ?? '').trim();
    if (!Number.isInteger(position) || position < 1 || position > 99) { setMsg('Numéro de module : entre 1 et 99.'); return; }
    if (title.length < 2) { setMsg('Titre trop court.'); return; }
    if (video && !/^https:\/\/\S+$/.test(video)) { setMsg('Le lien vidéo doit commencer par https://'); return; }
    const row = { position, title, body: edit.body ?? '', video_url: video || null, published: Boolean(edit.published), updated_at: new Date().toISOString() };
    const { error } = edit.id ? await adminClient!.from('academie_modules').update(row).eq('id', edit.id) : await adminClient!.from('academie_modules').insert(row);
    if (error) { setMsg(error.code === '23505' ? 'Ce numéro de module existe déjà.' : 'Enregistrement impossible.'); return; }
    setMsg('Module enregistré.'); setEdit(undefined); await load();
  };
  const removeMod = async (id: string) => { await adminClient!.from('academie_modules').delete().eq('id', id); setConfirming(undefined); await load(); };

  return (
    <View>
      {msg && <Notice>{msg}</Notice>}
      <SectionTitle>Élèves inscrites</SectionTitle>
      <Body muted style={{ marginBottom: space.sm }}>Ajoutez l'adresse e-mail d'une élève une fois son inscription validée : elle se connecte ensuite avec un code reçu par mail.</Body>
      <Card style={{ marginBottom: space.md }}>
        <Field label="E-mail de l'élève" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <Field label="Note (facultatif)" value={note} onChangeText={setNote} maxLength={200} />
        <Button label="Donner l'accès" onPress={grant} disabled={!EMAIL_RE.test(email.trim())} />
      </Card>
      {access.length === 0 && <Body muted>Aucune élève inscrite pour le moment.</Body>}
      {access.map((a) => (
        <Card key={a.email} style={{ marginBottom: space.sm }}>
          <Text style={{ fontFamily: fonts.sansMedium, color: colors.brown }}>{a.email}</Text>
          {a.note ? <Body muted style={{ fontSize: 13 }}>{a.note}</Body> : null}
          {confirming === `a:${a.email}`
            ? <Button label="Confirmer le retrait" onPress={() => revoke(a.email)} style={{ marginTop: space.sm, minHeight: 44 }} />
            : <Button label="Retirer l'accès" variant="ghost" onPress={() => setConfirming(`a:${a.email}`)} style={{ marginTop: space.sm, minHeight: 44 }} />}
        </Card>
      ))}

      <SectionTitle>Modules</SectionTitle>
      <Button label="Ajouter un module" variant="ghost" onPress={() => setEdit({ isNew: true, position: (mods.at(-1)?.position ?? 0) + 1, title: '', body: '', video_url: '', published: false })} />
      {edit && (
        <Card style={{ marginTop: space.md }}>
          <Field label="Numéro du module" keyboardType="number-pad" value={String(edit.position ?? '')} onChangeText={(v) => setEdit({ ...edit, position: Number(v.replace(/\D/g, '')) })} />
          <Field label="Titre" value={edit.title ?? ''} onChangeText={(v) => setEdit({ ...edit, title: v })} maxLength={160} />
          <Field label="Contenu (# titre · - puce · texte)" multiline value={edit.body ?? ''} onChangeText={(v) => setEdit({ ...edit, body: v })} maxLength={60000} style={{ minHeight: 220, textAlignVertical: 'top' }} />
          <Field label="Lien vidéo privé (https://…)" autoCapitalize="none" value={edit.video_url ?? ''} onChangeText={(v) => setEdit({ ...edit, video_url: v })} />
          <Pressable accessibilityRole="switch" accessibilityState={{ checked: Boolean(edit.published) }} onPress={() => setEdit({ ...edit, published: !edit.published })} style={{ marginBottom: space.md }}>
            <Text style={{ fontFamily: fonts.sansMedium, color: colors.champagneDark }}>{edit.published ? '✓ Publié : visible des élèves' : 'Brouillon : invisible (touchez pour publier)'}</Text>
          </Pressable>
          <Button label="Enregistrer" onPress={saveMod} />
          <Button label="Annuler" variant="ghost" onPress={() => setEdit(undefined)} style={{ marginTop: space.sm }} />
        </Card>
      )}
      {mods.map((m) => (
        <Card key={m.id} style={{ marginTop: space.sm, opacity: m.published ? 1 : 0.7 }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: m.published ? colors.champagneDark : colors.muted }}>MODULE {m.position} · {m.published ? 'publié' : 'brouillon'}</Text>
          <Text style={{ fontFamily: fonts.serifSemi, fontSize: 20, color: colors.brown }}>{m.title}</Text>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
            <Button label="Modifier" variant="ghost" onPress={() => setEdit(m)} style={{ flex: 1, minHeight: 44 }} />
            {confirming === `m:${m.id}`
              ? <Button label="Confirmer" onPress={() => removeMod(m.id)} style={{ flex: 1, minHeight: 44 }} />
              : <Button label="Supprimer" variant="ghost" onPress={() => setConfirming(`m:${m.id}`)} style={{ flex: 1, minHeight: 44 }} />}
          </View>
        </Card>
      ))}
    </View>
  );
}
