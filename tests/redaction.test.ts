import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AIDES_DEMO } from '../src/lib/aides';
import { CONSIGNES_SYSTEME, compterACompleter, ErreurRedaction, lireNombre, lireReponseJson, lireStructure, messageUtilisateur, nettoyerContenu, redactionDemo, redactionReelleActive, redigerAvecClaude, SECTIONS_TEXTE } from '../src/lib/redaction';

const projet = { type: 'association', departement: '82', commune: 'Montech', theme: 'sport', description: 'Acheter un minibus pour les jeunes du club.', titre: 'Un minibus', budget: 30000, date_debut: 'mars 2027', montant_demande: 12000, public: '45 jeunes' };
const aide = AIDES_DEMO[0];

test('9 parties de texte + le budget = 10 parties', () => {
  assert.equal(SECTIONS_TEXTE.length, 9);
  const c = nettoyerContenu({});
  assert.equal(Object.keys(c.textes).length, 9);
  assert.ok(Object.values(c.textes).every((t) => compterACompleter(t) === 1), 'partie absente = à compléter');
  assert.deepEqual(c.budget, { depenses: [], recettes: [], commentaire: '' });
});

test('budget nettoyé : montants arrondis, lignes vides retirées, montant inconnu = null', () => {
  const c = nettoyerContenu({ budget: { depenses: [{ poste: 'Minibus', montant: '29999.6' }, { poste: '', montant: 3 }], recettes: [{ source: 'Subvention demandée : Département', montant: null }] } });
  assert.deepEqual(c.budget.depenses, [{ poste: 'Minibus', montant: 30000 }]);
  assert.equal(c.budget.recettes[0].montant, null);
});

test('rédaction simulée : n\'invente rien, reprend les faits donnés', () => {
  const c = redactionDemo({ structure: { nom: 'Club des Coteaux', benevoles: 15 }, projet, aide });
  assert.match(c.textes.presentation, /Club des Coteaux/);
  assert.match(c.textes.presentation, /15 bénévoles/);
  assert.match(c.textes.presentation, /\[À COMPLÉTER : nombre d'adhérents\]/);
  assert.match(c.textes.lettre, /une subvention de 12000 €/);
  assert.equal(c.budget.recettes[0].source, `Subvention demandée : ${aide.porteurs}`);
  assert.ok(c.budget.depenses.every((l) => l.montant === null), 'aucun montant inventé');
});

test('consignes données à Claude : rien d\'inventé, marquage, pas de mention de Dossio ni de l\'IA, JSON', () => {
  assert.match(CONSIGNES_SYSTEME, /N'invente jamais/);
  assert.match(CONSIGNES_SYSTEME, /\[À COMPLÉTER : ce qu'il faut indiquer\]/);
  assert.match(CONSIGNES_SYSTEME, /Ne mentionne jamais Dossio, l'intelligence artificielle/);
  assert.match(CONSIGNES_SYSTEME, /Cerfa 12156/);
  assert.match(CONSIGNES_SYSTEME, /Subvention demandée : <nom du financeur>/);
  const m = messageUtilisateur({ structure: {}, projet, aide });
  assert.match(m, /"montant_demande_euros": 12000/);
  assert.match(m, /"departement": "Tarn-et-Garonne \(82\)"/);
  assert.match(m, /"taux_maximum_pourcent": 50/);
});

test('lecture de la réponse JSON, même entourée de texte', () => {
  assert.deepEqual(lireReponseJson('Voici :\n```json\n{"objectifs":"x"}\n```'), { objectifs: 'x' });
  assert.throws(() => lireReponseJson('pas de json'), ErreurRedaction);
});

test('appel à Claude : en-têtes, modèle, consignes, réponse convertie', async () => {
  let envoye: { url: string; init: RequestInit } | null = null;
  const recuperer = (async (url: string, init: RequestInit) => {
    envoye = { url, init };
    return new Response(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify({ objectifs: '- Emmener les jeunes aux matchs', budget: { depenses: [{ poste: 'Minibus', montant: 30000 }], recettes: [] } }) }] }));
  }) as unknown as typeof fetch;
  const c = await redigerAvecClaude({ cle: 'cle-test', modele: 'modele-test', structure: {}, projet, aide, recuperer });
  assert.equal(envoye!.url, 'https://api.anthropic.com/v1/messages');
  const h = envoye!.init.headers as Record<string, string>;
  assert.equal(h['x-api-key'], 'cle-test');
  assert.equal(h['anthropic-version'], '2023-06-01');
  const corps = JSON.parse(String(envoye!.init.body));
  assert.equal(corps.model, 'modele-test');
  assert.equal(corps.system, CONSIGNES_SYSTEME);
  assert.equal(c.textes.objectifs, '- Emmener les jeunes aux matchs');
  assert.match(c.textes.lettre, /À COMPLÉTER/, 'partie oubliée par Claude = à compléter');
  assert.equal(c.budget.depenses[0].montant, 30000);
});

test('appel à Claude : messages d\'erreur en français', async () => {
  const rep = (status: number) => (async () => new Response('{}', { status })) as unknown as typeof fetch;
  await assert.rejects(redigerAvecClaude({ cle: 'x', structure: {}, projet, aide, recuperer: rep(401) }), /clé de rédaction est refusée/);
  await assert.rejects(redigerAvecClaude({ cle: 'x', structure: {}, projet, aide, recuperer: rep(529) }), /très demandé/);
  await assert.rejects(redigerAvecClaude({ cle: 'x', structure: {}, projet, aide, recuperer: (async () => { throw new Error('x'); }) as unknown as typeof fetch }), /connexion a échoué/);
});

test('rédaction réelle seulement avec la clé ET l\'autorisation sans compte', () => {
  assert.equal(redactionReelleActive({}), false);
  assert.equal(redactionReelleActive({ ANTHROPIC_API_KEY: 'x' }), false);
  assert.equal(redactionReelleActive({ ANTHROPIC_API_KEY: 'x', DOSSIO_REDACTION_SANS_COMPTE: '1' }), true);
});

test('lecture de la structure et des nombres saisis', () => {
  assert.deepEqual(lireStructure({ nom: ' Club ', benevoles: '15', adherents: 'beaucoup' }), { nom: 'Club', presentation: undefined, adherents: null, benevoles: 15, salaries: null });
  assert.equal(lireNombre('12 000 €'), 12000);
  assert.equal(lireNombre('-3'), null);
});
