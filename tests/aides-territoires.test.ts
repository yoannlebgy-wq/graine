import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyserPerimetre, chargerAidesTerritoires, convertirAide, deduireThemes, departementDepuisCodePostal, ErreurAidesTerritoires,
  obtenirJeton, oublierJeton, publicsDossio, texteSansHtml, urlConnexion, type AideBrute,
} from '../src/lib/aides-territoires';

// Aides au format de l'API v1.1 (champs relevés sur l'API le 18 nov. 2026) ; contenus inventés pour le test.
const MAINTENANT = new Date('2026-11-18T12:00:00Z');
const base: AideBrute = {
  id: 1, name: 'Aide test aux clubs sportifs', url: '/aides/aide-test/', financers: ['Département test'],
  description: '<p>Soutien aux <strong>clubs sportifs</strong> amateurs.</p>', eligibility: '<p>Associations sportives.</p>',
  perimeter: 'Tarn-et-Garonne (Département)', targeted_audiences: ['Associations', 'Communes'], aid_types: ['Subvention'],
  submission_deadline: '2027-02-28', subvention_rate_upper_bound: 50, recurrence: 'Annuelle', date_updated: '2026-10-02T10:00:00+02:00',
};

test('périmètres : France, région, département, commune ; intercommunalités et bassins écartés', () => {
  assert.deepEqual(analyserPerimetre('France'), { portee: 'nationale', departements: [] });
  const occ = analyserPerimetre('Occitanie (Région)');
  assert.equal(occ?.portee, 'regionale');
  assert.ok(occ?.departements.includes('82') && occ.departements.length === 13);
  assert.deepEqual(analyserPerimetre('Tarn-et-Garonne (Département)'), { portee: 'departementale', departements: ['82'] });
  assert.deepEqual(analyserPerimetre('Côte-d\'Or (Département)'), { portee: 'departementale', departements: ['21'] });
  assert.deepEqual(analyserPerimetre('La Rochelle (Commune – 17000)'), { portee: 'departementale', departements: ['17'] });
  assert.deepEqual(analyserPerimetre('Paris (Commune – 75001, 75002, 75020)'), { portee: 'departementale', departements: ['75'] });
  assert.equal(analyserPerimetre('Toulouse Métropole (EPCI)'), null);
  assert.equal(analyserPerimetre('Adour-Garonne (Bassin hydrographique)'), null);
  assert.equal(analyserPerimetre(null), null);
});

test('codes postaux : Corse et outre-mer', () => {
  assert.equal(departementDepuisCodePostal('20000'), '2A');
  assert.equal(departementDepuisCodePostal('20200'), '2B');
  assert.equal(departementDepuisCodePostal('97400'), '974');
  assert.equal(departementDepuisCodePostal('7500'), null);
});

test('publics : associations, particuliers, entreprises ; collectivités ignorées', () => {
  assert.deepEqual(publicsDossio(['Communes', 'Associations', 'Particuliers', 'Entreprises privées', 'Agriculteurs']), ['associations', 'particuliers', 'entreprises']);
  assert.deepEqual(publicsDossio(['Communes', 'EPCI à fiscalité propre']), []);
});

test('domaines déduits du texte', () => {
  assert.ok(deduireThemes('Soutien aux clubs sportifs').includes('sport'));
  assert.ok(deduireThemes('Festival de musique et spectacle vivant').includes('culture'));
  assert.ok(deduireThemes('Rénovation énergétique des locaux').includes('environnement'));
});

test('texte HTML nettoyé', () => {
  assert.equal(texteSansHtml('<p>Un&nbsp;<b>test</b></p><p>Deux</p>'), 'Un test\nDeux');
});

test('conversion d\'une aide utilisable', () => {
  const a = convertirAide(base, MAINTENANT);
  assert.ok(a);
  assert.equal(a!.id, 'at-1');
  assert.equal(a!.source, 'aides-territoires');
  assert.equal(a!.url, 'https://aides-territoires.beta.gouv.fr/aides/aide-test/');
  assert.equal(a!.maj, '2026-10-02');
  assert.equal(a!.taux_max, 50);
  assert.deepEqual(a!.departements, ['82']);
  assert.deepEqual(a!.publics, ['associations']);
  assert.equal(a!.perimetre, 'Tarn-et-Garonne');
  assert.ok(a!.themes.includes('sport'));
  assert.equal(a!.description, 'Soutien aux clubs sportifs amateurs.');
});

