import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import Accueil from '../src/app/page';
import Raccourcis, { RACCOURCIS, choisirDomaine } from '../src/components/Raccourcis';
import { REFERENCE } from '../src/lib/reference';

const html = renderToStaticMarkup(<Accueil />);
const texte = html.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&apos;/g, "'").replace(/\s+/g, ' ');

test('raccourcis par domaine : 5 puces qui correspondent à de vrais domaines', () => {
  const r = renderToStaticMarkup(<Raccourcis />);
  assert.equal((r.match(/class="puce"/g) || []).length, 5);
  for (const x of RACCOURCIS) assert.ok(REFERENCE.themes.some((t) => t.cle === x.cle), x.cle);
  assert.match(texte, /Je cherche pour : Sport Culture Jeunesse Solidarité Environnement/);
});

test('choisirDomaine règle le menu « Domaine du projet »', () => {
  const select = { value: '' } as HTMLSelectElement;
  const faux = { getElementById: (id: string) => (id === 'theme' ? select : null) } as unknown as Document;
  assert.equal(choisirDomaine('culture', faux), true);
  assert.equal(select.value, 'culture');
  assert.equal(choisirDomaine('culture', { getElementById: () => null } as unknown as Document), false);
});

test('bandeau d\'engagements : 4 engagements vérifiables', () => {
  assert.equal((html.match(/<section class="engagements"[\s\S]*?<\/section>/)?.[0].match(/<li>/g) || []).length, 4);
  assert.match(texte, /Dossio n'est pas l'administration et ne dépose rien à votre place/);
});

test('avant / avec : 4 difficultés et 4 réponses', () => {
  const bloc = html.match(/<div class="avant-apres">[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.equal((bloc.match(/<li>/g) || []).length, 8);
  assert.match(texte, /Monter un dossier, avant et avec Dossio/);
});

test('les 10 parties du dossier sont listées', () => {
  const bloc = html.match(/<ul class="parties">[\s\S]*?<\/ul>/)?.[0] ?? '';
  assert.equal((bloc.match(/<li>/g) || []).length, 10);
  assert.match(bloc, /Lettre de demande/);
});

test('tarifs : offre conseillée et réassurance', () => {
  assert.match(html, /Association <span class="badge">Conseillé<\/span>/);
  assert.match(texte, /Sans engagement : résiliable à tout moment\./);
});

test('FAQ : objections sur l\'IA et ChatGPT', () => {
  assert.match(texte, /Un financeur peut-il refuser un dossier écrit avec l'aide de l'IA \?/);
  assert.match(texte, /Quelle différence avec ChatGPT \?/);
});

test('appel final avec un bouton vers le questionnaire', () => {
  assert.match(texte, /Prêt à trouver vos aides \? Cinq questions, sans compte\./);
  assert.match(html, /<section class="bande appel-final"/);
});

test('aucune preuve inventée : ni témoignage, ni logo client, ni chiffre d\'utilisateurs', () => {
  assert.doesNotMatch(texte, /témoignage|utilisateurs satisfaits|associations nous font confiance|\d[\d\s]* associations (accompagnées|inscrites|utilisatrices)/i);
});
