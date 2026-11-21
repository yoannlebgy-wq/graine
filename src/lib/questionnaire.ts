// Le questionnaire en 5 questions de la page d'accueil :
// 1. qui vous êtes, 2. où (département, commune), 3. quoi (domaine et description),
// 4. combien (budget), 5. quand (démarrage souhaité).
import { REFERENCE, departement } from './reference';

export type ReponsesQuestionnaire = {
  type: string;
  departement: string;
  commune: string;
  theme: string;
  description: string;
  titre: string;
  budget: number | null;
  date_debut: string;
};

export type ResultatValidation =
  | { ok: true; projet: ReponsesQuestionnaire }
  | { ok: false; erreurs: Partial<Record<keyof ReponsesQuestionnaire, string>>; message: string };

export const LONGUEUR_MIN_DESCRIPTION = 10;
export const LONGUEUR_MAX_DESCRIPTION = 2000;

const texte = (v: unknown, max = 200): string => (typeof v === 'string' || typeof v === 'number' ? String(v).trim().slice(0, max) : '');

/** Premier morceau de phrase de la description, pour servir de titre provisoire. */
export function titreDepuisDescription(description: string): string {
  return description.trim().split(/[.!?\n]/)[0].trim().slice(0, 90);
}

/**
 * Lit et vérifie les réponses (venues d'un formulaire ou d'une requête JSON).
 * N'invente rien : ce qui manque reste vide, et les champs obligatoires sont signalés.
 */
export function validerQuestionnaire(brut: unknown): ResultatValidation {
  const d = (brut && typeof brut === 'object' ? brut : {}) as Record<string, unknown>;
  const erreurs: Partial<Record<keyof ReponsesQuestionnaire, string>> = {};

  const type = texte(d.type, 30) || 'association';
  if (!REFERENCE.types.some((t) => t.cle === type)) erreurs.type = 'Choisissez qui vous êtes.';

  const dep = texte(d.departement, 3);
  if (!departement(dep)) erreurs.departement = 'Choisissez votre département.';

  const theme = texte(d.theme, 30);
  if (!REFERENCE.themes.some((t) => t.cle === theme)) erreurs.theme = 'Choisissez le domaine du projet.';

  const description = texte(d.description, LONGUEUR_MAX_DESCRIPTION);
  if (description.length < LONGUEUR_MIN_DESCRIPTION) erreurs.description = 'Décrivez votre projet en une ou deux phrases.';

  let budget: number | null = null;
  const budgetBrut = texte(d.budget, 15).replace(/[\s  €]/g, '').replace(',', '.');
  if (budgetBrut) {
    const n = Number(budgetBrut);
    if (Number.isFinite(n) && n >= 0) budget = Math.round(n);
    else erreurs.budget = 'Indiquez le budget en euros, sans lettres (par exemple 30000).';
  }

  if (Object.keys(erreurs).length) {
    const message = erreurs.departement || erreurs.theme || erreurs.description
      ? 'Choisissez un département et un domaine, et décrivez votre projet en une ou deux phrases.'
      : Object.values(erreurs)[0] as string;
    return { ok: false, erreurs, message };
  }

  return {
    ok: true,
    projet: {
      type,
      departement: dep,
      commune: texte(d.commune, 100),
      theme,
      description,
      titre: texte(d.titre, 120) || titreDepuisDescription(description),
      budget,
      date_debut: texte(d.date_debut, 60),
    },
  };
}
