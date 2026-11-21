import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { aidesVerifiees, ligneJournalEchec, obtenirCatalogue, trouverAide, viderCache } from '../src/lib/source-aides';
import { oublierJeton } from '../src/lib/aides-territoires';

const MAINTENANT = new Date('2026-11-18T12:00:00Z');
beforeEach(() => {
  viderCache();
  oublierJeton();
});

const pageAT = { next: null, results: [{ id: 9, name: 'Aide réelle de test', financers: ['Région'], perimeter: 'France', targeted_audiences: ['Associations'], submission_deadline: '2027-03-01', date_updated: '2026-11-01T10:00:00+01:00' }] };

test('mode démo : aides fictives, sans appel réseau', async () => {
  let appels = 0;
  const c = await obtenirCatalogue({ env: { DOSSIO_MODE_DEMO: '1' }, recuperer: (async () => { appels++; return new Response('{}'); }) as typeof fetch, maintenant: MAINTENANT });
  assert.equal(c.demo, true);
  assert.equal(appels, 0);
  assert.ok(c.aides.every((a) => a.source === 'demo'));
});

test('mode réel : aides vérifiées + Aides-territoires, mises en cache', async () => {
  let appels = 0;
  const recuperer = (async () => { appels++; return new Response(JSON.stringify(pageAT)); }) as typeof fetch;
  const c = await obtenirCatalogue({ env: {}, recuperer, maintenant: MAINTENANT });
  assert.equal(c.demo, false);
  assert.ok(c.aides.some((a) => a.id === 'at-9'));
  assert.ok(c.aides.some((a) => a.source === 'officielle'));
  assert.ok(!c.aides.some((a) => a.source === 'demo'));
  await obtenirCatalogue({ env: {}, recuperer, maintenant: new Date(MAINTENANT.getTime() + 60_000) });
  assert.equal(appels, 1, 'deuxième recherche servie par le cache');
});

test('API en panne : exemples fictifs avec un avertissement, pas de plantage, et une ligne de journal', async () => {
  const lignes: unknown[][] = [];
  const c = await obtenirCatalogue({ env: {}, recuperer: (async () => { throw new Error('réseau'); }) as typeof fetch, maintenant: MAINTENANT, journal: (...m) => lignes.push(m) });
  assert.equal(c.demo, true);
  assert.match(c.message ?? '', /ne répond pas/);
  assert.equal(lignes.length, 1);
  assert.match(String(lignes[0][0]), /erreur réseau \(réseau\)/);
});

test('API qui exige un jeton, sans clé : le code HTTP et le message sont journalisés', async () => {
  const lignes: unknown[][] = [];
  const recuperer = (async () => new Response('{"code":401,"message":"JWT Token not found"}', { status: 401 })) as typeof fetch;
  const c = await obtenirCatalogue({ env: {}, recuperer, maintenant: MAINTENANT, journal: (...m) => lignes.push(m) });
  assert.equal(c.demo, true);
  const ligne = String(lignes[0][0]);
  assert.match(ligne, /étape : aides, HTTP 401, message : JWT Token not found/);
  assert.match(ligne, /AUCUNE clé API/);
});

test('clé renseignée : connexion puis aides réelles ; la clé n\'apparaît jamais dans le journal', async () => {
  const appels: string[] = [];
  const recuperer = (async (url: string, init?: RequestInit) => {
    appels.push(url);
    const h = (init?.headers ?? {}) as Record<string, string>;
    if (url.endsWith('/api/connexion/')) return h['X-AUTH-TOKEN'] === 'cle-secrete' ? new Response('{"token":"jwt"}') : new Response('{"message":"Invalid credentials."}', { status: 401 });
    return h.Authorization === 'Bearer jwt' ? new Response(JSON.stringify(pageAT)) : new Response('{"code":401,"message":"JWT Token not found"}', { status: 401 });
  }) as typeof fetch;
  const c = await obtenirCatalogue({ env: { AIDES_TERRITOIRES_API_KEY: ' cle-secrete ' }, recuperer, maintenant: MAINTENANT, journal: () => assert.fail('aucun échec attendu') });
  assert.equal(c.demo, false);
  assert.ok(c.aides.some((a) => a.id === 'at-9'));
  assert.equal(appels[0], 'https://aides-territoires.beta.gouv.fr/api/connexion/');

  viderCache();
  oublierJeton();
  const lignes: unknown[][] = [];
  await obtenirCatalogue({ env: { AIDES_TERRITOIRES_API_KEY: 'mauvaise-cle' }, recuperer, maintenant: MAINTENANT, journal: (...m) => lignes.push(m) });
  const ligne = String(lignes[0][0]);
  assert.match(ligne, /étape : connexion, HTTP 401, message : Invalid credentials\./);
  assert.match(ligne, /clé API renseignée/);
  assert.doesNotMatch(ligne, /mauvaise-cle/);
});

test('ligne de journal pour une erreur inattendue', () => {
  assert.match(ligneJournalEchec(new Error('boum'), false), /erreur inattendue : boum/);
});

test('aides vérifiées : vraies fiches, lien https, date de vérification, régions développées', () => {
  const v = aidesVerifiees();
  assert.ok(v.length >= 7);
  for (const a of v) {
    assert.match(a.url, /^https:\/\//);
    assert.ok(a.maj, a.id);
    assert.doesNotMatch(a.nom, /exemple/i);
    assert.ok(a.portee === 'nationale' || a.departements.length > 0, a.id);
  }
  assert.equal(v.find((a) => a.id === 'ver-culture-contrat-ville-ge-2027')!.departements.length, 10);
});

test('trouverAide retrouve une aide vérifiée ou fictive', async () => {
  assert.equal((await trouverAide('demo-01', { env: { DOSSIO_MODE_DEMO: '1' } }))?.id, 'demo-01');
  assert.equal((await trouverAide('ver-caf-doubs-2027', { env: { DOSSIO_MODE_DEMO: '1' } }))?.porteurs, 'Caf du Doubs');
  assert.equal(await trouverAide('inconnue', { env: { DOSSIO_MODE_DEMO: '1' } }), undefined);
});
