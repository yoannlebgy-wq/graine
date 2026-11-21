import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import Accueil from '../src/app/page';
import CommentCaMarche from '../src/app/comment-ca-marche/page';
import Tarifs from '../src/app/tarifs/page';
import Questions from '../src/app/questions/page';
import RechercheAides, { FicheAide } from '../src/components/RechercheAides';
import { AIDES_DEMO } from '../src/lib/aides';
import { rechercherAides } from '../src/lib/recherche';

const html = renderToStaticMarkup(<Accueil />);
const site = [<Accueil key="a" />, <CommentCaMarche key="c" />, <Tarifs key="t" />, <Questions key="q" />].map((p) => renderToStaticMarkup(p)).join('\n');
const texte = site.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&apos;/g, "'").replace(/\s+/g, ' ');

test('la page d\'accueil reprend la promesse et les garanties de l\'aperçu', () => {
  assert.match(texte, /Trouvez les subventions de votre association\. Dossio écrit le dossier\./);
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

test('l\'accueil est court : ni tarifs, ni FAQ, ni étapes, mais des liens vers ces pages', () => {
  assert.doesNotMatch(html, /class="tarifs"/);
  assert.doesNotMatch(html, /<details>/);
  assert.doesNotMatch(html, /class="etapes"/);
  for (const href of ['/comment-ca-marche', '/tarifs', '/questions']) assert.match(html, new RegExp(`<a href="${href}"`));
  assert.match(html, /<section class="hero" id="recherche">/);
});

test('menu : chaque page séparée a son lien, marqué sur la page ouverte', () => {
  const tarifs = renderToStaticMarkup(<Tarifs />);
  assert.match(tarifs, /<a href="\/tarifs" aria-current="page">Tarifs<\/a>/);
  assert.doesNotMatch(tarifs, /<a href="\/questions" aria-current/);
  assert.doesNotMatch(html, /aria-current="page"/);
  for (const [Page, titre] of [[CommentCaMarche, 'Comment ça marche'], [Tarifs, 'Tarifs'], [Questions, 'Questions fréquentes']] as const) {
    const h = renderToStaticMarkup(<Page />);
    assert.match(h, new RegExp(`<h1 id="[^"]+">${titre}</h1>`));
    assert.match(h, /<a class="bouton grand" href="\/#recherche">Chercher mes aides<\/a>/, `appel final sur ${titre}`);
  }
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

test('nouveau nom : Dossio partout, plus aucune trace de « Graine » sur la page', () => {
  assert.doesNotMatch(site, /Graine/);
  assert.ok((texte.match(/Dossio/g) || []).length >= 8);
  assert.match(texte, /Dossio — aides issues d'/);
  assert.match(texte, /il ne l'invente pas : il la surligne/);
});

test('logo : symbole dessiné dans la page (sans image externe) et lien vers l\'accueil', () => {
  assert.match(html, /<a class="logo" href="\/" aria-label="Dossio, accueil"><svg[^>]*viewBox="0 0 32 32"/);
  assert.match(html, /fill="#fff07a"/);
  assert.doesNotMatch(html, /<img src="\/favicon.svg"/);
});
