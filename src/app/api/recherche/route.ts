// POST /api/recherche — l'outil gratuit « Chercher mes aides », sans compte.
// Corps attendu : { "projet": { type, departement, commune, theme, description, budget, date_debut } }.
// Pour l'instant, la recherche porte sur les aides fictives du mode démo ;
// l'étape 3 du PLAN la branchera sur l'API Aides-territoires.
import { AIDES_DEMO } from '../../../lib/aides';
import { validerQuestionnaire } from '../../../lib/questionnaire';
import { rechercherAides } from '../../../lib/recherche';

export async function POST(requete: Request): Promise<Response> {
  let corps: unknown;
  try {
    corps = await requete.json();
  } catch {
    return Response.json({ erreur: 'Requête illisible : envoyez les réponses au questionnaire en JSON.' }, { status: 400 });
  }
  const brut = corps && typeof corps === 'object' && 'projet' in corps ? (corps as { projet: unknown }).projet : corps;
  const validation = validerQuestionnaire(brut);
  if (!validation.ok) {
    return Response.json({ erreur: validation.message, champs: validation.erreurs }, { status: 400 });
  }
  const resultat = rechercherAides(validation.projet, AIDES_DEMO);
  return Response.json({ ...resultat, demo: true });
}
