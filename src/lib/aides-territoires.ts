// Branchement sur l'API Aides-territoires (version 1.1, données sous Licence Ouverte v2.0).
// Depuis 2026, l'API exige une authentification (constat du 21 nov. 2026 : {"code":401,"message":"JWT Token not found"}).
// Parcours documenté par Aides-territoires : clé API personnelle (compte → « Ma clé API ») ;
// POST /api/connexion/ avec l'en-tête X-AUTH-TOKEN: <clé> → { "token": "<JWT>" } ;
// puis chaque appel porte l'en-tête Authorization: Bearer <JWT>. La clé et le jeton ne sont jamais journalisés.
// Constat du 18 nov. 2026 : l'API renvoie environ 1 650 aides, ignore le filtre « public visé »
// et contient des fiches anciennes. Dossio trie donc lui-même : public, territoire, date, fraîcheur.
import type { Aide } from './aides';
import { REFERENCE } from './reference';

export const URL_API_PAR_DEFAUT = 'https://aides-territoires.beta.gouv.fr/api/aids/?version=1.1';
/** Une aide sans date limite n'est gardée que si sa fiche a été mise à jour depuis moins de 24 mois. */
export const FRAICHEUR_MAX_MOIS = 24;
export const PAGES_MAX = 80;

export type AideBrute = {
  id: number | string;
  slug?: string;
  url?: string | null;
  name?: string | null;
  short_title?: string | null;
  financers?: string[] | null;
  description?: string | null;
  eligibility?: string | null;
  perimeter?: string | null;
  origin_url?: string | null;
  application_url?: string | null;
  targeted_audiences?: string[] | null;
  aid_types?: string[] | null;
  categories?: string[] | null;
  submission_deadline?: string | null;
  subvention_rate_lower_bound?: number | null;
  subvention_rate_upper_bound?: number | null;
  recurrence?: string | null;
  date_updated?: string | null;
};

const sansAccents = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const parNomDepartement = new Map(REFERENCE.departements.map((d) => [sansAccents(d.nom), d.code]));
const parRegion = new Map<string, string[]>();
for (const d of REFERENCE.departements) {
  const cle = sansAccents(d.region);
  parRegion.set(cle, [...(parRegion.get(cle) ?? []), d.code]);
}
const OUTRE_MER = ['971', '972', '973', '974', '976'];

export type Territoire = { portee: Aide['portee']; departements: string[] } | null;

/** Code de département à partir d'un code postal (Corse et outre-mer compris). */
export function departementDepuisCodePostal(cp: string): string | null {
  const c = cp.trim();
  if (!/^\d{5}$/.test(c)) return null;
  if (c.startsWith('97')) return c.slice(0, 3);
  if (c.startsWith('20')) return Number(c) < 20200 ? '2A' : '2B';
  return c.slice(0, 2);
}

/**
 * Traduit le périmètre texte d'Aides-territoires en territoire Dossio.
 * Exemples : « France », « Occitanie (Région) », « Tarn-et-Garonne (Département) », « La Rochelle (Commune – 17000) ».
 * Les intercommunalités (EPCI), bassins et périmètres sur mesure ne peuvent pas être placés : null.
 */
export function analyserPerimetre(perimetre: string | null | undefined): Territoire {
  if (!perimetre) return null;
  const p = perimetre.trim();
  const brut = sansAccents(p);
  if (/^(france|france metropolitaine|europe|union europeenne)\b/.test(brut) && !/\(/.test(p)) return { portee: 'nationale', departements: [] };
  if (/^(outre-mer|outre mer|drom|dom)\b/.test(brut)) return { portee: 'regionale', departements: [...OUTRE_MER] };
  const m = p.match(/^(.*)\(([^)]*)\)\s*$/);
  if (!m) return null;
  const nom = sansAccents(m[1].trim());
  const niveau = sansAccents(m[2]);
  if (niveau.startsWith('region')) {
    const deps = parRegion.get(nom);
    return deps ? { portee: 'regionale', departements: deps } : null;
  }
  if (niveau.startsWith('departement')) {
    const code = parNomDepartement.get(nom);
    return code ? { portee: 'departementale', departements: [code] } : null;
  }
  if (niveau.startsWith('commune')) {
    const deps = [...new Set((m[2].match(/\d{5}/g) ?? []).map(departementDepuisCodePostal).filter((x): x is string => Boolean(x)))];
    return deps.length ? { portee: 'departementale', departements: deps } : null;
  }
  return null;
}

/** Publics d'Aides-territoires → publics Dossio (associations, particuliers, entreprises). */
export function publicsDossio(audiences: string[] | null | undefined): string[] {
  const sortie = new Set<string>();
  for (const a of audiences ?? []) {
    const t = sansAccents(a);
    if (t.startsWith('association')) sortie.add('associations');
    else if (t.startsWith('particulier')) sortie.add('particuliers');
    else if (t.startsWith('entreprises privees') || t === 'entreprises' || t.startsWith('entreprise privee')) sortie.add('entreprises');
  }
  return [...sortie];
}

