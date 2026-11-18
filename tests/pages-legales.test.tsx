import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import Cgv from '../src/app/cgv/page';
import Confidentialite from '../src/app/confidentialite/page';
import MentionsLegales from '../src/app/mentions-legales/page';
import Introuvable from '../src/app/not-found';
import Accueil from '../src/app/page';

for (const [nom, Page, attendu] of [
  ['mentions légales', MentionsLegales, /Licence Ouverte v2\.0/],
  ['confidentialité', Confidentialite, /Anthropic pour la rédaction/],
  ['conditions de vente', Cgv, /149 € par an/],
] as const) {
  test(`page ${nom} : modèle à compléter, signalé comme tel`, () => {
    const html = renderToStaticMarkup(<Page />);
    assert.match(html, /Modèle préparé avant la mise en ligne/);
    assert.match(html, /\[À COMPLÉTER : /);
    assert.match(html, attendu);
  });
}

test('pied de page : liens légaux ; pas d\'adresse de contact inventée', () => {
  const html = renderToStaticMarkup(<Accueil />);
  for (const href of ['/mentions-legales', '/confidentialite', '/cgv']) assert.match(html, new RegExp(`href="${href}"`));
  assert.doesNotMatch(html, /mailto:/);
});

test('page introuvable', () => {
  assert.match(renderToStaticMarkup(<Introuvable />), /Page introuvable/);
});

test('bandeau du haut selon l\'état du site', async () => {
  const { etatSite } = await import('../src/components/Cadre');
  assert.equal(etatSite({}), 'demo');
  assert.equal(etatSite({ NEXT_PUBLIC_DOSSIO_ETAT: 'essai' }), 'essai');
  assert.equal(etatSite({ NEXT_PUBLIC_DOSSIO_ETAT: 'production' }), 'production');
  assert.equal(etatSite({ NEXT_PUBLIC_DOSSIO_ETAT: 'nimporte' }), 'demo');
});
