# Dossio

Dossio (nom de travail précédent : Graine ; le dépôt GitHub s'appelle encore `graine`) trouve les aides publiques et les fondations qui correspondent au projet d'une association, d'un·e artiste ou d'une petite entreprise, puis rédige avec Claude le dossier de demande adapté à chaque financeur (présentation, objectifs, budget, lettre), à télécharger en Word.

Prix prévus : recherche gratuite, 1 dossier offert, puis 19 €/mois ou 149 €/an (Pro 49 €/mois).

## Pile choisie

| Rôle | Outil | Pourquoi |
| --- | --- | --- |
| Site et API | Next.js (App Router) + TypeScript | courant, un seul projet pour les pages et l'API, hébergement simple |
| Tests | `node:test` + `tsx` | aucun outil lourd, rapide, déjà dans Node |
| Aides publiques | API Aides-territoires (Licence Ouverte) | base publique gratuite (étape 3) |
| Rédaction | API Claude | dossier rédigé partie par partie (étape 4) |
| Export | bibliothèque `docx` | fichier Word prêt à compléter (étape 5) |
| Comptes et données | Supabase, région Europe | gratuit au départ (étape 6) |
| Paiement | Stripe, mode test d'abord | en dernier (étape 7) |
| Hébergement | Vercel | à décider au moment de la mise en ligne |

Le détail des étapes est dans [PLAN.md](PLAN.md).

## Lancer le site

Il faut Node.js 20.9 ou plus récent.

```bash
npm install
cp .env.example .env.local   # facultatif pour l'instant : le mode démo n'a besoin d'aucune clé
npm run dev
```

Puis ouvrir http://localhost:3000.

Sans aucun réglage, le site cherche les vraies aides (Aides-territoires + liste vérifiée à la main) et la rédaction est simulée.
Réglages utiles dans `.env.local` (voir `.env.example`) :

- `DOSSIO_MODE_DEMO=1` : seulement les 16 aides fictives, sans appel à Aides-territoires ;
- `ANTHROPIC_API_KEY` + `DOSSIO_REDACTION_SANS_COMPTE=1` : vraie rédaction par Claude (pour tester : sans comptes, n'importe qui peut l'utiliser) ;
- `NEXT_PUBLIC_DOSSIO_ETAT` : bandeau du haut (`demo`, `essai` ou `production`).

## Tester

```bash
npm test          # tous les tests (questionnaire, recherche, fiches, API, page d'accueil)
npm run typecheck # vérification des types
npm run build     # construction du site
```

Les tests ne lancent pas de navigateur : la page d'accueil est rendue en HTML avec React et vérifiée telle quelle.

## Organisation

```
src/app/page.tsx                 accueil : promesse, questionnaire, résultats, liens vers les autres pages
src/app/comment-ca-marche/       page « Comment ça marche » (étapes, avant / avec, extrait de dossier)
src/app/tarifs/                  page « Tarifs »
src/app/questions/               page « Questions fréquentes »
src/components/Cadre.tsx         en-tête avec le menu, pied de page, appel final des pages secondaires
src/app/inscription/page.tsx     arrivée après « Rédiger ce dossier (offert) » (provisoire)
src/app/api/recherche/route.ts   POST /api/recherche : l'outil gratuit « Chercher mes aides »
src/components/RechercheAides.tsx  questionnaire en 5 questions et fiches de résultats
src/lib/questionnaire.ts         lecture et vérification des 5 réponses
src/lib/recherche.ts             filtre et classement des aides
src/lib/fiche.ts                 textes des fiches (source, date limite, bouton)
src/lib/marque.ts                nom du produit (à un seul endroit)
src/components/Logo.tsx          logo (symbole dessiné en SVG + nom)
src/lib/aides-territoires.ts     branchement sur l'API Aides-territoires et tri des aides
src/lib/source-aides.ts          catalogue : Aides-territoires + aides vérifiées, cache, mode démo
src/lib/redaction.ts             rédaction : consignes et appel à Claude, rédaction simulée
src/lib/word.ts                  export Word
src/app/dossier/                 page du dossier (rédaction, relecture, Word)
src/app/api/dossiers/            POST rediger et POST word
src/app/mentions-legales, confidentialite, cgv   modèles de pages légales à compléter
src/lib/donnees/                 référentiel, aides vérifiées à la main, aides fictives
tests/                           tests automatiques
```

## Règles

- Aucune clé ni mot de passe dans le code : tout passe par `.env.local` (voir `.env.example`, valeurs vides).
- Rien d'inventé dans les dossiers : ce qui manque est marqué `[À COMPLÉTER : …]`.
- Chaque fiche d'aide affiche sa source et sa date de mise à jour (exigence de la Licence Ouverte d'Aides-territoires).
