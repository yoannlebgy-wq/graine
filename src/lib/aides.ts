// Le format d'une aide dans Graine, et la liste d'aides fictives du mode démo.
// L'étape 3 du PLAN branchera l'API Aides-territoires sur ce même format.
import aidesDemo from './donnees/aides-demo.json';

export type SourceAide = 'aides-territoires' | 'fondation' | 'demo';

export type Aide = {
  id: string;
  source: SourceAide;
  nom: string;
  porteurs: string;
  description: string;
  eligibilite: string;
  url: string;
  url_depot: string;
  types: string[];
  appel_a_projets: boolean;
  recurrence: string;
  taux_min: number | null;
  taux_max: number | null;
  /** Date de dernière mise à jour de la fiche (AAAA-MM-JJ). */
  maj: string | null;
  date_limite: string | null;
  perimetre: string;
  portee: 'nationale' | 'regionale' | 'departementale';
  departements: string[];
  themes: string[];
  publics: string[];
};

/** Aides fictives, toutes marquées « (exemple démo) » : jamais montrées comme réelles. */
export const AIDES_DEMO = aidesDemo as Aide[];
