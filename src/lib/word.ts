// Export Word du dossier (bibliothèque « docx ») : titres, budget en tableau,
// passages « [À COMPLÉTER : …] » surlignés en jaune comme à l'écran.
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { dateFr, euros } from './format';
import { REFERENCE } from './reference';
import { nettoyerContenu, type Dossier } from './redaction';

const MARQUE = /(\[À (?:COMPLÉTER|VÉRIFIER)[^\]]*\])/;
const EST_MARQUE = /^\[À (?:COMPLÉTER|VÉRIFIER)/;

/** Découpe un texte en morceaux, les passages à compléter étant surlignés. */
export function morceaux(texte: string): TextRun[] {
  return texte
    .split(MARQUE)
    .filter((m) => m !== '')
    .map((m) => (EST_MARQUE.test(m) ? new TextRun({ text: m, highlight: 'yellow', bold: true }) : new TextRun({ text: m })));
}

function paragraphes(texte: string): Paragraph[] {
  return texte.split('\n').map((ligne) => new Paragraph({ children: morceaux(ligne), spacing: { after: 120 } }));
}

function tableau(titre: string, lignes: { libelle: string; montant: number | null }[]): Table {
  const cellule = (t: string, gras = false, aCompleter = false) =>
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: gras, highlight: aCompleter ? 'yellow' : undefined })] })] });
  const total = lignes.length && lignes.every((l) => l.montant != null) ? lignes.reduce((s, l) => s + (l.montant ?? 0), 0) : null;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cellule(titre, true), cellule('Montant', true)] }),
      ...lignes.map((l) => new TableRow({ children: [cellule(l.libelle), cellule(l.montant == null ? 'à compléter' : euros(l.montant), false, l.montant == null)] })),
      new TableRow({ children: [cellule('Total', true), cellule(total == null ? 'à compléter' : euros(total), true, total == null)] }),
    ],
  });
}

export function nomFichier(dossier: Pick<Dossier, 'aide'>): string {
  const base = dossier.aide.nom.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).toLowerCase();
  return `dossier-${base || 'subvention'}.docx`;
}

export async function genererWord(dossier: Dossier): Promise<Buffer> {
  const contenu = nettoyerContenu({ ...dossier.contenu.textes, budget: dossier.contenu.budget });
  const enfants: (Paragraph | Table)[] = [
    new Paragraph({ text: 'Demande de subvention', heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: dossier.aide.nom, bold: true })] }),
    new Paragraph({ text: `Financeur : ${dossier.aide.porteurs || 'à préciser'}` }),
    ...(dossier.structure.nom ? [new Paragraph({ text: `Structure : ${dossier.structure.nom}` })] : []),
    ...(dossier.aide.date_limite ? [new Paragraph({ text: `Date limite : ${dateFr(dossier.aide.date_limite)}` })] : []),
  ];
  for (const s of REFERENCE.sections) {
    enfants.push(new Paragraph({ text: s.titre, heading: HeadingLevel.HEADING_1, spacing: { before: 240 } }));
    if (s.type === 'budget') {
      const b = contenu.budget;
      enfants.push(tableau('Dépenses', b.depenses.map((l) => ({ libelle: l.poste, montant: l.montant }))));
      enfants.push(new Paragraph({ text: '' }));
      enfants.push(tableau('Recettes', b.recettes.map((l) => ({ libelle: l.source, montant: l.montant }))));
      if (b.commentaire) enfants.push(...paragraphes(b.commentaire));
    } else {
      enfants.push(...paragraphes(contenu.textes[s.cle] ?? ''));
    }
  }
  enfants.push(new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 360 }, children: [new TextRun({ text: 'Relisez et complétez les passages surlignés avant d\'envoyer le dossier.', italics: true, color: '666666' })] }));
  const doc = new Document({
    creator: dossier.structure.nom || 'Demandeur',
    title: `Demande de subvention — ${dossier.aide.nom}`,
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ children: enfants }],
  });
  return Packer.toBuffer(doc);
}
