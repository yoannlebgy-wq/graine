// POST /api/dossiers/rediger — rédige le dossier pour une aide.
// Corps : { projet: {…5 réponses, montant_demande?, public?}, aide_id, structure?: {nom, presentation, adherents, benevoles, salaries} }.
// Rédaction réelle (Claude) seulement si ANTHROPIC_API_KEY est remplie ET DOSSIO_REDACTION_SANS_COMPTE=1 :
// tant que les comptes n'existent pas, cela évite que n'importe qui consomme la clé. Sinon : rédaction simulée.
import { validerQuestionnaire } from '../../../../lib/questionnaire';
import { ErreurRedaction, MODELE_PAR_DEFAUT, lireNombre, lireStructure, redactionDemo, redactionReelleActive, redigerAvecClaude, type Dossier } from '../../../../lib/redaction';
import { trouverAide } from '../../../../lib/source-aides';

export async function POST(requete: Request): Promise<Response> {
  let corps: Record<string, unknown>;
  try {
    corps = (await requete.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ erreur: 'Requête illisible.' }, { status: 400 });
  }
  const validation = validerQuestionnaire(corps.projet);
  if (!validation.ok) return Response.json({ erreur: validation.message, champs: validation.erreurs }, { status: 400 });
  const brutProjet = (corps.projet ?? {}) as Record<string, unknown>;
  const projet = { ...validation.projet, montant_demande: lireNombre(brutProjet.montant_demande), public: typeof brutProjet.public === 'string' ? brutProjet.public.trim().slice(0, 300) : '' };
  const aide = typeof corps.aide_id === 'string' ? await trouverAide(corps.aide_id) : undefined;
  if (!aide) return Response.json({ erreur: 'Aide introuvable. Relancez la recherche.' }, { status: 404 });
  const structure = lireStructure(corps.structure);

  let mode: Dossier['mode'] = 'demo';
  let contenu;
  try {
    if (redactionReelleActive()) {
      contenu = await redigerAvecClaude({ cle: process.env.ANTHROPIC_API_KEY as string, modele: process.env.ANTHROPIC_MODELE || MODELE_PAR_DEFAUT, structure, projet, aide });
      mode = 'claude';
    } else {
      contenu = redactionDemo({ structure, projet, aide });
    }
  } catch (err) {
    const message = err instanceof ErreurRedaction ? err.message : 'La rédaction a échoué. Réessayez.';
    return Response.json({ erreur: message }, { status: 502 });
  }
  const dossier: Dossier = {
    aide: { id: aide.id, nom: aide.nom, porteurs: aide.porteurs, url: aide.url, date_limite: aide.date_limite, taux_max: aide.taux_max, source: aide.source },
    projet,
    structure,
    contenu,
    mode,
    cree_le: new Date().toISOString(),
  };
  return Response.json({ dossier });
}
