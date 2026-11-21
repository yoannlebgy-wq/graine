// Données de référence de Dossio : domaines, types de structure, départements,
// parties du dossier et offres. Reprises telles quelles de l'aperçu cliquable.
import donnees from './donnees/reference.json';

export type Theme = { cle: string; libelle: string };
export type TypeStructure = { cle: string; libelle: string; publics: string[] };
export type Departement = { code: string; nom: string; region: string };
export type SectionDossier = { cle: string; titre: string; type: 'texte' | 'budget' };
export type Offre = { plan: string; libelle: string };

export type Reference = {
  themes: Theme[];
  types: TypeStructure[];
  departements: Departement[];
  sections: SectionDossier[];
  offres: Record<string, Offre>;
  limites: { dossiersGratuits: number };
};

export const REFERENCE = donnees as Reference;

const parCode = new Map(REFERENCE.departements.map((d) => [d.code, d]));

export function departement(code: string | null | undefined): Departement | undefined {
  return code ? parCode.get(code) : undefined;
}

export function libelleTheme(cle: string): string {
  return REFERENCE.themes.find((t) => t.cle === cle)?.libelle ?? cle;
}

export function typeStructure(cle: string | null | undefined): TypeStructure {
  return REFERENCE.types.find((t) => t.cle === cle) ?? REFERENCE.types[0];
}
