// POST /api/dossiers/word — reçoit le dossier (tel que relu à l'écran) et renvoie le fichier Word.
import { nettoyerContenu, type Dossier } from '../../../../lib/redaction';
import { genererWord, nomFichier } from '../../../../lib/word';

export async function POST(requete: Request): Promise<Response> {
  let corps: { dossier?: Dossier };
  try {
    corps = (await requete.json()) as { dossier?: Dossier };
  } catch {
    return Response.json({ erreur: 'Requête illisible.' }, { status: 400 });
  }
  const d = corps.dossier;
  if (!d || !d.aide || typeof d.aide.nom !== 'string' || !d.contenu) {
    return Response.json({ erreur: 'Dossier manquant : rédigez d\'abord le dossier.' }, { status: 400 });
  }
  const dossier: Dossier = {
    ...d,
    structure: d.structure ?? {},
    contenu: nettoyerContenu({ ...(d.contenu.textes ?? {}), budget: d.contenu.budget }),
  };
  const fichier = await genererWord(dossier);
  return new Response(new Uint8Array(fichier), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${nomFichier(dossier)}"`,
    },
  });
}
