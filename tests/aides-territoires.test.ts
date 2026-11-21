import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyserPerimetre, chargerAidesTerritoires, convertirAide, deduireThemes, departementDepuisCodePostal, publicsDossio, texteSansHtml, type AideBrute } from '../src/lib/aides-territoires';

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