const MOTS_THEMES: Record<string, RegExp> = {
  sport: /\b(sport|sporti|club|activite physique)/,
  culture: /\b(cultur|artist|patrimoine|musique|spectacle|theatre|festival|livre|lecture|cinema|danse|arts?\b)/,
  jeunesse: /\b(jeune|jeunesse|enfan|educat|scolaire|etudiant)/,
  solidarite: /\b(solidar|social|precarit|pauvrete|alimentaire|insertion sociale|handicap|inclusion)/,
  environnement: /\b(environnement|ecolog|climat|energie|biodiversite|transition|dechet|eau\b|mobilite|nature|renovation energetique)/,
  sante: /\b(sante|medic|soin|handicap|bien-etre)/,
  emploi: /\b(emploi|insertion professionnelle|formation|recrutement|chomage)/,
  numerique: /\b(numerique|digital|informatique|internet)/,
  citoyennete: /\b(vie associative|benevol|citoyen|lien social|quartier|vie locale|participation)/,
  international: /\b(europe|international|erasmus|cooperation|mobilite internationale)/,
  economie: /\b(entreprise|economi|commerce|artisan|innovation|creation d.entreprise)/,
};

/** Domaines Dossio déduits des catégories, du nom et de la description (l'API ne donne pas toujours de catégories). */
export function deduireThemes(texte: string): string[] {
  const t = sansAccents(texte);
  return Object.entries(MOTS_THEMES).filter(([, re]) => re.test(t)).map(([cle]) => cle);
}

export function texteSansHtml(html: string | null | undefined, max = 1500): string {
  return String(html ?? '')
    .replace(/<(br|\/p|\/li|\/h\d)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n\s*\n+/g, '\n').trim()
    .slice(0, max);
}

function moisEntre(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

/** Convertit une aide brute ; renvoie null si elle n'est pas utilisable (territoire inconnu, date passée, trop ancienne…). */
export function convertirAide(brut: AideBrute, maintenant: Date = new Date()): Aide | null {
  const nom = (brut.name ?? '').trim();
  if (!nom) return null;
  const territoire = analyserPerimetre(brut.perimeter);
  if (!territoire) return null;
  const publics = publicsDossio(brut.targeted_audiences);
  if (!publics.length) return null;
  const jour = maintenant.toISOString().slice(0, 10);
  const limite = brut.submission_deadline ? brut.submission_deadline.slice(0, 10) : null;
  if (limite && limite < jour) return null;
  const maj = brut.date_updated ? brut.date_updated.slice(0, 10) : null;
  if (!limite) {
    if (!maj) return null;
    if (moisEntre(new Date(`${maj}T12:00:00`), maintenant) > FRAICHEUR_MAX_MOIS) return null;
  }
  const description = texteSansHtml(brut.description);
  const eligibilite = texteSansHtml(brut.eligibility, 800);
  const url = brut.url ? (brut.url.startsWith('http') ? brut.url : `https://aides-territoires.beta.gouv.fr${brut.url}`) : 'https://aides-territoires.beta.gouv.fr/';
  return {
    id: `at-${brut.id}`,
    source: 'aides-territoires',
    nom,
    porteurs: (brut.financers ?? []).join(', '),
    description,
    eligibilite,
    url,
    url_depot: brut.application_url ?? '',
    types: brut.aid_types ?? [],
    appel_a_projets: /appel/i.test((brut.aid_types ?? []).join(' ')),
    recurrence: brut.recurrence ?? '',
    taux_min: brut.subvention_rate_lower_bound ?? null,
    taux_max: brut.subvention_rate_upper_bound ?? null,
    maj,
    date_limite: limite,
    perimetre: (brut.perimeter ?? '').replace(/\s*\((Commune|Département|Région)[^)]*\)\s*$/, ''),
    portee: territoire.portee,
    departements: territoire.departements,
    themes: deduireThemes(`${(brut.categories ?? []).join(' ')} ${nom} ${description.slice(0, 600)}`),
    publics,
  };
}

type Recuperateur = (url: string, init?: RequestInit) => Promise<Response>;

/** Erreur d'Aides-territoires, avec ce qu'il faut pour la journaliser (jamais la clé ni le jeton). */
export class ErreurAidesTerritoires extends Error {
  constructor(
    readonly etape: 'connexion' | 'aides',
    readonly statut: number | null,
    readonly detail: string,
  ) {
    super(`Aides-territoires (${etape}) a répondu ${statut ?? 'sans code HTTP'} : ${detail}`);
    this.name = 'ErreurAidesTerritoires';
  }
}

/** Le jeton JWT est gardé en mémoire 23 h (validité annoncée : 24 h) ; un refus 401 le fait redemander. */
export const DUREE_JETON_MS = 23 * 60 * 60 * 1000;
let jetonEnCache: { valeur: string; cle: string; expire: number } | null = null;

export function oublierJeton() {
  jetonEnCache = null;
}

