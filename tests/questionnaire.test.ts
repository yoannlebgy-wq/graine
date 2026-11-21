import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titreDepuisDescription, validerQuestionnaire } from '../src/lib/questionnaire';

const valide = {
  type: 'association',
  departement: '82',
  commune: ' Montech ',
  theme: 'sport',
  description: 'Acheter un minibus pour emmener les jeunes du club aux matchs. Et aux tournois.',
  budget: '30000',
  date_debut: 'mars 2027',
};

test('accepte les 5 réponses et nettoie les champs', () => {
  const r = validerQuestionnaire(valide);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.projet.commune, 'Montech');
  assert.equal(r.projet.budget, 30000);
  assert.equal(r.projet.titre, 'Acheter un minibus pour emmener les jeunes du club aux matchs');
  assert.equal(r.projet.date_debut, 'mars 2027');
});

test('type absent : association par défaut', () => {
  const r = validerQuestionnaire({ ...valide, type: '' });
  assert.equal(r.ok && r.projet.type, 'association');
});

test('refuse un département, un domaine ou une description manquants avec le message de l\'aperçu', () => {
  const r = validerQuestionnaire({ ...valide, departement: '', theme: 'inconnu', description: 'court' });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.ok(r.erreurs.departement);
  assert.ok(r.erreurs.theme);
  assert.ok(r.erreurs.description);
  assert.equal(r.message, 'Choisissez un département et un domaine, et décrivez votre projet en une ou deux phrases.');
});

test('refuse un département qui n\'existe pas', () => {
  const r = validerQuestionnaire({ ...valide, departement: '99' });
  assert.equal(r.ok, false);
});

test('budget : facultatif, accepte espaces et symbole euro, refuse les lettres', () => {
  const vide = validerQuestionnaire({ ...valide, budget: '' });
  assert.equal(vide.ok && vide.projet.budget, null);
  const espaces = validerQuestionnaire({ ...valide, budget: '12 500 €' });
  assert.equal(espaces.ok && espaces.projet.budget, 12500);
  const lettres = validerQuestionnaire({ ...valide, budget: 'beaucoup' });
  assert.equal(lettres.ok, false);
  if (!lettres.ok) assert.match(lettres.message, /budget/);
});

test('budget négatif refusé', () => {
  assert.equal(validerQuestionnaire({ ...valide, budget: '-5' }).ok, false);
});

test('type inconnu refusé', () => {
  assert.equal(validerQuestionnaire({ ...valide, type: 'banque' }).ok, false);
});

test('entrée qui n\'est pas un objet', () => {
  assert.equal(validerQuestionnaire(null).ok, false);
  assert.equal(validerQuestionnaire('texte').ok, false);
});

test('titre tiré de la première phrase, 90 caractères au plus', () => {
  assert.equal(titreDepuisDescription('Un festival de rue. Avec des concerts.'), 'Un festival de rue');
  assert.equal(titreDepuisDescription('a'.repeat(200)).length, 90);
});
