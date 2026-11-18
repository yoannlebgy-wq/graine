import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AIDES_DEMO, type Aide } from '../src/lib/aides';
import { motsCles, normaliser, rechercherAides } from '../src/lib/recherche';

const JOUR = '2026-11-18';
const projetClub = {
  type: 'association',
  departement: '82',
  theme: 'sport',
  titre: 'Un minibus pour le club',
  description: 'Acheter un minibus pour emmener les jeunes du club aux matchs et aux tournois.',
};

test('normaliser enlève accents, majuscules et ponctuation', () => {
  assert.equal(normaliser("L'Été, à Montauban !"), 'l ete a montauban !');
});

test('motsCles ignore les mots courts et les mots vides', () => {
  assert.deepEqual(motsCles('Nous voulons un minibus pour le club, le club !'), ['voulons', 'minibus', 'club']);
});

test('sans département : aucun résultat et un message', () => {
  const r = rechercherAides({ ...projetClub, departement: '' }, AIDES_DEMO, { aujourdhui: JOUR });
  assert.equal(r.aides.length, 0);
  assert.match(r.message ?? '', /département/);
});

test('club sportif du Tarn-et-Garonne : l\'aide départementale sport arrive en tête', () => {
  const r = rechercherAides(projetClub, AIDES_DEMO, { aujourdhui: JOUR });
  assert.equal(r.aides[0].id, 'demo-01');
  assert.match(r.aides[0].pourquoi, /Sport/);
  assert.match(r.aides[0].pourquoi, /Tarn-et-Garonne/);
  assert.ok(r.aides.length <= 8);
  for (let i = 1; i < r.aides.length; i++) assert.ok(r.aides[i - 1].score >= r.aides[i].score);
});

test('les aides dont la date limite est passée sont écartées', () => {
  const r = rechercherAides({ ...projetClub, theme: 'culture' }, AIDES_DEMO, { aujourdhui: JOUR });
  assert.ok(!r.aides.some((a) => a.id === 'demo-14'), 'demo-14 (limite au 1er oct. 2026) ne doit pas sortir');
});

test('une association ne voit pas les aides réservées aux entreprises ou aux personnes', () => {
  const r = rechercherAides({ ...projetClub, departement: '59', theme: 'economie' }, AIDES_DEMO, { aujourdhui: JOUR });
  assert.ok(!r.aides.some((a) => a.publics.every((p) => p === 'entreprises' || p === 'particuliers')));
});

test('une artiste voit les bourses ouvertes aux personnes', () => {
  const r = rechercherAides(
    { type: 'artiste', departement: '75', theme: 'culture', titre: '', description: 'Produire mon premier album' },
    AIDES_DEMO,
    { aujourdhui: JOUR },
  );
  assert.ok(r.aides.some((a) => a.id === 'demo-16'));
});

test('les aides d\'un autre département ne sortent pas', () => {
  const r = rechercherAides(projetClub, AIDES_DEMO, { aujourdhui: JOUR });
  assert.ok(!r.aides.some((a) => a.portee !== 'nationale' && !a.departements.includes('82')));
});

test('score plafonné à 95 et phrase « à vérifier » datée', () => {
  const r = rechercherAides(projetClub, AIDES_DEMO, { aujourdhui: JOUR });
  assert.ok(r.aides.every((a) => a.score <= 95));
  assert.match(r.aides[0].a_verifier, /28 février 2027/);
});

test('aide sans date limite : phrase « à vérifier » générique', () => {
  const sansDate: Aide = { ...AIDES_DEMO[8], id: 'x', date_limite: null };
  const r = rechercherAides({ ...projetClub, theme: 'numerique' }, [sansDate], { aujourdhui: JOUR });
  assert.equal(r.aides[0].a_verifier, 'Vérifiez les conditions et le calendrier sur la fiche officielle.');
});

test('toutes les aides de démo sont marquées comme exemples fictifs', () => {
  assert.equal(AIDES_DEMO.length, 16);
  for (const a of AIDES_DEMO) {
    assert.equal(a.source, 'demo');
    assert.match(a.nom, /\(exemple démo\)$/);
  }
});
