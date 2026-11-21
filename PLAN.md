# Plan de construction de Dossio

Une tranche utile par nuit, dans cet ordre. On coche ce qui est fait ; chaque étape arrive par une demande de fusion depuis une branche `nuit/AAAA-MM-JJ`.

Références : l'aperçu cliquable (claude.ai/artifact/9eSwfgQiPd7ABeghY8pTWK) et l'onglet « Analyse complète Graine (19 nov.) » du rapport du matin.

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
- [x] Sections inspirées des concurrents : raccourcis par domaine, engagements, avant / avec, 10 parties du dossier, offre conseillée, FAQ IA et ChatGPT, appel final (18 nov. 2026)
- [ ] Avant la mise en ligne : vérifier que chaque promesse de la page est vraie (rappels 7 jours avant, version Cerfa, paiement Stripe sans engagement)
- [x] Modèles de pages légales (mentions légales, confidentialité, conditions de vente) avec les passages à compléter ; page introuvable
- [ ] Compléter les pages légales et les faire relire

## 2. Questionnaire en 5 questions — fait (nuit du 18 nov. 2026)

- [x] Qui (association, artiste, petite entreprise), où (département, commune), quoi (domaine, description), combien (budget), quand (démarrage)
- [x] Vérification des réponses côté navigateur et côté serveur, messages d'erreur en français
- [x] `POST /api/recherche` et classement des aides (même logique que l'aperçu), sur les aides fictives
- [x] Fiche de résultat : raison, date limite, « à vérifier », **source et date de mise à jour**, bouton **« Rédiger ce dossier (offert) »**
- [x] Page d'arrivée provisoire `/inscription` qui garde l'aide choisie

## 3. Recherche réelle via l'API Aides-territoires — fait (18 nov. 2026, soir)

- [x] Client de l'API v1.1 (src/lib/aides-territoires.ts) : toutes les pages, délai maximal, conversion vers le format `Aide`
- [x] Tri fait par Dossio, car l'API ignore le filtre « public » et garde des fiches anciennes : public (associations, particuliers, entreprises), territoire (France, région, département, commune ; intercommunalités écartées faute de correspondance), date limite passée, fiche sans date non mise à jour depuis 24 mois
- [x] Cache de 12 h, repli sur les aides fictives avec un avertissement si l'API ne répond pas, mode démo forcé (`DOSSIO_MODE_DEMO=1`)
- [x] Liste d'aides vérifiées à la main sur le site du financeur (src/lib/donnees/aides-verifiees.json, 7 aides)
- [x] Tests avec des réponses au format de l'API (aucun appel réseau dans les tests)
- [x] Authentification ajoutée le 21 nov. 2026 (l'API répond désormais 401 « JWT Token not found » sans jeton) : clé `AIDES_TERRITOIRES_API_KEY` échangée contre un jeton JWT (POST /api/connexion/, en-tête X-AUTH-TOKEN), jeton gardé 23 h et redemandé sur un 401 ; échecs journalisés (étape, code HTTP, message)
- [ ] Demander la clé API sur aides-territoires.beta.gouv.fr (Mon compte → « Ma clé API ») et la mettre dans Vercel
- [ ] Tester sur le vrai site : combien d'aides restent pour les associations après le tri (l'API n'était pas joignable depuis la session de développement)
- [ ] Table intercommunalités → départements pour ne plus écarter les aides des EPCI
- [ ] Mettre à jour chaque semaine la liste vérifiée (veille de nuit)

## 4. Rédaction du dossier avec l'API Claude — fait (18 nov. 2026, soir)

- [x] 10 parties (présentation, contexte, projet, objectifs, public, moyens, calendrier, budget, évaluation, lettre)
- [x] Consignes : n'écrire qu'avec les faits donnés, `[À COMPLÉTER : …]` pour ce qui manque, jamais de mention de Dossio ni de l'IA, parties lisibles seules (Cerfa 12156), ligne « Subvention demandée : … » dans le budget
- [x] Appel direct à l'API Messages (sans bibliothèque), erreurs en français, réponse JSON vérifiée
- [x] Mode démo sans clé (rédaction simulée, comme l'aperçu) ; vraie rédaction seulement si `ANTHROPIC_API_KEY` et `DOSSIO_REDACTION_SANS_COMPTE=1` (garde-fou tant qu'il n'y a pas de comptes)
- [x] Page /dossier : infos facultatives sur la structure, message d'attente, éditeur des 10 parties, budget vérifié (équilibre, part de subvention)
- [ ] Premier essai réel avec la clé (sur Vercel) et relecture de 3 dossiers
- [ ] Réécriture d'une partie avec une consigne ; version Cerfa 12156 rubrique par rubrique (déjà dans l'aperçu)

## 5. Export Word — fait (18 nov. 2026, soir)

- [x] Fichier `.docx` avec titres, budget en tableau et passages à compléter surlignés en jaune (bibliothèque `docx`)

## 6. Comptes

- [ ] Inscription par lien envoyé par e-mail, « Ma structure », « Mes dossiers », 1 dossier offert par compte
- [ ] Rappels 7 jours avant la date limite

## 7. Paiement (en tout dernier)

- [ ] Stripe en mode test uniquement : 19 €/mois, 149 €/an, Pro 49 €/mois, portail client
- [ ] Rien en réel sans validation explicite