test('écartées : date passée, fiche sans date trop ancienne, public non visé, territoire inconnu, sans nom', () => {
  assert.equal(convertirAide({ ...base, submission_deadline: '2022-12-31' }, MAINTENANT), null);
  assert.equal(convertirAide({ ...base, submission_deadline: null, date_updated: '2020-10-20T18:11:04+02:00' }, MAINTENANT), null);
  assert.ok(convertirAide({ ...base, submission_deadline: null, date_updated: '2026-01-15T10:00:00+01:00' }, MAINTENANT));
  assert.equal(convertirAide({ ...base, targeted_audiences: ['Communes'] }, MAINTENANT), null);
  assert.equal(convertirAide({ ...base, perimeter: 'CC Pays du Mont-Blanc (EPCI)' }, MAINTENANT), null);
  assert.equal(convertirAide({ ...base, name: ' ' }, MAINTENANT), null);
});

test('chargement : suit les pages « next » et compte les aides écartées', async () => {
  const pages: Record<string, unknown> = {
    'https://exemple.test/api/aids/?version=1.1': { next: 'https://exemple.test/api/aids/?page=2&version=1.1', results: [base, { ...base, id: 2, submission_deadline: '2021-01-01' }] },
    'https://exemple.test/api/aids/?page=2&version=1.1': { next: null, results: [{ ...base, id: 3, perimeter: 'France' }] },
  };
  const appels: string[] = [];
  const recuperer = async (url: string) => { appels.push(url); return new Response(JSON.stringify(pages[url])); };
  const r = await chargerAidesTerritoires({ url: 'https://exemple.test/api/aids/?version=1.1', recuperer, maintenant: MAINTENANT });
  assert.equal(appels.length, 2);
  assert.equal(r.recues, 3);
  assert.equal(r.ecartees, 1);
  assert.deepEqual(r.aides.map((a) => a.id), ['at-1', 'at-3']);
});

test('chargement : erreur claire si l\'API répond mal', async () => {
  await assert.rejects(chargerAidesTerritoires({ recuperer: async () => new Response('', { status: 503 }), maintenant: MAINTENANT }), /503/);
});

// --- Authentification (exigée depuis 2026 : 401 « JWT Token not found » sans jeton) ---

type Appel = { url: string; init?: RequestInit };
const entete = (init: RequestInit | undefined, nom: string) => (init?.headers as Record<string, string> | undefined)?.[nom];
const pageVide = (next: string | null = null) => new Response(JSON.stringify({ next, results: [base] }), { status: 200 });

test('connexion : adresse dérivée de l\'adresse des aides', () => {
  assert.equal(urlConnexion(), 'https://aides-territoires.beta.gouv.fr/api/connexion/');
  assert.equal(urlConnexion('https://exemple.test/api/aids/?version=1.1'), 'https://exemple.test/api/connexion/');
});

test('connexion : la clé part en POST dans X-AUTH-TOKEN, le jeton sert en Bearer, puis il est mis en cache', async () => {
  oublierJeton();
  const appels: Appel[] = [];
  const recuperer = async (url: string, init?: RequestInit) => {
    appels.push({ url, init });
    if (url.endsWith('/api/connexion/')) return new Response(JSON.stringify({ token: 'jwt-de-test' }), { status: 200 });
    return pageVide();
  };
  const r = await chargerAidesTerritoires({ cle: 'cle-de-test', recuperer, maintenant: MAINTENANT });
  assert.equal(r.aides.length, 1);
  assert.equal(appels[0].url, 'https://aides-territoires.beta.gouv.fr/api/connexion/');
  assert.equal(appels[0].init?.method, 'POST');
  assert.equal(entete(appels[0].init, 'X-AUTH-TOKEN'), 'cle-de-test');
  assert.equal(entete(appels[1].init, 'Authorization'), 'Bearer jwt-de-test');
  assert.equal(entete(appels[1].init, 'X-AUTH-TOKEN'), undefined, 'la clé ne part pas avec les aides');
  // Deuxième chargement, une heure plus tard : pas de nouvelle connexion.
  await chargerAidesTerritoires({ cle: 'cle-de-test', recuperer, maintenant: new Date(MAINTENANT.getTime() + 3_600_000) });
  assert.equal(appels.filter((a) => a.url.endsWith('/api/connexion/')).length, 1);
  // 24 h plus tard : jeton redemandé.
  await chargerAidesTerritoires({ cle: 'cle-de-test', recuperer, maintenant: new Date(MAINTENANT.getTime() + 24 * 3_600_000) });
  assert.equal(appels.filter((a) => a.url.endsWith('/api/connexion/')).length, 2);
});

