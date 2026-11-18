import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ligneEcheance, ligneSource, libelleBoutonRediger, messageRedaction } from '../src/lib/fiche';
import { dateFr, euros, joursRestants } from '../src/lib/format';

test('dateFr et euros en français', () => {
  assert.equal(dateFr('2026-11-01'), '1 novembre 2026');
  assert.equal(dateFr(null), '');
  assert.equal(euros(30000), '30 000 €');
  assert.equal(euros(null), '—');
});

test('joursRestants compte jusqu\'à la fin de la journée limite', () => {
  const maintenant = new Date('2026-11-18T10:00:00');
  assert.equal(joursRestants('2026-11-18', maintenant), 1);
  assert.equal(joursRestants('2026-11-28', maintenant), 11);
  assert.equal(joursRestants(null, maintenant), null);
});

test('source Aides-territoires avec la date de mise à jour (Licence Ouverte)', () => {
  assert.equal(
    ligneSource({ source: 'aides-territoires', maj: '2026-11-01' }),
    'Source : Aides-territoires, fiche mise à jour le 1 novembre 2026',
  );
  assert.equal(ligneSource({ source: 'aides-territoires', maj: null }), 'Source : Aides-territoires');
});

test('source fondation : date de vérification', () => {
  assert.equal(ligneSource({ source: 'fondation', maj: '2026-11-15' }), 'Source : site de la fondation, vérifiée le 15 novembre 2026');
});

test('source démo : jamais présentée comme une vraie fiche', () => {
  assert.match(ligneSource({ source: 'demo', maj: '2026-11-01' }), /^Source : exemple fictif \(mode démo\)/);
});

test('ligne de date limite, avec les jours restants sous 30 jours', () => {
  const maintenant = new Date('2026-11-18T10:00:00');
  assert.equal(ligneEcheance(null, maintenant), 'Pas de date limite indiquée');
  assert.equal(ligneEcheance('2026-11-28', maintenant), 'Date limite : 28 novembre 2026 (dans 11 jours)');
  assert.equal(ligneEcheance('2027-02-28', maintenant), 'Date limite : 28 février 2027');
});

test('bouton « (offert) » tant que le dossier offert est disponible', () => {
  assert.equal(libelleBoutonRediger(true), 'Rédiger ce dossier (offert)');
  assert.equal(libelleBoutonRediger(false), 'Rédiger ce dossier');
});

test('message d\'attente avec le nom de l\'aide', () => {
  assert.equal(
    messageRedaction('Fonds sport', true),
    'Votre dossier offert pour « Fonds sport » est en cours de rédaction. Comptez 20 à 40 secondes.',
  );
  assert.equal(messageRedaction('Fonds sport', false), 'Graine rédige votre dossier pour « Fonds sport ». Comptez 20 à 40 secondes.');
  assert.equal(messageRedaction(null, true), 'Graine rédige votre dossier. Comptez 20 à 40 secondes.');
});
