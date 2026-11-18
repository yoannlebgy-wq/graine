// D'où viennent les aides montrées par Dossio :
// 1. l'API Aides-territoires (mise en cache 12 h),
// 2. une liste d'aides vérifiées à la main sur le site du financeur (src/lib/donnees/aides-verifiees.json),
// 3. en mode démo (DOSSIO_MODE_DEMO=1) ou si l'API ne répond pas : les aides fictives.
import { AIDES_DEMO, type Aide } from './aides';
import { chargerAidesTerritoires, URL_API_PAR_DEFAUT } from './aides-territoires';
import verifiees from './donnees/aides-verifiees.json';
import { REFERENCE } from './reference';

type AideVerifieeBrute = Omit<Aide, 'departements'> & { departements?: string[]; region?: string };

/** Aides vérifiées à la main ; une région est développée en ses départements. */
export function aidesVerifiees(): Aide[] {
  return (verifiees as AideVerifieeBrute[]).map(({ region, ...a }) => ({
    ...a,
    departements: region ? REFERENCE.departements.filter((d) => d.region === region).map((d) => d.code) : a.departements ?? [],
  }));
}

export type Catalogue = { aides: Aide[]; demo: boolean; message?: string; chargeLe: number };

const DUREE_CACHE_MS = 12 * 60 * 60 * 1000;
let cache: Catalogue | null = null;

export function modeDemo(env: Record<string, string | undefined> = process.env): boolean {
  return env.DOSSIO_MODE_DEMO === '1';
}

export function viderCache() {
  cache = null;
}

export async function obtenirCatalogue({
  env = process.env,
  recuperer = fetch,
  maintenant = new Date(),
}: { env?: Record<string, string | undefined>; recuperer?: typeof fetch; maintenant?: Date } = {}): Promise<Catalogue> {
  if (modeDemo(env)) return { aides: AIDES_DEMO, demo: true, chargeLe: maintenant.getTime() };
  if (cache && maintenant.getTime() - cache.chargeLe < DUREE_CACHE_MS) return cache;
  try {
    const { aides } = await chargerAidesTerritoires({ url: env.AIDES_TERRITOIRES_API_URL || URL_API_PAR_DEFAUT, recuperer, maintenant });
    const jour = maintenant.toISOString().slice(0, 10);
    const manuelles = aidesVerifiees().filter((a) => !a.date_limite || a.date_limite >= jour);
    cache = { aides: [...manuelles, ...aides], demo: false, chargeLe: maintenant.getTime() };
    return cache;
  } catch {
    // Pas de cache : on réessaiera à la prochaine recherche.
    return {
      aides: AIDES_DEMO,
      demo: true,
      message: "La base Aides-territoires ne répond pas pour le moment : voici des exemples fictifs. Réessayez dans quelques minutes.",
      chargeLe: maintenant.getTime(),
    };
  }
}

export async function trouverAide(id: string, options?: Parameters<typeof obtenirCatalogue>[0]): Promise<Aide | undefined> {
  const { aides } = await obtenirCatalogue(options);
  return aides.find((a) => a.id === id) ?? aidesVerifiees().find((a) => a.id === id) ?? AIDES_DEMO.find((a) => a.id === id);
}
