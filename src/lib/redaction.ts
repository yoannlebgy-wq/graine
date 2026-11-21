// Rédaction du dossier : 10 parties, avec l'API Claude, ou simulée en mode démo.
// Règle d'or : rien d'inventé. Ce qui manque est écrit « [À COMPLÉTER : …] ».
import type { Aide } from './aides';
import { texteSansHtml } from './aides-territoires';
import type { ReponsesQuestionnaire } from './questionnaire';
import { departement, libelleTheme, REFERENCE, typeStructure } from './reference';

export type LigneDepense = { poste: string; montant: number | null };
export type LigneRecette = { source: string; montant: number | null };
export type Budget = { depenses: LigneDepense[]; recettes: LigneRecette[]; commentaire: string };
export type ContenuDossier = { textes: Record<string, string>; budget: Budget };

/** Ce que la personne dit de sa structure (facultatif, rien n'est deviné). */
export type Structure = {
  nom?: string;
  presentation?: string;
  adherents?: number | null;
  benevoles?: number | null;
  salaries?: number | null;
};
export type ProjetDossier = ReponsesQuestionnaire & { montant_demande?: number | null; public?: string };

export type Dossier = {
  aide: Pick<Aide, 'id' | 'nom' | 'porteurs' | 'url' | 'date_limite' | 'taux_max' | 'source'>;
  projet: ProjetDossier;
  structure: Structure;
  contenu: ContenuDossier;
  mode: 'claude' | 'demo';
  cree_le: string;
};

export const SECTIONS_TEXTE = REFERENCE.sections.filter((s) => s.type === 'texte');

