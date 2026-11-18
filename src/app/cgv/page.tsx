import type { Metadata } from 'next';
import PageLegale, { AC } from '../../components/PageLegale';
import { NOM } from '../../lib/marque';

export const metadata: Metadata = { title: `Conditions de vente — ${NOM}` };

export default function Page() {
  return (
    <PageLegale titre="Conditions générales de vente">
      <h2>Le service</h2>
      <p>
        {NOM} aide à trouver des aides publiques et privées et rédige un projet de dossier de demande à partir des informations que vous donnez.
        Vous restez le demandeur : vous relisez, complétez, signez et déposez le dossier. {NOM} ne garantit pas l&apos;obtention d&apos;une aide.
      </p>
      <h2>Offres et prix</h2>
      <ul>
        <li>Découverte : 0 €. Recherche d&apos;aides illimitée et 1 dossier rédigé offert, sans carte bancaire.</li>
        <li>Association : 19 € par mois, ou 149 € par an. Dossiers rédigés illimités.</li>
        <li>Pro : 49 € par mois.</li>
      </ul>
      <p>Prix <AC>TTC ou HT : préciser selon le régime de TVA (franchise en base : « TVA non applicable, art. 293 B du CGI »)</AC>.</p>
      <h2>Paiement, durée et résiliation</h2>
      <p>
        Le paiement se fait par carte via Stripe. L&apos;abonnement est sans engagement : il se renouvelle chaque mois ou chaque année et se résilie à tout
        moment depuis la page Abonnement ; la résiliation prend effet à la fin de la période payée.
      </p>
      <h2>Droit de rétractation</h2>
      <p><AC>règles applicables aux clients particuliers (14 jours) et à ceux qui demandent un dossier tout de suite</AC>.</p>
      <h2>Responsabilité</h2>
      <p>
        Les informations sur les aides viennent de sources publiques ou des sites des financeurs, avec leur date de mise à jour ; elles peuvent changer.
        Vérifiez toujours les conditions sur la fiche officielle. {NOM} n&apos;invente aucune information : les passages à compléter sont signalés.
      </p>
      <h2>Litiges</h2>
      <p><AC>médiateur de la consommation et droit applicable</AC>.</p>
    </PageLegale>
  );
}
