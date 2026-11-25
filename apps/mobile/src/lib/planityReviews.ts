/**
 * Avis Planity sélectionnés par le propriétaire (captures transmises le 25/11/2026), publiés avec la mention « Avis Planity ».
 * Planity n'affiche pas le nom des clientes : seuls la note, le texte (repris tel quel) et la date sont indiqués.
 * Date au format JJ/MM/AAAA ; absente quand la capture ne la montrait pas en entier.
 */
export type PlanityReview = { rating: number; text: string; date?: string };

export const PLANITY_REVIEWS: readonly PlanityReview[] = [
  { rating: 5.0, date: '21/11/2026', text: "Cadeau offert par mes copines, sans regret. Un moment de détente comme on en a besoin. Le bruit de l'eau, le son sonore, les odeurs, tout est la pour un agréable moment." },
  { rating: 5.0, date: '20/11/2026', text: "On m'a offert cette prestation, j'ai adoré personne très sympathique et très professionnel je recommande" },
  { rating: 5.0, date: '16/11/2026', text: 'Super expérience , moment de détente au top Très bon accueil et une prestation de qualité je recommande' },
  { rating: 4.8, date: '14/11/2026', text: 'On est super bien accueilli !! Jai eu droit a 1h30 de pure détente suite a une carte cade!! On ne voie pas le temps passer tellement on se sent bien!!Je reviendrais sa cest sur et je recommande a 300%' },
  { rating: 5.0, text: "Un accueil et des soins au top. Merciii pour se moment fort agréable. J'ai passer un très bon moment, j'ai été très détente. Une expérience exceptionnelle 😊 😊" },
  { rating: 5.0, date: '08/11/2026', text: 'Accueil chaleureux,ambiance propice à la détente,prestation exceptionnelle,geste réalisé avec soin et douceur,je suis ressortie totalement détendue et ravie.Je recommande à 100%.Mille fois merci 💖' },
  { rating: 5.0, date: '08/11/2026', text: 'Accueil chaleureux, cadre sobre et apaisant. Très bonne prestation , très relaxant' },
  { rating: 5.0, date: '07/11/2026', text: 'Super à refaire' },
  { rating: 5.0, date: '29/10/2026', text: 'Moment très agréable… je recommande 👍' },
  { rating: 5.0, date: '27/10/2026', text: 'Un pur moment de détente qui dure jamais assez longtemps. Je recommande vivement' },
];
