// Tarifs — page séparée, ouverte depuis le menu.
import type { Metadata } from 'next';
import Cadre, { AppelFinal } from '../../components/Cadre';
import { NOM } from '../../lib/marque';

export const metadata: Metadata = { title: `Tarifs — ${NOM}` };

export default function Page() {
  return (
    <Cadre page="tarifs">
      <section className="bande" aria-labelledby="titre-tarifs">
        <div className="conteneur">
          <h1 id="titre-tarifs">Tarifs</h1>
          <p>La recherche est gratuite. Vous payez seulement pour faire rédiger vos dossiers en illimité.</p>
          <div className="tarifs">
            <div className="tarif">
              <h3>Découverte</h3>
              <div className="prix">0 €</div>
              <ul>
                <li>Recherche d&apos;aides illimitée</li>
                <li>1 dossier rédigé offert, sans carte bancaire</li>
                <li>Export Word</li>
              </ul>
              <a className="bouton secondaire" href="/inscription">Créer mon compte</a>
            </div>
            <div className="tarif conseille">
              <h3>
                Association <span className="badge">Conseillé</span>
              </h3>
              <div className="prix">
                19 € <small>par mois</small>
              </div>
              <p className="aide-champ">ou 149 € par an, soit 12,42 € par mois</p>
              <ul>
                <li>Dossiers rédigés illimités</li>
                <li>Réécriture de chaque partie</li>
                <li>Rappels avant les dates limites</li>
              </ul>
              <a className="bouton" href="/inscription">Commencer</a>
            </div>
            <div className="tarif">
              <h3>Pro</h3>
              <div className="prix">
                49 € <small>par mois</small>
              </div>
              <ul>
                <li>Toute l&apos;offre Association</li>
                <li>Pour les petites entreprises et les personnes qui accompagnent plusieurs structures</li>
              </ul>
              <a className="bouton secondaire" href="/inscription">Commencer</a>
            </div>
          </div>
          <p className="aide-champ" style={{ marginTop: 12 }}>Sans engagement : résiliable à tout moment. Paiement sécurisé par Stripe.</p>
        </div>
      </section>
      <AppelFinal />
    </Cadre>
  );
}
