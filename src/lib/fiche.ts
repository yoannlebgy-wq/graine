// Textes affichés sur une fiche d'aide dans les résultats de recherche.
import type { Aide } from './aides';
import { dateFr, joursRestants } from './format';

/**
 * Ligne « Source » d'une fiche : d'où vient l'aide et quand la fiche a été mise à jour.
 * La Licence Ouverte d'Aides-territoires demande de citer la source et la date de mise à jour.
 */
export function ligneSource(aide: Pick<Aide, 'source' | 'maj'>): string {
  const quand = aide.maj ? dateFr(aide.maj) : '';
  switch (aide.source) {
    case 'aides-territoires':
      return quand ? `Source : Aides-territoires, fiche mise à jour le ${quand}` : 'Source : Aides-territoires';
    case 'officielle':
      return quand ? `Source : site du financeur, vérifiée le ${quand}` : 'Source : site du financeur';
    case 'fondation':
      return quand ? `Source : site de la fondation, vérifiée le ${quand}` : 'Source : site de la fondation';
    default:
      return quand ? `Source : exemple fictif (mode démo), fiche mise à jour le ${quand}` : 'Source : exemple fictif (mode démo)';
  }
}

/** Ligne « Date limite », avec le nombre de jours quand il en reste 30 ou moins. */
export function ligneEcheance(dateLimite: string | null, maintenant: Date = new Date()): string {
  if (!dateLimite) return 'Pas de date limite indiquée';
  const j = joursRestants(dateLimite, maintenant);
  const reste = j !== null && j >= 0 && j <= 30 ? ` (dans ${j} jour${j > 1 ? 's' : ''})` : '';
  return `Date limite : ${dateFr(dateLimite)}${reste}`;
}

/** Bouton de la fiche : le visiteur sans abonnement voit que ce dossier-là est offert. */
export function libelleBoutonRediger(dossierOffertDisponible: boolean): string {
  return dossierOffertDisponible ? 'Rédiger ce dossier (offert)' : 'Rédiger ce dossier';
}

/** Message affiché pendant la rédaction du dossier offert. */
export function messageRedaction(nomAide: string | null | undefined, offert: boolean): string {
  if (offert && nomAide) return `Votre dossier offert pour « ${nomAide} » est en cours de rédaction. Comptez 20 à 40 secondes.`;
  if (nomAide) return `Dossio rédige votre dossier pour « ${nomAide} ». Comptez 20 à 40 secondes.`;
  return 'Dossio rédige votre dossier. Comptez 20 à 40 secondes.';
}
