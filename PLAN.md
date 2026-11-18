# Plan de construction de Dossio

Une tranche utile par nuit, dans cet ordre. On coche ce qui est fait ; chaque étape arrive par une demande de fusion depuis une branche `nuit/AAAA-MM-JJ`.

Références : l'aperçu cliquable (claude.ai/artifact/9eSwfgQiPd7ABeghY8pTWK) et l'onglet « Analyse complète Dossio » du rapport du matin.

Le produit s'appelait Graine jusqu'au 18 nov. 2026 ; il s'appelle désormais Dossio.

## 0. Squelette — fait (nuit du 18 nov. 2026)

- [x] Projet Next.js + TypeScript, README en français, `.env.example` aux valeurs vides
- [x] Tests automatiques avec `node:test` et `tsx` (`npm test`)
- [ ] Vérifier `npm install`, `npm run build` et `npm run typecheck` sur une machine avec accès au registre npm (bloqué pendant la nuit du 18 nov.)

## 1. Page d'accueil reprise de l'aperçu — fait (nuit du 18 nov. 2026)

- [x] Promesse, garanties sur téléphone, « Comment ça marche », extrait de dossier, tarifs (dont « soit 12,42 € par mois »), FAQ, pied de page
- [x] Bandeau « Mode démo » tant que la vraie base n'est pas branchée
- [x] Nouveau nom (Dossio) et nouveau logo : chemise blanche sur fond vert, ligne surlignée en jaune (18 nov. 2026)
- [ ] Vérifier que le nom Dossio est libre (domaine .fr sur afnic.fr, marque sur data.inpi.fr) avant d'acheter quoi que ce soit
- [ ] Pages légales : mentions légales, confidentialité, conditions de vente (avant la mise en ligne)

## 2. Questionnaire en 5 questions — fait (nuit du 18 nov. 2026)

- [x] Qui (association, artiste, petite entreprise), où (département, commune), quoi (domaine, description), combien (budget), quand (démarrage)
- [x] Vérification des réponses côté navigateur et côté serveur, messages d'erreur en français
- [x] `POST /api/recherche` et classement des aides (même logique que l'aperçu), sur les aides fictives
- [x] Fiche de résultat : raison, date limite, « à vérifier », **source et date de mise à jour**, bouton **« Rédiger ce dossier (offert) »**
- [x] Page d'arrivée provisoire `/inscription` qui garde l'aide choisie

## 3. Recherche réelle via l'API Aides-territoires — prochaine étape

- [ ] Client de l'API (version fixée), conversion vers le format `Aide` de `src/lib/aides.ts` (`source: 'aides-territoires'`, `maj` = date de mise à jour de la fiche)
- [ ] Cache d'une nuit, repli sur la démo si l'API ne répond pas, compteur hebdomadaire des aides ouvertes aux associations (l'outil se recentre sur les collectivités)
- [ ] Liste de fondations tenue à la main (`source: 'fondation'`)
- [ ] Tests avec des réponses enregistrées de l'API (aucun appel réseau dans les tests)

## 4. Rédaction du dossier avec l'API Claude

- [ ] 10 parties (présentation, contexte, projet, objectifs, public, moyens, calendrier, budget, évaluation, lettre)
- [ ] Consignes : n'écrire qu'avec les faits donnés, marquer `[À COMPLÉTER : …]` ce qui manque, ne jamais mentionner Dossio ni l'IA dans le dossier, parties lisibles seules (Cerfa 12156)
- [ ] Message d'attente « Votre dossier offert pour « … » est en cours de rédaction » (texte déjà prêt dans `src/lib/fiche.ts`)
- [ ] Réécriture d'une partie avec une consigne ; version Cerfa 12156 rubrique par rubrique ; contrôle de la part de subvention
- [ ] Mode démo sans clé (rédaction simulée, comme l'aperçu)

## 5. Export Word

- [ ] Fichier `.docx` avec titres, budget en tableau et passages à compléter surlignés

## 6. Comptes

- [ ] Inscription par lien envoyé par e-mail, « Ma structure », « Mes dossiers », 1 dossier offert par compte
- [ ] Rappels 7 jours avant la date limite

## 7. Paiement (en tout dernier)

- [ ] Stripe en mode test uniquement : 19 €/mois, 149 €/an, Pro 49 €/mois, portail client
- [ ] Rien en réel sans validation explicite
