import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { BUSINESS, REVIEW_LINKS } from '@ghs/config';
import { colors, fonts, space } from '@ghs/ui';
import { Body, Button, Card, Field, Notice, Screen, ScreenHeader, SectionTitle } from '../src/components/ui';
import { getLastBooking, type BookingConfirmation } from '../src/lib/booking';
import { fetchReviews, submitReview, summarize, validComment, type Review, type ReviewErrorCode } from '../src/lib/reviews';

const Stars = ({ value, size = 16 }: { value: number; size?: number }) => (
  <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${value} étoiles sur 5`}>
    {[1, 2, 3, 4, 5].map((n) => <Ionicons key={n} name={n <= value ? 'star' : 'star-outline'} size={size} color={colors.champagne} />)}
  </View>
);

const MESSAGES: Record<ReviewErrorCode, string> = {
  not_eligible: "Votre avis pourra être déposé une fois votre rendez-vous passé.",
  already_reviewed: 'Vous avez déjà donné votre avis sur ce rendez-vous. Merci !',
  invalid: 'Merci de choisir une note de 1 à 5.',
  network: 'Envoi impossible pour le moment. Réessayez un peu plus tard.',
};

/** Avis : note Planity (lien vers la fiche, aucun texte recopié) + avis déposés dans l'application, publiés après validation. */
export default function Reviews() {
  const [reviews, setReviews] = useState<Review[] | undefined>();
  const [failed, setFailed] = useState(false);
  const [last, setLast] = useState<BookingConfirmation | null>(null);

  useEffect(() => { fetchReviews().then(setReviews).catch(() => { setFailed(true); setReviews([]); }); }, []);
  useEffect(() => { void getLastBooking().then(setLast); }, []);

  const own = summarize(reviews ?? []);
  const eligible = last && new Date(last.endsAt) < new Date();

  return (
    <Screen>
      <ScreenHeader title="Avis des clientes" subtitle="Ce que disent celles qui ont vécu l'expérience" />
      <Card>
        <Text style={{ fontFamily: fonts.serif, fontSize: 40, color: colors.brown }}>{BUSINESS.rating.score.toFixed(1).replace('.', ',')}</Text>
        <Stars value={5} size={20} />
        <Body muted style={{ marginTop: space.sm }}>{BUSINESS.rating.count} avis sur {BUSINESS.rating.source}</Body>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
          <Button label="Sur Planity" variant="ghost" onPress={() => void WebBrowser.openBrowserAsync(REVIEW_LINKS.planity)} style={{ flex: 1, minHeight: 44 }} />
          <Button label="Sur Google" variant="ghost" onPress={() => void WebBrowser.openBrowserAsync(REVIEW_LINKS.google)} style={{ flex: 1, minHeight: 44 }} />
        </View>
      </Card>

      <SectionTitle>Dans l'application</SectionTitle>
      {failed && <Notice>Les avis ne sont pas disponibles pour le moment.</Notice>}
      {reviews && reviews.length === 0 && !failed && <Body muted>Les premiers avis de l'application arrivent bientôt.</Body>}
      {own.count > 0 && <Body muted style={{ marginBottom: space.sm }}>Moyenne : {String(own.average).replace('.', ',')} / 5 · {own.count} avis</Body>}
      {reviews?.map((r) => (
        <Card key={r.id} style={{ marginBottom: space.sm }}>
          <Stars value={r.rating} />
          <Body style={{ marginTop: space.sm }}>{r.comment}</Body>
          <Body muted style={{ fontSize: 13, marginTop: 6 }}>{r.author_name}</Body>
        </Card>
      ))}

      {eligible && last && <ReviewForm booking={last} onSent={() => void getLastBooking().then(setLast)} />}
      {!eligible && <Notice>Après votre rendez-vous, vous pourrez laisser votre avis ici.</Notice>}
    </Screen>
  );
}

function ReviewForm({ booking, onSent }: { booking: BookingConfirmation; onSent: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  const send = async () => {
    setBusy(true); setMsg(undefined);
    try {
      await submitReview({ bookingId: booking.id, cancelToken: booking.cancelToken, rating, comment });
      setSent(true); onSent();
    } catch (e) {
      setMsg(MESSAGES[(e as { code?: ReviewErrorCode }).code ?? 'network']);
    } finally { setBusy(false); }
  };

  if (sent) return <Card style={{ marginTop: space.md }}><Body>Merci ! Votre avis sera publié après validation par l'équipe.</Body></Card>;
  return (
    <View style={{ marginTop: space.md }}>
      <SectionTitle>Laisser mon avis</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.md }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} étoile${n > 1 ? 's' : ''}`} accessibilityState={{ selected: rating === n }} onPress={() => setRating(n)} hitSlop={6}>
              <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={32} color={colors.champagne} />
            </Pressable>
          ))}
        </View>
        <Field label="Votre avis" multiline value={comment} onChangeText={setComment} maxLength={1000} style={{ minHeight: 110, textAlignVertical: 'top' }} />
        <Body muted style={{ fontSize: 12, marginBottom: space.sm }}>Votre prénom et l'initiale de votre nom seront affichés. L'avis est publié après validation.</Body>
        {msg && <Notice>{msg}</Notice>}
        <Button label="Envoyer mon avis" onPress={send} disabled={busy || rating < 1 || !validComment(comment)} />
      </Card>
    </View>
  );
}
