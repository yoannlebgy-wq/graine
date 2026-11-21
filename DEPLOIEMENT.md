# Mettre Dossio en ligne pour l'essayer (environ 30 minutes)

Trois comptes à créer, dans cet ordre. Aucune clé ne doit être envoyée par message ni écrite dans le code : elles se collent uniquement dans les réglages de Vercel.

## 1. GitHub : une branche principale avec tout le travail

Si Claude l'a déjà fait pour toi (réponse « oui » à sa question), passe à l'étape 2.

1. Ouvre `https://github.com/yoannlebgy-wq/graine/tree/920505f`.
2. Clique sur le menu des branches, écris `main`, puis « Create branch: main from 920505f ».
3. Settings → Branches → branche par défaut : `main`.
4. Pull requests → New pull request → `base: main` ← `compare: nuit/2026-11-18` → Create pull request → Merge pull request.

## 2. Vercel : le site en ligne

1. Va sur `https://vercel.com/signup` et choisis « Continue with GitHub ».
2. « Add New… » → « Project » → choisis le dépôt `graine` → « Import ».
3. Laisse les réglages proposés (Framework : Next.js).
4. Ouvre « Environment Variables » et ajoute :
   - `NEXT_PUBLIC_DOSSIO_ETAT` = `essai`
5. Clique « Deploy ». Après 1 à 3 minutes, Vercel donne une adresse en `.vercel.app`.
6. En cas d'échec : onglet « Build Logs », capture d'écran des dernières lignes rouges, à envoyer à Claude.

L'offre gratuite de Vercel suffit pour tester. Pour vendre, il faudra l'offre Pro (usage commercial).

## 3. Anthropic : la vraie rédaction par Claude

1. Va sur `https://console.anthropic.com` et crée un compte.
2. « Billing » : ajoute un moyen de paiement et quelques crédits, puis fixe une **limite de dépense mensuelle** basse (par exemple 10 USD).
3. « API Keys » → « Create Key » → copie la clé (elle ne s'affiche qu'une fois).
4. Dans Vercel : ton projet → Settings → Environment Variables, ajoute :
   - `ANTHROPIC_API_KEY` = la clé copiée
   - `DOSSIO_REDACTION_SANS_COMPTE` = `1` (seulement le temps des tests : sans comptes, n'importe qui pourrait utiliser ta clé)
5. Deployments → les trois points du dernier déploiement → « Redeploy ». Les variables ne s'appliquent qu'au déploiement suivant.

## 4. Tester

- Fais 3 recherches pour de vrais projets que tu connais.
- Rédige 1 ou 2 dossiers et télécharge-les en Word.
- Note ce qui cloche : aide hors sujet, texte bizarre, message d'erreur.
- Si une recherche affiche « La base Aides-territoires ne répond pas », signale-le : c'est la seule partie jamais essayée en vrai.

## Variables possibles (toutes facultatives)

| Variable | Valeur | Effet |
| --- | --- | --- |
| `NEXT_PUBLIC_DOSSIO_ETAT` | `demo`, `essai` ou `production` | bandeau en haut des pages |
| `NEXT_PUBLIC_DOSSIO_CONTACT` | une adresse e-mail | lien « Contact » en pied de page |
| `DOSSIO_MODE_DEMO` | `1` | seulement les aides fictives |
| `ANTHROPIC_API_KEY` | ta clé | rédaction par Claude |
| `ANTHROPIC_MODELE` | un nom de modèle | sinon `claude-sonnet-4-5` (vérifier sur docs.claude.com) |
| `DOSSIO_REDACTION_SANS_COMPTE` | `1` | autorise la vraie rédaction sans compte (tests seulement) |