/** Adresse du point de connexion, sur le même site que l'adresse des aides. */
export function urlConnexion(urlAides: string = URL_API_PAR_DEFAUT): string {
  return `${new URL(urlAides).origin}/api/connexion/`;
}

/** Message lisible tiré d'une réponse en erreur (JSON {"message"} ou texte), coupé à 200 caractères. */
async function lireDetail(r: Response): Promise<string> {
  let texte = '';
  try {
    texte = await r.text();
  } catch {
    return '(réponse illisible)';
  }
  try {
    const json = JSON.parse(texte) as { message?: unknown; detail?: unknown };
    const m = json.message ?? json.detail;
    if (typeof m === 'string' && m) return m.slice(0, 200);
  } catch {
    // pas du JSON : on garde le texte
  }
  return texte.trim().slice(0, 200) || '(réponse vide)';
}

async function appeler(recuperer: Recuperateur, url: string, init: RequestInit, delaiMs: number, etape: 'connexion' | 'aides'): Promise<Response> {
  const controle = new AbortController();
  const minuteur = setTimeout(() => controle.abort(), delaiMs);
  try {
    return await recuperer(url, { ...init, signal: controle.signal });
  } catch (e) {
    const raison = controle.signal.aborted ? `pas de réponse en ${Math.round(delaiMs / 1000)} s` : e instanceof Error ? e.message : String(e);
    throw new ErreurAidesTerritoires(etape, null, `erreur réseau (${raison})`);
  } finally {
    clearTimeout(minuteur);
  }
}

/** Échange la clé API contre un jeton JWT (mis en cache). */
export async function obtenirJeton({
  cle,
  urlAides = URL_API_PAR_DEFAUT,
  recuperer = fetch,
  maintenant = new Date(),
  delaiMs = 15_000,
  forcer = false,
}: { cle: string; urlAides?: string; recuperer?: Recuperateur; maintenant?: Date; delaiMs?: number; forcer?: boolean }): Promise<string> {
  if (!forcer && jetonEnCache && jetonEnCache.cle === cle && maintenant.getTime() < jetonEnCache.expire) return jetonEnCache.valeur;
  const r = await appeler(recuperer, urlConnexion(urlAides), { method: 'POST', headers: { Accept: 'application/json', 'X-AUTH-TOKEN': cle } }, delaiMs, 'connexion');
  if (!r.ok) throw new ErreurAidesTerritoires('connexion', r.status, await lireDetail(r));
  let token: unknown;
  try {
    token = ((await r.json()) as { token?: unknown }).token;
  } catch {
    token = undefined;
  }
  if (typeof token !== 'string' || !token) throw new ErreurAidesTerritoires('connexion', r.status, 'réponse sans champ « token »');
  jetonEnCache = { valeur: token, cle, expire: maintenant.getTime() + DUREE_JETON_MS };
  return token;
}

/** Télécharge toutes les pages de l'API (en suivant « next ») et garde les aides utilisables. */
export async function chargerAidesTerritoires({
  url = URL_API_PAR_DEFAUT,
  cle,
  recuperer = fetch,
  maintenant = new Date(),
  pagesMax = PAGES_MAX,
  delaiMs = 15_000,
}: { url?: string; cle?: string; recuperer?: Recuperateur; maintenant?: Date; pagesMax?: number; delaiMs?: number } = {}): Promise<{ aides: Aide[]; recues: number; ecartees: number }> {
  const aides: Aide[] = [];
  let recues = 0;
  let suivante: string | null = url;
  let jeton = cle ? await obtenirJeton({ cle, urlAides: url, recuperer, maintenant, delaiMs }) : null;
  let jetonRenouvele = false;
  for (let page = 0; suivante && page < pagesMax; page++) {
    const entetes: Record<string, string> = { Accept: 'application/json' };
    // Le jeton ne part que vers le site d'Aides-territoires lui-même (jamais vers une autre adresse donnée par « next »).
    if (jeton && new URL(suivante).origin === new URL(url).origin) entetes.Authorization = `Bearer ${jeton}`;
    const r = await appeler(recuperer, suivante, { headers: entetes }, delaiMs, 'aides');
    if (r.status === 401 && cle && !jetonRenouvele) {
      // Jeton expiré ou révoqué : on en redemande un, une seule fois, et on refait la même page.
      jetonRenouvele = true;
      jeton = await obtenirJeton({ cle, urlAides: url, recuperer, maintenant, delaiMs, forcer: true });
      page--;
      continue;
    }
    if (!r.ok) {
      const detail = await lireDetail(r);
      throw new ErreurAidesTerritoires('aides', r.status, r.status === 401 && !cle ? `${detail} — clé API manquante : renseignez AIDES_TERRITOIRES_API_KEY` : detail);
    }
    const data = (await r.json()) as { next?: string | null; results?: AideBrute[] };
    for (const brut of data.results ?? []) {
      recues++;
      const a = convertirAide(brut, maintenant);
      if (a) aides.push(a);
    }
    suivante = data.next ?? null;
  }
  return { aides, recues, ecartees: recues - aides.length };
}
