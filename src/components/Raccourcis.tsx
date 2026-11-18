'use client';
// Raccourcis par domaine (inspirés des liens par secteur de Subventia et de l'entrée en un clic d'Aidéo)
// et bouton de l'appel final : ils remplissent le questionnaire et y ramènent.
import { useState, type ReactNode } from 'react';

export const RACCOURCIS = [
  { cle: 'sport', libelle: 'Sport' },
  { cle: 'culture', libelle: 'Culture' },
  { cle: 'jeunesse', libelle: 'Jeunesse' },
  { cle: 'solidarite', libelle: 'Solidarité' },
  { cle: 'environnement', libelle: 'Environnement' },
] as const;

function allerAuFormulaire() {
  const form = document.getElementById('form-recherche');
  if (!form) return;
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => (form.querySelector('#description') as HTMLElement | null)?.focus({ preventScroll: true }), 300);
}

export function choisirDomaine(cle: string, racine: Pick<Document, 'getElementById'> = document): boolean {
  const select = racine.getElementById('theme') as HTMLSelectElement | null;
  if (!select) return false;
  select.value = cle;
  return select.value === cle;
}

export default function Raccourcis() {
  const [actif, setActif] = useState<string | null>(null);
  return (
    <div className="raccourcis" role="group" aria-label="Accès rapide par domaine">
      <span>Je cherche pour :</span>
      {RACCOURCIS.map((r) => (
        <button
          key={r.cle}
          type="button"
          className="puce"
          aria-pressed={actif === r.cle}
          onClick={() => {
            if (choisirDomaine(r.cle)) setActif(r.cle);
            allerAuFormulaire();
          }}
        >
          {r.libelle}
        </button>
      ))}
    </div>
  );
}

export function BoutonVersRecherche({ children }: { children: ReactNode }) {
  return (
    <button className="bouton grand" type="button" onClick={allerAuFormulaire}>
      {children}
    </button>
  );
}
