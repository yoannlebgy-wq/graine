'use client';
// Page d'arrivée après « Rédiger ce dossier (offert) ».
// Les comptes (étape 6 du PLAN) et la rédaction (étape 4) ne sont pas encore construits :
// la page rappelle l'aide choisie et dit honnêtement ce qui arrive.
import { useEffect, useState } from 'react';
import Cadre from '../../components/Cadre';
import { CLE_EN_ATTENTE } from '../../components/RechercheAides';

type EnAttente = { aide_id?: string; aide_nom?: string } | null;

export default function Inscription() {
  const [attente, setAttente] = useState<EnAttente>(null);

  useEffect(() => {
    try {
      setAttente(JSON.parse(sessionStorage.getItem(CLE_EN_ATTENTE) || 'null'));
    } catch {
      setAttente(null);
    }
  }, []);

  return (
    <Cadre page="accueil">
      <div className="etroit app-principal">
        <h1>Créer mon compte</h1>
        {attente?.aide_nom ? (
          <div className="message succes">
            Aide choisie : « {attente.aide_nom} ». Votre premier dossier sera offert, sans carte bancaire.
          </div>
        ) : null}
        <p>
          La création de compte et la rédaction des dossiers arrivent dans les prochaines versions de Dossio.
          En attendant, la recherche d&apos;aides reste gratuite et sans compte.
        </p>
        <a className="bouton" href="/">Revenir à la recherche</a>
      </div>
    </Cadre>
  );
}
