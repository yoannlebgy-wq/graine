// POST /api/recherche — l'outil gratuit « Chercher mes aides », sans compte.
// Corps attendu : { "projet": { type, departement, commune, theme, description, budget, date_debut } }.
// Les aides viennent d'Aides-territoires et de la liste vérifiée à la main (voir src/lib/source-aides.ts).
import { validerQuestionnaire } from '../../../lib/questionnaire';
import { rechercherAides } from '../../../lib/recherche';
import { obtenirCatalogue } from '../../../lib/source-aides';

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
  // Si Aides-territoires échoue, le code HTTP et le message partent dans les journaux (Vercel : Logs → /api/recherche).
  const catalogue = await obtenirCatalogue({ journal: (...morceaux) => console.error('[POST /api/recherche]', ...morceaux) });
  const resultat = rechercherAides(validation.projet, catalogue.aides);
  return Response.json({ ...resultat, demo: catalogue.demo, ...(catalogue.message ? { avertissement: catalogue.message } : {}) });
}
