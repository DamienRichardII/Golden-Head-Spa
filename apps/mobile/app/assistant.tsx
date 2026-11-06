import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BUSINESS } from '@ghs/config';
import { CHAT_MAX_CHARS } from '@ghs/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, space } from '@ghs/ui';
import { askAssistant, CHAT_URL, FALLBACK_REPLY, type ChatMessage } from '../src/lib/chatApi';

const SUGGESTIONS = [
  { label: 'Horaires', q: 'Quels sont vos horaires ?' },
  { label: 'Tarifs', q: 'Quels sont vos tarifs ?' },
  { label: 'Réserver', q: 'Comment réserver ?' },
  { label: 'Cartes cadeaux', q: 'Comment offrir une carte cadeau ?' },
];
const WELCOME: ChatMessage = { role: 'assistant', content: 'Bonjour ! Je suis l\'assistant virtuel de Golden Head Spa. Je peux vous renseigner sur nos rituels, tarifs et horaires lorsque l\'équipe n\'est pas disponible.' };

export default function Assistant() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(!CHAT_URL);

  async function send(text: string) {
    const content = text.trim().slice(0, CHAT_MAX_CHARS);
    if (!content || busy) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next); setInput(''); setBusy(true);
    // Le message d'accueil est local : seul l'échange réel part au serveur.
    const reply = await askAssistant(next.filter((m) => m !== WELCOME));
    setMessages([...next, { role: 'assistant', content: reply ?? FALLBACK_REPLY }]);
    setFailed(reply === null);
    setBusy(false);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.ivory }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient pointerEvents="none" colors={['rgba(212,175,106,0.14)', 'rgba(212,175,106,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260 }} />
      <View style={{ paddingTop: insets.top + space.md, paddingHorizontal: space.md, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingBottom: space.sm }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12} style={{ width: 40, height: 40, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(34,25,17,0.6)', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="chevron-back" size={22} color={colors.brown} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={{ fontFamily: fonts.serifSemi, fontSize: 24, color: colors.brown }}>Assistant Golden Head Spa</Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.muted }}>Assistant IA · ne confirme aucun créneau</Text>
        </View>
        <Ionicons name="sparkles" size={22} color={colors.champagne} />
      </View>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: space.md, gap: space.sm }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {messages.map((m, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
            {m.role === 'assistant' && (
              <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
                <Ionicons name="sparkles" size={14} color={colors.champagne} />
              </View>
            )}
            <View style={{ flexShrink: 1, backgroundColor: m.role === 'user' ? colors.champagne : colors.surface, borderWidth: m.role === 'user' ? 0 : 1, borderColor: colors.line, borderRadius: radii.lg, padding: space.md }}>
              <Text style={{ fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: m.role === 'user' ? colors.onGold : colors.brown }}>{m.content}</Text>
            </View>
          </View>
        ))}
        {busy && <ActivityIndicator color={colors.champagneDark} style={{ alignSelf: 'flex-start', margin: space.sm }} />}
        {failed && (
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Pressable accessibilityRole="button" onPress={() => { void Linking.openURL(`mailto:${BUSINESS.email}`); }} style={{ borderWidth: 1, borderColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 }}><Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown }}>Écrire à l'équipe</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => { void Linking.openURL(`tel:${BUSINESS.phone.replace(/ /g, '')}`); }} style={{ borderWidth: 1, borderColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 }}><Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown }}>Appeler</Text></Pressable>
          </View>
        )}
      </ScrollView>
      {!failed && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }} contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.md, paddingBottom: space.sm }}>
          {SUGGESTIONS.map((x) => (
            <Pressable key={x.label} accessibilityRole="button" disabled={busy} onPress={() => { void send(x.q); }} style={{ borderWidth: 1, borderColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8, opacity: busy ? 0.5 : 1 }}>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown }}>{x.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.line }}>
        <TextInput accessibilityLabel="Votre message" value={input} onChangeText={setInput} placeholder="Votre question…" placeholderTextColor={colors.muted} maxLength={CHAT_MAX_CHARS} onSubmitEditing={() => { void send(input); }} returnKeyType="send"
          style={{ flex: 1, minHeight: 48, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: space.md, fontFamily: fonts.sans, fontSize: 15, color: colors.brown }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Envoyer" disabled={busy || !input.trim()} onPress={() => { void send(input); }}
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.champagne, alignItems: 'center', justifyContent: 'center', opacity: busy || !input.trim() ? 0.45 : 1 }}>
          <Ionicons name="arrow-up" size={22} color={colors.onGold} />
        </Pressable>
      </View>
      <Pressable accessibilityRole="link" onPress={() => { void Linking.openURL(`mailto:${BUSINESS.email}`); }} style={{ alignItems: 'center', paddingTop: space.sm, paddingBottom: insets.bottom + space.sm }}>
        <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.muted, textDecorationLine: 'underline' }}>Écrire à l'équipe</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
