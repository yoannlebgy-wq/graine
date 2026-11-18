// Recherche des aides qui correspondent au projet : filtre (territoire, public, date limite)
// puis classement (domaine, territoire, mots de la description). Même logique que l'aperçu.
import type { Aide } from './aides';
import { aujourdhui, dateFr } from './format';
import type { ReponsesQuestionnaire } from './questionnaire';
import { departement, libelleTheme, typeStructure } from './reference';

export type AideTrouvee = Aide & { score: number; pourquoi: string; a_verifier: string };
export type ResultatRecherche = { aides: AideTrouvee[]; total: number; message?: string };

export const NOMBRE_MAX_RESULTATS = 8;

export function normaliser(t: string | null | undefined): string {
  return String(t ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`\-_/().,;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const MOTS_VIDES = new Set(
  'les des une pour avec dans sur par aux est sont nos notre nous vous votre leur leurs qui que quoi comme plus tout tous faire projet association'.split(' '),
);

/** Mots utiles de la description (plus de 3 lettres, sans mots vides, sans doublon). */
export function motsCles(texte: string): string[] {
  return [...new Set(normaliser(texte).split(' ').filter((m) => m.length > 3 && !MOTS_VIDES.has(m)))];
}

type Options = { aujourdhui?: string; max?: number };

export function rechercherAides(
  projet: Pick<ReponsesQuestionnaire, 'type' | 'departement' | 'theme' | 'description' | 'titre'>,
  aides: Aide[],
  options: Options = {},
): ResultatRecherche {
  const dep = projet.departement;
  if (!dep) return { aides: [], total: 0, message: 'Choisissez votre département pour lancer la recherche.' };
  const publics = typeStructure(projet.type).publics;
  const jour = options.aujourdhui ?? aujourdhui();

  const ouvertes = aides.filter(
    (a) =>
      (a.portee === 'nationale' || a.departements.includes(dep)) &&
      a.publics.some((p) => publics.includes(p)) &&
      (!a.date_limite || a.date_limite >= jour),
  );

  const mots = motsCles(`${projet.titre ?? ''} ${projet.description ?? ''}`);
  const theme = projet.theme;
  const d = departement(dep);

  const notes = ouvertes
    .map((a) => {
      let s = 0;
      if (theme && a.themes.includes(theme)) s += 40;
      if (a.departements.includes(dep)) s += a.portee === 'regionale' ? 12 : 20;
      if (a.portee === 'nationale') s += 5;
      const t = normaliser(`${a.nom} ${a.description} ${a.eligibilite}`);
      s += Math.min(25, mots.filter((m) => t.includes(m)).length * 3);
      if (a.date_limite) s += 3;
      return { a, s };
    })
    .sort((x, y) => y.s - x.s)
    .slice(0, options.max ?? NOMBRE_MAX_RESULTATS);

  return {
    total: ouvertes.length,
    aides: notes.map(({ a, s }) => {
      const raisons: string[] = [];
      if (theme && a.themes.includes(theme)) raisons.push(`elle vise le domaine « ${libelleTheme(theme)} »`);
      if (d && a.departements.includes(dep)) raisons.push(`elle couvre ${d.nom}`);
      if (a.portee === 'nationale') raisons.push('elle est ouverte partout en France');
      return {
        ...a,
        score: Math.min(95, 30 + s),
        pourquoi: raisons.length ? `Retenue car ${raisons.join(' et ')}.` : "Retenue d'après les mots de votre description.",
        a_verifier: a.date_limite
          ? `Vérifiez les conditions sur la fiche officielle avant le ${dateFr(a.date_limite)}.`
          : 'Vérifiez les conditions et le calendrier sur la fiche officielle.',
      };
    }),
  };
}
