import { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, space } from '@ghs/ui';
import { Body, Card, EmptyState, Reveal, Screen, ScreenHeader } from '../../src/components/ui';
import { excerpt, fetchJournal, formatPostDate, type JournalPost } from '../../src/lib/journal';

/** Journal bien-être : phrases et articles écrits par l'institut. Lecture seule, publiés depuis l'espace d'administration. */
export default function Journal() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['journal'], queryFn: () => fetchJournal(), staleTime: 60_000 });
  const [open, setOpen] = useState<string | undefined>();
  const phrase = data?.find((p) => p.kind === 'phrase');
  const articles = (data ?? []).filter((p) => p.kind === 'article');

  return (
    <Screen>
      <ScreenHeader title="Journal" subtitle="Bien-être et développement personnel" back={false} />
      {isLoading && <Body muted>Chargement…</Body>}
      {isError && (
        <Pressable accessibilityRole="button" onPress={() => void refetch()}>
          <EmptyState title="Journal indisponible" text="Impossible de charger les articles pour le moment. Touchez ici pour réessayer." />
        </Pressable>
      )}
      {data && data.length === 0 && <EmptyState title="Bientôt ici" text="Les premières pensées bien-être de l'institut arrivent très prochainement." />}
      {phrase && (
        <Reveal>
          <View style={s.quoteCard} accessibilityRole="text">
            <Ionicons name="leaf-outline" size={20} color={colors.champagne} />
            <Text style={s.quote}>{phrase.body}</Text>
            <Text style={s.date}>{formatPostDate(phrase.published_at)}</Text>
          </View>
        </Reveal>
      )}
      {articles.map((a, i) => <Article key={a.id} post={a} index={i} expanded={open === a.id} onToggle={() => setOpen(open === a.id ? undefined : a.id)} />)}
    </Screen>
  );
}

function Article({ post, index, expanded, onToggle }: { post: JournalPost; index: number; expanded: boolean; onToggle: () => void }) {
  return (
    <Reveal index={index + 1}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={post.title ?? 'Article'} onPress={onToggle}>
        <Card style={{ marginBottom: space.sm }}>
          <Text style={s.date}>{formatPostDate(post.published_at)}</Text>
          <Text style={s.title}>{post.title}</Text>
          <Text style={s.text}>{expanded ? post.body : excerpt(post.body)}</Text>
          <Text style={s.more}>{expanded ? 'Réduire' : 'Lire la suite'}</Text>
        </Card>
      </Pressable>
    </Reveal>
  );
}

const s = StyleSheet.create({
  quoteCard: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.champagne, padding: space.lg, marginBottom: space.md, gap: space.sm },
  quote: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 34, color: colors.brown },
  date: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.brown, marginTop: 2 },
  text: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.brown, marginTop: space.sm },
  more: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.champagneDark, marginTop: space.sm },
});