export const aCompleter = (quoi: string) => `[À COMPLÉTER : ${quoi}]`;
export const compterACompleter = (t: string | null | undefined) => (String(t ?? '').match(/\[À COMPLÉTER/g) || []).length;

const montant = (m: unknown): number | null =>
  m === null || m === undefined || m === '' || Number.isNaN(Number(m)) ? null : Math.round(Number(m));

export function nettoyerBudget(b: unknown): Budget {
  const o = (b && typeof b === 'object' ? b : {}) as Record<string, unknown>;
  const lignes = (v: unknown) => (Array.isArray(v) ? v : []) as Record<string, unknown>[];
  return {
    depenses: lignes(o.depenses)
      .map((l) => ({ poste: String(l.poste ?? '').slice(0, 200).trim(), montant: montant(l.montant) }))
      .filter((l) => l.poste),
    recettes: lignes(o.recettes)
      .map((l) => ({ source: String(l.source ?? '').slice(0, 200).trim(), montant: montant(l.montant) }))
      .filter((l) => l.source),
    commentaire: String(o.commentaire ?? '').slice(0, 1000).trim(),
  };
}

/** Garde exactement les 10 parties attendues ; une partie absente devient « à compléter ». */
export function nettoyerContenu(brut: unknown): ContenuDossier {
  const o = (brut && typeof brut === 'object' ? brut : {}) as Record<string, unknown>;
  const textes: Record<string, string> = {};
  for (const s of SECTIONS_TEXTE) {
    const v = o[s.cle];
    textes[s.cle] = typeof v === 'string' && v.trim() ? v.trim().slice(0, 6000) : aCompleter(s.titre.toLowerCase());
  }
  return { textes, budget: nettoyerBudget(o.budget) };
}

// ------------------------------------------------------------------ mode démo (repris de l'aperçu)
export function redactionDemo({ structure = {}, projet, aide }: { structure?: Structure; projet: ProjetDossier; aide: Pick<Aide, 'nom' | 'porteurs'> }): ContenuDossier {
  const dep = departement(projet.departement);
  const lieu = [projet.commune, dep?.nom].filter(Boolean).join(', ') || aCompleter('commune');
  const nom = structure.nom || aCompleter('nom de la structure');
  const financeur = aide.porteurs || 'votre institution';
  const demande = projet.montant_demande ?? null;
  const qui = typeStructure(projet.type).libelle.toLowerCase().replace(/^un·?e? |^une |^un /, 'une ');
  return nettoyerContenu({
    presentation: `${nom} est ${qui} implantée à ${lieu}. ${structure.presentation || aCompleter('date de création, mission et activités principales')}\n\nNos chiffres clés : ${structure.adherents ? `${structure.adherents} adhérents` : aCompleter("nombre d'adhérents")}, ${structure.benevoles ? `${structure.benevoles} bénévoles` : aCompleter('nombre de bénévoles')}.`,
    contexte: `${projet.description ? `Notre projet part d'un constat : ${projet.description}` : aCompleter('le besoin constaté sur le territoire')}\n\n${aCompleter('pourquoi ce projet maintenant (chiffres ou témoignages)')}`,
    projet: `Le projet « ${projet.titre || aCompleter('titre du projet')} » se déroulera à ${lieu}. ${projet.description || aCompleter('description concrète des actions')}\n\nIl s'inscrit dans le domaine « ${libelleTheme(projet.theme)} » et répond aux priorités de ${financeur} telles que décrites dans l'appel « ${aide.nom} ».`,
    objectifs: `- ${aCompleter('objectif principal')}\n- ${aCompleter('deuxième objectif')}\n- ${aCompleter('troisième objectif')}`,
    public: projet.public ? `Le projet s'adresse à : ${projet.public}.` : aCompleter('public visé et nombre de bénéficiaires'),
    moyens: `${structure.benevoles ? `${structure.benevoles} bénévoles` : aCompleter('nombre de bénévoles mobilisés')}${structure.salaries ? ` et ${structure.salaries} salarié(s)` : ''} porteront le projet. ${aCompleter('matériel, locaux et partenaires')}`,
    calendrier: `- ${projet.date_debut || aCompleter('mois de démarrage')} : lancement du projet\n- ${aCompleter('mois')} : réalisation des actions principales\n- ${aCompleter('mois')} : bilan et évaluation`,
    evaluation: `- ${aCompleter('nombre de participants visé')}\n- ${aCompleter('indicateur de satisfaction')}\n- ${aCompleter('indicateur de résultat')}`,
    lettre: `Madame, Monsieur,\n\nNous avons l'honneur de solliciter ${demande != null ? `une subvention de ${demande} €` : `une subvention ${aCompleter('montant demandé')}`} au titre de « ${aide.nom} » pour notre projet « ${projet.titre || aCompleter('titre')} ».\n\n${projet.description || aCompleter('résumé du projet en deux phrases')}\n\nNous restons à votre disposition pour tout complément et vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.\n\n[Prénom Nom, fonction]`,
    budget: {
      depenses: [
        { poste: 'Achats de matériel et fournitures', montant: null },
        { poste: 'Prestations et intervenants', montant: null },
        { poste: 'Communication', montant: null },
        { poste: 'Déplacements', montant: null },
      ],
      recettes: [
        { source: `Subvention demandée : ${financeur}`, montant: demande },
        { source: 'Fonds propres', montant: null },
        { source: 'Autres financements', montant: null },
      ],
      commentaire: projet.budget != null ? `Budget total du projet : ${projet.budget} €.` : 'Budget total à compléter.',
    },
  });
}

// ------------------------------------------------------------------ consignes données à Claude
export const CONSIGNES_SYSTEME = `Tu rédiges des demandes de subvention en français pour de petites associations de bénévoles, des artistes et de très petites entreprises.

Règles impératives :
1. N'utilise que les faits donnés dans les informations fournies. N'invente jamais de chiffre, de date, de nom, de partenaire, de résultat passé ni de citation.
2. Chaque fois qu'une information manque, écris exactement « [À COMPLÉTER : ce qu'il faut indiquer] » à sa place.
3. Ne mentionne jamais Dossio, l'intelligence artificielle, un assistant ou un outil : le dossier est celui de la structure.
4. Chaque partie doit se lire seule, sans renvoyer à une autre partie (elles seront copiées dans des champs séparés, comme ceux du formulaire Cerfa 12156).
5. Reprends les mots et les priorités de l'aide quand ils correspondent vraiment au projet ; ne prétends jamais remplir un critère qui n'est pas établi.
6. Style sobre et concret : phrases courtes, pas de superlatifs, vouvoiement du financeur dans la lettre.
7. Budget : une ligne de recette s'appelle exactement « Subvention demandée : <nom du financeur> ». Les montants inconnus valent null. Ne fais jamais tomber le budget juste en inventant des montants.
8. Si le texte de l'aide indique qu'elle ne finance pas ce type de structure ou de projet, écris-le au début de la partie « contexte » sous la forme « [À VÉRIFIER : … ] ».

Réponds uniquement avec un objet JSON, sans texte autour, avec ces clés :
presentation, contexte, projet, objectifs, public, moyens, calendrier, evaluation, lettre (textes),
budget : { "depenses": [{"poste": "...", "montant": nombre ou null}], "recettes": [{"source": "...", "montant": nombre ou null}], "commentaire": "..." }.`;

export function messageUtilisateur({ structure, projet, aide }: { structure: Structure; projet: ProjetDossier; aide: Aide }): string {
  const dep = departement(projet.departement);
  const donnees = {
    structure: {
      type: typeStructure(projet.type).libelle,
      nom: structure.nom || null,
      presentation: structure.presentation || null,
      adherents: structure.adherents ?? null,
      benevoles: structure.benevoles ?? null,
      salaries: structure.salaries ?? null,
    },
    projet: {
      titre: projet.titre,
      description: projet.description,
      domaine: libelleTheme(projet.theme),
      commune: projet.commune || null,
      departement: dep ? `${dep.nom} (${dep.code})` : null,
      public_vise: projet.public || null,
      budget_total_euros: projet.budget ?? null,
      montant_demande_euros: projet.montant_demande ?? null,
      demarrage: projet.date_debut || null,
    },
    aide: {
      nom: aide.nom,
      financeur: aide.porteurs,
      description: texteSansHtml(aide.description, 3000),
      eligibilite: texteSansHtml(aide.eligibilite, 1500),
      taux_maximum_pourcent: aide.taux_max,
      date_limite: aide.date_limite,
    },
  };
  return `Rédige le dossier de demande pour cette aide, à partir de ces seules informations :\n\n${JSON.stringify(donnees, null, 2)}`;
}

/** Extrait l'objet JSON de la réponse de Claude (tolère un texte ou des balises autour). */
export function lireReponseJson(texte: string): unknown {
  const debut = texte.indexOf('{');
  const fin = texte.lastIndexOf('}');
  if (debut < 0 || fin <= debut) throw new ErreurRedaction("La rédaction n'a pas pu être lue. Réessayez.");
  try {
    return JSON.parse(texte.slice(debut, fin + 1));
  } catch {
    throw new ErreurRedaction("La rédaction n'a pas pu être lue. Réessayez.");
  }
}

export class ErreurRedaction extends Error {}

export const MODELE_PAR_DEFAUT = 'claude-sonnet-4-5';

/** Appelle l'API Messages de Claude (sans bibliothèque : un simple fetch). */
export async function redigerAvecClaude({
  cle,
  modele = MODELE_PAR_DEFAUT,
  structure,
  projet,
  aide,
  recuperer = fetch,
  delaiMs = 90_000,
}: {
  cle: string;
  modele?: string;
  structure: Structure;
  projet: ProjetDossier;
  aide: Aide;
  recuperer?: typeof fetch;
  delaiMs?: number;
}): Promise<ContenuDossier> {
  const controle = new AbortController();
  const minuteur = setTimeout(() => controle.abort(), delaiMs);
  let r: Response;
  try {
    r = await recuperer('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': cle, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: modele,
        max_tokens: 6000,
        system: CONSIGNES_SYSTEME,
        messages: [{ role: 'user', content: messageUtilisateur({ structure, projet, aide }) }],
      }),
      signal: controle.signal,
    });
  } catch {
    throw new ErreurRedaction('La rédaction a pris trop de temps ou la connexion a échoué. Réessayez dans un instant.');
  } finally {
    clearTimeout(minuteur);
  }
  if (!r.ok) {
    if (r.status === 401) throw new ErreurRedaction('La clé de rédaction est refusée : vérifiez ANTHROPIC_API_KEY.');
    if (r.status === 429 || r.status === 529) throw new ErreurRedaction('Le service de rédaction est très demandé. Réessayez dans une minute.');
    throw new ErreurRedaction(`Le service de rédaction a répondu une erreur (${r.status}). Réessayez.`);
  }
  const data = (await r.json()) as { content?: { type: string; text?: string }[] };
  const texte = (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('');
  return nettoyerContenu(lireReponseJson(texte));
}

// ------------------------------------------------------------------ lecture des données envoyées par le navigateur
export const lireNombre = (v: unknown): number | null => {
  const t = String(v ?? '').replace(/[\s  €]/g, '').replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};
const texte = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function lireStructure(brut: unknown): Structure {
  const o = (brut && typeof brut === 'object' ? brut : {}) as Record<string, unknown>;
  return {
    nom: texte(o.nom, 150) || undefined,
    presentation: texte(o.presentation, 2000) || undefined,
    adherents: lireNombre(o.adherents),
    benevoles: lireNombre(o.benevoles),
    salaries: lireNombre(o.salaries),
  };
}

export function redactionReelleActive(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.ANTHROPIC_API_KEY) && env.DOSSIO_REDACTION_SANS_COMPTE === '1';
}

