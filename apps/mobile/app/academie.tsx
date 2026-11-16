// Chargement à la connexion / au montage : usage légitime des effets.
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { BUSINESS } from '@ghs/config';
import { colors, fonts, space } from '@ghs/ui';
import { Body, Button, Card, Field, Notice, Screen, ScreenHeader, SectionTitle } from '../src/components/ui';
import { fetchModules, hasAcademieAccess, parseBody, type AcademieModule } from '../src/lib/academie';
import { memberClient } from '../src/lib/memberClient';
import { mailTo } from '../src/lib/open';

type Phase = 'loading' | 'signed-out' | 'no-access' | 'ready';

/** Golden Académie : contenu réservé aux élèves inscrites. Rien du contenu n'est livré avec l'application : il est lu en base, sous RLS. */
export default function Academie() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [email, setEmail] = useState<string>('');
  const [modules, setModules] = useState<AcademieModule[]>([]);
  const [open, setOpen] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    if (!memberClient) { setPhase('signed-out'); return; }
    const { data } = await memberClient.auth.getSession();
    const mail = data.session?.user.email;
    if (!mail) { setPhase('signed-out'); return; }
    setEmail(mail);
    if (!(await hasAcademieAccess())) { setPhase('no-access'); return; }
    try { setModules(await fetchModules()); setError(undefined); } catch { setError('Chargement impossible pour le moment.'); }
    setPhase('ready');
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const signOut = async () => { await memberClient?.auth.signOut(); setModules([]); setOpen(undefined); setPhase('signed-out'); };

  return (
    <Screen>
      <ScreenHeader title="Golden Académie" subtitle="Plus qu'une formation, la clé d'une réussite" />
      {phase === 'loading' && <Body muted>Chargement…</Body>}
      {phase === 'signed-out' && <SignIn onDone={refresh} />}
      {phase === 'no-access' && (
        <Card>
          <Body>L'adresse {email} n'est pas encore inscrite à la Golden Académie.</Body>
          <Body muted style={{ marginTop: space.sm }}>Après votre inscription, l'institut active votre accès : il suffit ensuite de vous reconnecter avec cette adresse.</Body>
          <Button label="Demander mon inscription" onPress={() => void mailTo(BUSINESS.email, { subject: 'Inscription Golden Académie', body: `Bonjour,\n\nJe souhaite m'inscrire à la Golden Académie.\nAdresse e-mail : ${email}\n` })} style={{ marginTop: space.md }} />
          <Button label="Changer d'adresse" variant="ghost" onPress={signOut} style={{ marginTop: space.sm }} />
        </Card>
      )}
      {phase === 'ready' && (
        <View>
          {error && <Notice>{error}</Notice>}
          {modules.length === 0 && !error && <Body muted>Votre accès est actif. Les premiers modules seront publiés très bientôt.</Body>}
          {modules.map((m) => (
            <Card key={m.id} style={{ marginBottom: space.sm }}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === m.id }} onPress={() => setOpen(open === m.id ? undefined : m.id)}>
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: colors.champagneDark, letterSpacing: 1 }}>MODULE {m.position}</Text>
                <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.brown }}>{m.title}</Text>
              </Pressable>
              {open === m.id && <ModuleBody m={m} />}
            </Card>
          ))}
          <SectionTitle>Mon compte</SectionTitle>
          <Body muted style={{ fontSize: 13 }}>Connectée avec {email}</Body>
          <Button label="Se déconnecter" variant="ghost" onPress={signOut} style={{ marginTop: space.sm }} />
        </View>
      )}
    </Screen>
  );
}

function ModuleBody({ m }: { m: AcademieModule }) {
  return (
    <View style={{ marginTop: space.md }}>
      {m.video_url ? <Button label="Voir la vidéo du module" variant="ghost" onPress={() => void Linking.openURL(m.video_url as string)} style={{ marginBottom: space.md }} /> : null}
      {parseBody(m.body).map((b, i) => b.kind === 'h'
        ? <Text key={i} style={{ fontFamily: fonts.sansSemi, fontSize: 16, color: colors.brown, marginTop: space.md, marginBottom: 4 }}>{b.text}</Text>
        : b.kind === 'li'
          ? <Text key={i} style={{ fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.brown, paddingLeft: 12 }}>•  {b.text}</Text>
          : <Text key={i} style={{ fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.brown, marginTop: 6 }}>{b.text}</Text>)}
    </View>
  );
}

function SignIn({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  const send = async () => {
    if (!memberClient || !valid) return;
    setBusy(true); setError(undefined);
    const { error: e } = await memberClient.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (e) setError("Envoi impossible pour le moment. Réessayez dans quelques minutes."); else setSent(true);
  };
  const verify = async () => {
    if (!memberClient) return;
    setBusy(true); setError(undefined);
    const { error: e } = await memberClient.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (e) setError('Code incorrect ou expiré.'); else onDone();
  };

  if (!memberClient) return <Notice>L'espace élève n'est pas disponible pour le moment.</Notice>;
  return (
    <Card>
      <Body>Entrez l'adresse e-mail de votre inscription. Vous recevrez un code de connexion : pas de mot de passe à retenir.</Body>
      <Field label="Votre email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={email} onChangeText={setEmail} editable={!sent} />
      {sent && <Field label="Code reçu par e-mail" keyboardType="number-pad" autoComplete="one-time-code" value={code} onChangeText={setCode} />}
      {error && <Notice>{error}</Notice>}
      {sent
        ? <><Button label="Valider le code" onPress={verify} disabled={busy || code.trim().length < 6} />
            <Button label="Renvoyer un code" variant="ghost" onPress={send} disabled={busy} style={{ marginTop: space.sm }} /></>
        : <Button label="Recevoir mon code" onPress={send} disabled={busy || !valid} />}
    </Card>
  );
}
