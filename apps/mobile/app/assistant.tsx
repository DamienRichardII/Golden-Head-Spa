import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BUSINESS } from '@ghs/config';
import { CHAT_MAX_CHARS } from '@ghs/validation';
import { colors, fonts, radii, space } from '@ghs/ui';
import { askAssistant, CHAT_URL, FALLBACK_REPLY, type ChatMessage } from '../src/lib/chatApi';

const SUGGESTIONS = ['Quels sont vos tarifs ?', 'Comment réserver ?', 'Comment offrir une carte cadeau ?'];
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
      <View style={{ paddingTop: insets.top + space.md, paddingHorizontal: space.md, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingBottom: space.sm }}>
        <Pressable accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={24} color={colors.brown} /></Pressable>
        <View>
          <Text accessibilityRole="header" style={{ fontFamily: fonts.serifSemi, fontSize: 24, color: colors.brown }}>Assistant</Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.muted }}>Assistant IA · ne confirme aucun créneau</Text>
        </View>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: space.md, gap: space.sm }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {messages.map((m, i) => (
          <View key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: m.role === 'user' ? colors.champagne : colors.white, borderRadius: radii.lg, padding: space.md }}>
            <Text style={{ fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: m.role === 'user' ? colors.white : colors.brown }}>{m.content}</Text>
          </View>
        ))}
        {busy && <ActivityIndicator color={colors.champagneDark} style={{ alignSelf: 'flex-start', margin: space.sm }} />}
        {messages.length === 1 && !failed && SUGGESTIONS.map((q) => (
          <Pressable key={q} accessibilityRole="button" onPress={() => { void send(q); }} style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown }}>{q}</Text>
          </Pressable>
        ))}
        {failed && (
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Pressable accessibilityRole="button" onPress={() => { void Linking.openURL(`mailto:${BUSINESS.email}`); }} style={{ borderWidth: 1, borderColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 }}><Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown }}>Écrire à l'équipe</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => { void Linking.openURL(`tel:${BUSINESS.phone.replace(/ /g, '')}`); }} style={{ borderWidth: 1, borderColor: colors.champagne, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 }}><Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown }}>Appeler</Text></Pressable>
          </View>
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: space.sm, padding: space.md, paddingBottom: insets.bottom + space.md, borderTopWidth: 1, borderTopColor: colors.line }}>
        <TextInput accessibilityLabel="Votre message" value={input} onChangeText={setInput} placeholder="Votre question…" placeholderTextColor={colors.muted} maxLength={CHAT_MAX_CHARS} onSubmitEditing={() => { void send(input); }} returnKeyType="send"
          style={{ flex: 1, minHeight: 48, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: space.md, fontFamily: fonts.sans, fontSize: 15, color: colors.black }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Envoyer" disabled={busy || !input.trim()} onPress={() => { void send(input); }}
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.champagne, alignItems: 'center', justifyContent: 'center', opacity: busy || !input.trim() ? 0.45 : 1 }}>
          <Ionicons name="arrow-up" size={22} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
