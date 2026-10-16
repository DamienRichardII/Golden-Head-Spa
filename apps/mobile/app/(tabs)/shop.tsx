import { Screen, Title, EmptyState, Notice } from '../../src/components/ui';

/** Aucun catalogue réel n'est fourni : pas de faux produits, achats désactivés. */
export default function Shop() {
  return (
    <Screen>
      <Title>Boutique</Title>
      <EmptyState title="Bientôt disponible" text="Notre sélection de soins capillaires et d'accessoires arrive prochainement." />
      <Notice>Interface prête à recevoir le catalogue réel. Les achats sont désactivés tant que le catalogue et le paiement ne sont pas validés.</Notice>
    </Screen>
  );
}
