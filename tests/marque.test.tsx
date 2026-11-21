import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { Symbole } from '../src/components/Logo';
import { ACCROCHE, NOM } from '../src/lib/marque';

test('le nom est Dossio et l\'accroche le reprend', () => {
  assert.equal(NOM, 'Dossio');
  assert.ok(ACCROCHE.includes(NOM));
});

test('l\'icône d\'onglet (favicon.svg) a le même dessin que le symbole du logo', () => {
  const favicon = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
  const symbole = renderToStaticMarkup(<Symbole />);
  const formes = (svg: string) => (svg.match(/<(rect|path)[^>]*>/g) || []).map((t) => t.replace(/\s*\/?>$/, '').replace(/\s+/g, ' '));
  assert.deepEqual(formes(symbole), formes(favicon));
});

test('le symbole est décoratif pour les lecteurs d\'écran', () => {
  assert.match(renderToStaticMarkup(<Symbole />), /aria-hidden="true"/);
});
