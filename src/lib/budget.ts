// Calculs du budget affichés sous l'éditeur : totaux, équilibre, part de la subvention demandée.
import { euros } from './format';
import type { Budget } from './redaction';

export function total(lignes: { montant: number | null }[]): number | null {
  return lignes.length && lignes.every((l) => l.montant != null) ? lignes.reduce((s, l) => s + (l.montant ?? 0), 0) : null;
}

export type Verification = { niveau: 'ok' | 'alerte' | 'info'; texte: string };

export function verifierEquilibre(b: Budget): Verification {
  const d = total(b.depenses);
  const r = total(b.recettes);
  if (d == null || r == null) return { niveau: 'info', texte: 'Complétez tous les montants pour vérifier que le budget est équilibré.' };
  if (d !== r) return { niveau: 'alerte', texte: `Le budget doit être équilibré : ${euros(d)} de dépenses pour ${euros(r)} de recettes.` };
  return { niveau: 'ok', texte: 'Budget équilibré.' };
}

export function verifierPartSubvention(b: Budget, tauxMax: number | null): Verification {
  const lignes = b.recettes.filter((l) => /subvention demand/i.test(l.source));
  const demande = total(lignes);
  const d = total(b.depenses);
  if (demande == null || d == null || d <= 0) {
    return { niveau: 'info', texte: 'Indiquez le montant de la subvention demandée et toutes les dépenses : Dossio calculera la part financée.' };
  }
  const pct = Math.round((demande / d) * 1000) / 10;
  const pctTexte = pct.toLocaleString('fr-FR');
  if (tauxMax && pct > tauxMax) {
    return {
      niveau: 'alerte',
      texte: `La subvention demandée (${euros(demande)}) couvre ${pctTexte} % des dépenses. Ce financeur finance au plus ${tauxMax} % : demandez au plus ${euros(Math.floor((d * tauxMax) / 100))}, ou ajoutez d'autres recettes.`,
    };
  }
  if (tauxMax) return { niveau: 'ok', texte: `La subvention demandée couvre ${pctTexte} % des dépenses : c'est dans la limite de ${tauxMax} % indiquée par ce financeur.` };
  return { niveau: 'info', texte: `La subvention demandée couvre ${pctTexte} % des dépenses. Vérifiez le taux maximum dans le règlement du financeur.` };
}
