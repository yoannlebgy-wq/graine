// Comment ça marche — page séparée, ouverte depuis le menu.
import type { Metadata } from 'next';
import Cadre, { AppelFinal } from '../../components/Cadre';
import { NOM } from '../../lib/marque';
import { REFERENCE } from '../../lib/reference';

export const metadata: Metadata = { title: `Comment ça marche — ${NOM}` };
const PARTIES = REFERENCE.sections.map((p) => (p.cle === 'public' ? 'Public visé' : p.cle === 'evaluation' ? 'Évaluation' : p.titre));

export default function Page() {
  return (
    <Cadre page="comment">
      <section className="bande trame" aria-labelledby="titre-etapes">
        <div className="conteneur">
          <h1 id="titre-etapes">Comment ça marche</h1>
          <ol className="etapes">
            <li>
              <h3>Décrivez votre projet</h3>
              <p>Cinq questions : qui vous êtes, où, quoi, combien, quand. Dossio retient votre structure pour les prochaines demandes.</p>
            </li>
            <li>
              <h3>Choisissez une aide</h3>
              <p>Dossio classe les aides qui correspondent, avec la raison et la date limite. Chaque aide renvoie vers sa fiche officielle.</p>
            </li>
            <li>
              <h3>Relisez le dossier rédigé</h3>
              <p>Présentation, objectifs, budget, lettre : tout est écrit pour ce financeur. Vous complétez les passages surlignés et téléchargez en Word.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="bande" aria-labelledby="titre-avant">
        <div className="conteneur">
          <h2 id="titre-avant">Monter un dossier, avant et avec {NOM}</h2>
          <div className="avant-apres">
            <div className="colonne avant">
              <h3>Avant</h3>
              <ul>
                <li>Dix onglets ouverts pour trouver les aides de votre département</li>
                <li>La date limite découverte une semaine trop tard</li>
                <li>Un dossier réécrit de zéro pour chaque financeur</li>
                <li>Un budget qui ne tombe pas juste au moment de déposer</li>
              </ul>
            </div>
            <div className="colonne avec">
              <h3>Avec {NOM}</h3>
              <ul>
                <li>Cinq questions, puis les aides qui correspondent, classées avec la raison</li>
                <li>La date limite sur chaque fiche, et un rappel 7 jours avant</li>
                <li>Un dossier rédigé pour chaque financeur, à partir de votre structure présentée une seule fois</li>
                <li>Un budget vérifié : équilibre et part de la subvention</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bande trame" aria-labelledby="titre-extrait">
        <div className="conteneur extrait">
          <div>
            <h2 id="titre-extrait">Un dossier honnête, prêt à relire</h2>
            <p>
              Dossio écrit à partir de ce que vous lui dites, et seulement ça. Quand une information manque, il ne
              l&apos;invente pas : il la surligne pour que vous la complétiez.
            </p>
            <p>
              Vous gardez la main sur chaque partie : modifiez-la, ou demandez à Dossio de la réécrire avec votre consigne,
              par exemple « plus court » ou « insister sur les jeunes du quartier ».
            </p>
            <p>
              <strong>Chaque dossier compte 10 parties, plus une version rangée dans l&apos;ordre du Cerfa 12156 :</strong>
            </p>
            <ul className="parties">
              {PARTIES.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="feuille-dossier" aria-label={`Extrait d'un dossier rédigé par ${NOM}`}>
            <span className="tampon" aria-hidden="true">Dossier prêt</span>
            <h3>Objectifs</h3>
            <p>Permettre aux 45 jeunes licenciés du club de se rendre aux compétitions sans dépendre des parents disponibles.</p>
            <p>
              Ouvrir deux créneaux d&apos;entraînement le samedi pour les filles, à partir de{' '}
              <mark className="a-completer">[À COMPLÉTER : mois de démarrage]</mark>.
            </p>
            <p>
              Mutualiser le véhicule avec <mark className="a-completer">[À COMPLÉTER : clubs partenaires]</mark>.
            </p>
          </div>
        </div>
      </section>
      <AppelFinal />
    </Cadre>
  );
}
