import type { Metadata } from 'next';
import PageLegale, { AC } from '../../components/PageLegale';
import { NOM } from '../../lib/marque';

export const metadata: Metadata = { title: `Mentions légales — ${NOM}` };

export default function Page() {
  return (
    <PageLegale titre="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        {NOM} est édité par <AC>nom et prénom ou raison sociale</AC>, <AC>statut : micro-entreprise, SAS…</AC>, immatriculé sous le numéro SIRET{' '}
        <AC>numéro SIRET</AC>, dont l&apos;adresse est <AC>adresse postale</AC>. Contact : <AC>adresse e-mail</AC>.
      </p>
      <p>Directeur de la publication : <AC>nom et prénom</AC>.</p>
      <h2>Hébergement</h2>
      <p>Le site est hébergé par <AC>nom de l&apos;hébergeur, adresse et téléphone</AC>.</p>
      <h2>Données sur les aides</h2>
      <p>
        Une partie des aides provient d&apos;Aides-territoires, réutilisée sous Licence Ouverte v2.0 d&apos;Etalab. Chaque fiche cite sa source et la date de sa
        dernière mise à jour. {NOM} n&apos;est pas l&apos;administration : vérifiez toujours les conditions sur la fiche officielle du financeur.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>Les textes, le logo et le code du site appartiennent à l&apos;éditeur. Les dossiers rédigés appartiennent à la structure qui les a demandés.</p>
    </PageLegale>
  );
}
