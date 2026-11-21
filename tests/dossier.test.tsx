import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { POST as rediger } from '../src/app/api/dossiers/rediger/route';
import { POST as word } from '../src/app/api/dossiers/word/route';
import EditeurDossier from '../src/components/EditeurDossier';
import { verifierEquilibre, verifierPartSubvention } from '../src/lib/budget';
import type { Dossier } from '../src/lib/redaction';
import { genererWord, morceaux, nomFichier } from '../src/lib/word';

process.env.DOSSIO_MODE_DEMO = '1';
delete process.env.ANTHROPIC_API_KEY;

const projet = { type: 'association', departement: '82', theme: 'sport', description: 'Acheter un minibus pour les jeunes du club.', montant_demande: '12000' };
const post = (fn: (r: Request) => Promise<Response>, corps: unknown) =>
  fn(new Request('http://localhost/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) }));

let dossier: Dossier;

test('POST /api/dossiers/rediger : dossier simulé sans clé', async () => {
  const r = await post(rediger, { projet, aide_id: 'demo-01', structure: { nom: 'Club des Coteaux', benevoles: '15' } });
  assert.equal(r.status, 200);
  dossier = (await r.json()).dossier;
  assert.equal(dossier.mode, 'demo');
  assert.equal(dossier.aide.id, 'demo-01');
  assert.equal(dossier.aide.taux_max, 50);
  assert.equal(dossier.projet.montant_demande, 12000);
  assert.match(dossier.contenu.textes.presentation, /Club des Coteaux/);
});

test('POST /api/dossiers/rediger : aide inconnue (404), réponses incomplètes (400)', async () => {
  assert.equal((await post(rediger, { projet, aide_id: 'nexiste-pas' })).status, 404);
  assert.equal((await post(rediger, { projet: { departement: '' }, aide_id: 'demo-01' })).status, 400);
});

test('POST /api/dossiers/word : un vrai fichier Word', async () => {
  const r = await post(word, { dossier });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Content-Type'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.match(r.headers.get('Content-Disposition') ?? '', /attachment; filename="dossier-fonds-departemental/);
  const octets = new Uint8Array(await r.arrayBuffer());
  assert.equal(String.fromCharCode(octets[0], octets[1]), 'PK', 'fichier .docx (zip)');
  assert.equal((await post(word, {})).status, 400);
});

test('Word : passages à compléter surlignés', async () => {
  const runs = morceaux('Avec [À COMPLÉTER : clubs] et [À VÉRIFIER : taux].');
  assert.equal(runs.length, 5);
  const buf = await genererWord(dossier);
  assert.ok(buf.length > 3000);
  assert.equal(nomFichier({ aide: { ...dossier.aide, nom: 'Aide « Été » 2027 !' } }), 'dossier-aide-ete-2027.docx');
});

test('budget : équilibre et part de subvention', () => {
  const b = { depenses: [{ poste: 'Minibus', montant: 30000 }], recettes: [{ source: 'Subvention demandée : Département', montant: 20000 }, { source: 'Fonds propres', montant: 10000 }], commentaire: '' };
  assert.equal(verifierEquilibre(b).niveau, 'ok');
  assert.equal(verifierEquilibre({ ...b, recettes: [b.recettes[0]] }).niveau, 'alerte');
  assert.equal(verifierEquilibre({ ...b, depenses: [{ poste: 'x', montant: null }] }).niveau, 'info');
  const p = verifierPartSubvention(b, 50);
  assert.equal(p.niveau, 'alerte');
  assert.match(p.texte, /66,7 %/);
  assert.match(p.texte, /demandez au plus 15 000 €/);
  assert.equal(verifierPartSubvention(b, 80).niveau, 'ok');
  assert.equal(verifierPartSubvention(b, null).niveau, 'info');
});

test('écran du dossier : 9 parties modifiables, budget, Word, mention « rédaction simulée »', () => {
  const html = renderToStaticMarkup(<EditeurDossier initial={dossier} />);
  assert.equal((html.match(/<textarea/g) || []).length, 9);
  assert.match(html, /Budget prévisionnel/);
  assert.match(html, /Télécharger en Word/);
  assert.match(html, /Rédaction simulée/);
  assert.match(html, /passages? \[À COMPLÉTER\]/);
});