test('connexion : jeton refusé (401) → redemandé une seule fois, puis la même page est rechargée', async () => {
  oublierJeton();
  let connexions = 0;
  let pages = 0;
  const recuperer = async (url: string, init?: RequestInit) => {
    if (url.endsWith('/api/connexion/')) {
      connexions++;
      return new Response(JSON.stringify({ token: `jwt-${connexions}` }), { status: 200 });
    }
    pages++;
    if (entete(init, 'Authorization') === 'Bearer jwt-1') return new Response('{"code":401,"message":"Expired JWT Token"}', { status: 401 });
    return pageVide();
  };
  const r = await chargerAidesTerritoires({ cle: 'cle', recuperer, maintenant: MAINTENANT });
  assert.equal(r.aides.length, 1);
  assert.equal(connexions, 2);
  assert.equal(pages, 2);
});

test('connexion : 401 persistant → erreur avec étape, code et message (pas de boucle)', async () => {
  oublierJeton();
  let appels = 0;
  const recuperer = async (url: string) => {
    appels++;
    if (url.endsWith('/api/connexion/')) return new Response(JSON.stringify({ token: 'jwt' }), { status: 200 });
    return new Response('{"code":401,"message":"Invalid JWT Token"}', { status: 401 });
  };
  await assert.rejects(chargerAidesTerritoires({ cle: 'cle', recuperer, maintenant: MAINTENANT }), (e: unknown) => {
    assert.ok(e instanceof ErreurAidesTerritoires);
    assert.equal(e.etape, 'aides');
    assert.equal(e.statut, 401);
    assert.equal(e.detail, 'Invalid JWT Token');
    return true;
  });
  assert.equal(appels, 4, 'connexion, page, reconnexion, page : puis arrêt');
});

test('connexion : clé refusée → erreur de l\'étape « connexion » avec le message de l\'API', async () => {
  oublierJeton();
  const recuperer = async () => new Response('{"code":401,"message":"Invalid credentials."}', { status: 401 });
  await assert.rejects(obtenirJeton({ cle: 'mauvaise', recuperer, maintenant: MAINTENANT }), (e: unknown) => {
    assert.ok(e instanceof ErreurAidesTerritoires);
    assert.equal(e.etape, 'connexion');
    assert.equal(e.statut, 401);
    assert.match(e.message, /Invalid credentials/);
    assert.doesNotMatch(e.message, /mauvaise/, 'la clé n\'apparaît jamais dans le message');
    return true;
  });
});

test('connexion : réponse sans « token » → erreur claire', async () => {
  oublierJeton();
  const recuperer = async () => new Response('{}', { status: 200 });
  await assert.rejects(obtenirJeton({ cle: 'cle', recuperer, maintenant: MAINTENANT }), /token/);
});

test('sans clé : le 401 « JWT Token not found » nomme la variable à renseigner', async () => {
  oublierJeton();
  const recuperer = async () => new Response('{"code":401,"message":"JWT Token not found"}', { status: 401 });
  await assert.rejects(chargerAidesTerritoires({ recuperer, maintenant: MAINTENANT }), (e: unknown) => {
    assert.ok(e instanceof ErreurAidesTerritoires);
    assert.equal(e.statut, 401);
    assert.match(e.detail, /JWT Token not found/);
    assert.match(e.detail, /AIDES_TERRITOIRES_API_KEY/);
    return true;
  });
});

test('le jeton ne part jamais vers une autre adresse donnée par « next »', async () => {
  oublierJeton();
  const appels: Appel[] = [];
  const recuperer = async (url: string, init?: RequestInit) => {
    appels.push({ url, init });
    if (url.endsWith('/api/connexion/')) return new Response(JSON.stringify({ token: 'jwt' }), { status: 200 });
    if (url.startsWith('https://autre.test')) return pageVide();
    return pageVide('https://autre.test/api/aids/?page=2');
  };
  await chargerAidesTerritoires({ cle: 'cle', recuperer, maintenant: MAINTENANT });
  assert.equal(entete(appels[1].init, 'Authorization'), 'Bearer jwt');
  assert.equal(entete(appels[2].init, 'Authorization'), undefined);
});

test('panne réseau ou délai dépassé → ErreurAidesTerritoires sans code HTTP', async () => {
  const recuperer = async () => {
    throw new Error('ECONNRESET');
  };
  await assert.rejects(chargerAidesTerritoires({ recuperer, maintenant: MAINTENANT }), (e: unknown) => {
    assert.ok(e instanceof ErreurAidesTerritoires);
    assert.equal(e.statut, null);
    assert.match(e.detail, /ECONNRESET/);
    return true;
  });
});
