import type { Metadata } from 'next';
import PageLegale, { AC } from '../../components/PageLegale';
import { NOM } from '../../lib/marque';

export const metadata: Metadata = { title: `Confidentialité — ${NOM}` };

export default function Page() {
  return (
    <PageLegale titre="Politique de confidentialité">
      <h2>Qui est responsable de vos données ?</h2>
      <p><AC>nom de l&apos;éditeur</AC>, joignable à <AC>adresse e-mail</AC>.</p>
      <h2>Quelles données, et pourquoi ?</h2>
      <ul>
        <li><strong>Vos réponses au questionnaire</strong> (type de structure, département, domaine, description du projet, budget) : pour chercher les aides. Sans compte, elles ne sont pas enregistrées.</li>
        <li><strong>Les informations sur votre structure et votre projet</strong> : pour rédiger le dossier que vous demandez.</li>
        <li><strong>Votre adresse e-mail et vos dossiers</strong>, quand les comptes seront ouverts : pour garder vos dossiers et vous envoyer les rappels de date limite.</li>
        <li><strong>Les informations de paiement</strong> : traitées directement par Stripe ; {NOM} ne voit jamais votre numéro de carte.</li>
      </ul>
      <p>Base légale : l&apos;exécution du service que vous demandez. Vos données ne sont ni vendues ni partagées à des fins publicitaires.</p>
      <h2>Qui y a accès ?</h2>
      <p>
        Les prestataires nécessaires au service : l&apos;hébergeur du site (<AC>nom</AC>), Anthropic pour la rédaction par Claude (le texte de votre
        projet lui est transmis au moment de la rédaction), Stripe pour le paiement et <AC>prestataire de base de données et d&apos;e-mails</AC>.
        Certains sont établis hors de l&apos;Union européenne : <AC>garanties de transfert, par exemple clauses contractuelles types</AC>.
      </p>
      <h2>Combien de temps ?</h2>
      <p><AC>durée de conservation des comptes, des dossiers et des factures</AC>.</p>
      <h2>Vos droits</h2>
      <p>
        Vous pouvez accéder à vos données, les corriger, les supprimer, les récupérer ou vous opposer à leur traitement en écrivant à <AC>adresse e-mail</AC>.
        Vous pouvez aussi saisir la CNIL (cnil.fr).
      </p>
      <h2>Cookies</h2>
      <p><AC>liste des cookies et traceurs ; un bandeau de consentement est obligatoire avant toute mesure publicitaire (Meta, TikTok)</AC>.</p>
    </PageLegale>
  );
}
