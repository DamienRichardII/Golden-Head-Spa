/**
 * Avis Google sélectionnés par le propriétaire (captures transmises le 19/11/2026), publiés avec la mention de leur source.
 * Noms abrégés (prénom + initiale). Textes repris tels quels ; « … » = avis tronqué par Google.
 */
export type GoogleReview = { author: string; rating: 5; text: string };

export const GOOGLE_REVIEWS: readonly GoogleReview[] = [
  { author: 'Célia L.', rating: 5, text: "1ere expérience headspa avec Inès et c'était incroyable. Une détente absolue pendant 1h, du calme, le bruit de l'eau et surtout la douceur d'Ines. J'ai vraiment adoré ce moment et je vais le recommander autour de moi" },
  { author: 'Alexandra V.', rating: 5, text: "Mille merci pour cette expérience a l'occasion d'un cadeau anniversaire. Superbe accueil et tres agréable moment passer et des doigts de fée. Je recommande fortement. Je reviendrais. Merciiiii" },
  { author: 'Yanis A.', rating: 5, text: "J'ai offert ce cadeau à ma mère qui a adoré ce moment détente après avoir testé plusieurs head spa celui là reste le meilleur ! Elle en est ressortie détendue et reposée" },
  { author: 'Laurence S.', rating: 5, text: "J'ai eu un bon cadeau par mon mari que j'ai utilisé le 24 juillet. J'avais reçu le soin excellence qui fut un vrai plaisir et bonheur pour moi. Ce soin fut absolument incroyable de la tête aux pieds. Je me suis laissée à la détente de …" },
  { author: 'Charlene D.', rating: 5, text: "Un moment vachement appaisant et agréable. La dame qui sait occuper de moi, d'une gentillesse et d'une douceur. J'ai offert cette prestation à ma maman le lendemain, elle a également adoré. Je recommande" },
  { author: 'Lucile T.', rating: 5, text: "C'était la première fois que je faisais un Head Spa et j'ai beaucoup apprécié cette expérience ! Un vrai moment de détente et de bien-être, avec un accueil très agréable. Je recommande" },
  { author: 'Emma P.', rating: 5, text: "Expérience incroyable ! Je recommande vivement à toute personne qui voudrait un vrai moment de détente & de relaxation, Inès est vraiment très délicate, professionnelle, j'ai passé un véritable moment de bien-être durant 1h10..." },
];
