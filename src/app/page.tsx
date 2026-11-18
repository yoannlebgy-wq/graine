// Page d'accueil de Dossio : la promesse, le questionnaire et les résultats.
// Le reste (Comment ça marche, Tarifs, Questions) est sur des pages séparées, ouvertes depuis le menu.
import Cadre from '../components/Cadre';
import Raccourcis from '../components/Raccourcis';
import RechercheAides from '../components/RechercheAides';
import { ACCROCHE, NOM } from '../lib/marque';

const SUITE = [
  { href: '/comment-ca-marche', titre: 'Comment ça marche', texte: `Les 3 étapes, avant et avec ${NOM}, et un extrait de dossier.` },
  { href: '/tarifs', titre: 'Tarifs', texte: 'Recherche gratuite, 1 dossier offert, puis 19 € par mois ou 149 € par an.' },
  { href: '/questions', titre: 'Questions fréquentes', texte: "D'où viennent les aides, l'IA, ChatGPT, vos informations." },
];

export default function Accueil() {
  return (
    <Cadre page="accueil">
        <RechercheAides>
          <div className="promesse">
            <h1>{ACCROCHE}</h1>
            <p className="garanties-mobile">Recherche gratuite, sans compte. 1 dossier offert, sans carte bancaire. Rien d&apos;inventé.</p>
            <p>
              Répondez à cinq questions sur votre projet. Dossio cherche parmi les aides publiques et les fondations, puis
              rédige une demande adaptée à chaque financeur. Vous relisez, vous complétez, vous envoyez.
            </p>
            <Raccourcis />
            <ul className="preuves">
              <li>Pour les associations, les artistes et les petites entreprises</li>
              <li>Recherche gratuite, sans créer de compte</li>
              <li>Aucun chiffre inventé : ce qui manque est surligné, à compléter par vous</li>
            </ul>
          </div>
        </RechercheAides>

        <section className="engagements" aria-label="Nos engagements">
          <div className="conteneur">
            <ul>
              <li><strong>Sources officielles</strong>Chaque aide renvoie vers la fiche du financeur.</li>
              <li><strong>Fiches datées</strong>Source et date de mise à jour sur chaque aide.</li>
              <li><strong>Rien d&apos;inventé</strong>Ce qui manque est surligné, à compléter par vous.</li>
              <li><strong>Vous restez le demandeur</strong>{NOM} n&apos;est pas l&apos;administration et ne dépose rien à votre place.</li>
            </ul>
          </div>
        </section>

      <section className="bande trame" aria-labelledby="titre-suite">
        <div className="conteneur">
          <h2 id="titre-suite">En savoir plus</h2>
          <ul className="cartes-suite">
            {SUITE.map((s) => (
              <li key={s.href}>
                <a href={s.href}>
                  <strong>{s.titre}</strong>
                  <span>{s.texte}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Cadre>
  );
}
