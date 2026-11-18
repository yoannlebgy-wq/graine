import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import Accueil from '../src/app/page';
import RechercheAides, { FicheAide } from '../src/components/RechercheAides';
import { AIDES_DEMO } from '../src/lib/aides';
import { rechercherAides } from '../src/lib/recherche';

const html = renderToStaticMarkup(<Accueil />);
const texte = html.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&apos;/g, "'").replace(/\s+/g, ' ');

test('la page d\'accueil reprend la promesse et les garanties de l\'aperçu', () => {
  assert.match(texte, /Trouvez les subventions de votre association\. Graine écrit le dossier\./);
  assert.match(texte, /Recherche gratuite, sans compte\. 1 dossier offert, sans carte bancaire\. Rien d'inventé\./);
  assert.match(texte, /Répondez à cinq questions sur votre projet/);
});

test('les 5 questions sont présentes', () => {
  for (const nom of ['type', 'departement', 'theme', 'description', 'budget', 'date_debut', 'commune']) {
    assert.match(html, new RegExp(`name="${nom}"`), `champ ${nom}`);
  }
  assert.match(texte, /Chercher mes aides/);
  assert.equal((html.match(/<option value="\w{2,3}">\w{2,3} — /g) || []).length, 101, '101 départements');
});

test('tarifs : 0 €, 19 €/mois ou 149 €/an (12,42 €/mois), 49 €/mois', () => {
  assert.match(texte, /0 €/);
  assert.match(texte, /19 € par mois/);
  assert.match(texte, /ou 149 € par an, soit 12,42 € par mois/);
  assert.match(texte, /49 € par mois/);
  assert.match(texte, /Toute l'offre Association/);
});

test('la FAQ annonce la source et la date de mise à jour de chaque fiche', () => {
  assert.match(texte, /Chaque fiche indique sa source et sa date de mise à jour\./);
});

test('le mode démo est annoncé clairement', () => {
  assert.match(texte, /Mode démo : les aides affichées sont des exemples fictifs/);
});

test('aucun résultat affiché avant la recherche', () => {
  assert.doesNotMatch(html, /id="acc-zone-resultats"/);
});

const resultat = rechercherAides(
  { type: 'association', departement: '82', theme: 'sport', titre: '', description: 'Un minibus pour le club' },
  AIDES_DEMO,
  { aujourdhui: '2026-11-18' },
);

test('fiche d\'aide : bouton « (offert) », source et date de mise à jour, lien officiel', () => {
  const fiche = renderToStaticMarkup(<FicheAide aide={resultat.aides[0]} />);
  assert.match(fiche, /Rédiger ce dossier \(offert\)/);
  assert.match(fiche, /Source : exemple fictif \(mode démo\), fiche mise à jour le 1 novembre 2026/);
  assert.match(fiche, /Voir la fiche officielle/);
  assert.match(fiche, /rel="noopener noreferrer"/);
});

test('résultats : compteur et une fiche par aide', () => {
  const page = renderToStaticMarkup(<RechercheAides resultatInitial={resultat} />);
  assert.equal((page.match(/<article class="fiche">/g) || []).length, resultat.aides.length);
  assert.match(page, new RegExp(`${resultat.aides.length} aides retenues sur ${resultat.total} ouvertes`));
});

test('résultats vides : message d\'aide', () => {
  const page = renderToStaticMarkup(<RechercheAides resultatInitial={{ aides: [], total: 0 }} />);
  assert.match(page, /Aucune aide ouverte trouvée pour ces critères/);
});
