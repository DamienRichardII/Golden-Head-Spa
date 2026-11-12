// Visuels fournis par le client (captures). À remplacer par les originaux haute résolution.
export const IMAGES = {
  hero: require('../../assets/images/hero.jpg'),
  onboarding: require('../../assets/images/onboarding.jpg'),
  logo: require('../../assets/images/logo.jpg'),
};

// Photo propre à chaque soin (fournies par la cliente). Retour sur `hero` si un soin n'a pas encore de photo.
const RITUAL_IMAGES: Record<string, number> = {
  decouverte: require('../../assets/images/rituals/decouverte.jpg'),
  essentielle: require('../../assets/images/rituals/essentielle.jpg'),
  excellence: require('../../assets/images/rituals/excellence.jpg'),
  exception: require('../../assets/images/rituals/exception.jpg'),
  kids: require('../../assets/images/rituals/kids.jpg'),
  'golden-hour': require('../../assets/images/rituals/golden-hour.jpg'),
  signature: require('../../assets/images/rituals/signature.jpg'),
  relax: require('../../assets/images/rituals/relax.jpg'),
};
export const ritualImage = (id: string): number => RITUAL_IMAGES[id] ?? IMAGES.hero;
