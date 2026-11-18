import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/app/api/recherche/route';

const appel = (corps: unknown) =>
  POST(new Request('http://localhost/api/recherche', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof corps === 'string' ? corps : JSON.stringify(corps),
  }));

test('POST /api/recherche renvoie les aides classées, en mode démo', async () => {
  const r = await appel({
    projet: { type: 'association', departement: '82', theme: 'sport', description: 'Acheter un minibus pour les jeunes du club.' },
  });
  assert.equal(r.status, 200);
  const data = await r.json();
  assert.equal(data.demo, true);
  assert.ok(data.aides.length > 0);
  assert.ok(data.total >= data.aides.length);
  assert.ok(data.aides.every((a: { score: number; pourquoi: string }) => a.score > 0 && a.pourquoi));
});

test('accepte aussi les réponses sans l\'enveloppe « projet »', async () => {
  const r = await appel({ departement: '75', theme: 'culture', description: 'Une fête de quartier avec des concerts.' });
  assert.equal(r.status, 200);
});

test('réponses incomplètes : 400 avec un message en français', async () => {
  const r = await appel({ projet: { departement: '', theme: '', description: '' } });
  assert.equal(r.status, 400);
  const data = await r.json();
  assert.match(data.erreur, /département/);
  assert.ok(data.champs.departement);
});

test('corps illisible : 400', async () => {
  const r = await appel('{pas du json');
  assert.equal(r.status, 400);
});
