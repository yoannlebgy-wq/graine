// Page d'accueil de Dossio, reprise de l'aperçu cliquable (sans la barre « Aperçu »).
import Logo from '../components/Logo';
import Raccourcis, { BoutonVersRecherche } from '../components/Raccourcis';
import RechercheAides from '../components/RechercheAides';
import { ACCROCHE, NOM } from '../lib/marque';
import { REFERENCE } from '../lib/reference';

const PARTIES = REFERENCE.sections.map((p) => (p.cle === 'public' ? 'Public visé' : p.cle === 'evaluation' ? 'Évaluation' : p.titre));

export default function Accueil() {
  return (
    <>
      <div className="bandeau-demo">
        Mode démo : les aides affichées sont des exemples fictifs. La recherche réelle (Aides-territoires) arrive à l&apos;étape 3.
      </div>
      <header className="entete">
        <div className="conteneur">
          <Logo />
          <nav className="nav" aria-label="Navigation principale">
            <a href="#tarifs">Tarifs</a>
            <a href="/inscription">Se connecter</a>
          </nav>
        </div>
      </header>

      <main>
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

        <section className="bande trame" aria-labelledby="titre-etapes">
          <div className="conteneur">
            <h2 id="titre-etapes">Comment ça marche</h2>
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

        <section className="bande" id="tarifs" aria-labelledby="titre-tarifs">
          <div className="conteneur">
            <h2 id="titre-tarifs">Tarifs</h2>
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

        <section className="bande trame" aria-labelledby="titre-faq">
          <div className="etroit">
            <h2 id="titre-faq">Questions fréquentes</h2>
            <details>
              <summary>D&apos;où viennent les aides ?</summary>
              <p>
                De la base publique Aides-territoires, mise à jour chaque nuit, et d&apos;une liste de fondations vérifiée à
                la main. Chaque aide renvoie vers sa fiche officielle. Chaque fiche indique sa source et sa date de mise à jour.
              </p>
            </details>
            <details>
              <summary>Dossio dépose-t-il le dossier pour moi ?</summary>
              <p>Non. Vous restez le demandeur : vous relisez, complétez et déposez le dossier sur le site du financeur, ou l&apos;envoyez par courrier.</p>
            </details>
            <details>
              <summary>Est-ce que Dossio garantit l&apos;obtention de la subvention ?</summary>
              <p>Non. Personne ne peut le garantir. Dossio vous fait gagner du temps et vous aide à présenter clairement votre projet.</p>
            </details>
            <details>
              <summary>Un financeur peut-il refuser un dossier écrit avec l&apos;aide de l&apos;IA ?</summary>
              <p>
                {NOM} met en forme ce que vous lui dites ; vous relisez, complétez et signez : le dossier reste le vôtre. Quelques
                financeurs encadrent l&apos;IA, surtout pour les affiches et la communication. Lisez le règlement de l&apos;appel et, en
                cas de doute, posez la question au financeur. {NOM} ne crée ni affiche ni image.
              </p>
            </details>
            <details>
              <summary>Quelle différence avec ChatGPT ?</summary>
              <p>
                ChatGPT ne sait pas quelles aides sont ouvertes dans votre département ni quand elles ferment, et il peut inventer des
                chiffres. {NOM} part des fiches officielles, suit les parties attendues par les financeurs (dont le Cerfa 12156), vérifie
                votre budget et surligne ce qui manque au lieu de l&apos;inventer.
              </p>
            </details>
            <details>
              <summary>Je suis artiste, sans association. Ça marche pour moi ?</summary>
              <p>Oui : choisissez « artiste ou porteur·se de projet ». Dossio cherche alors les aides ouvertes aux personnes et aux associations.</p>
            </details>
            <details>
              <summary>Que faites-vous de mes informations ?</summary>
              <p>Elles servent uniquement à rédiger vos dossiers. Elles ne sont ni vendues ni partagées.</p>
            </details>
          </div>
        </section>
        <section className="bande appel-final" aria-labelledby="titre-appel">
          <div className="etroit">
            <h2 id="titre-appel">Prêt à trouver vos aides ?</h2>
            <p>Cinq questions, sans compte. Le premier dossier est offert, sans carte bancaire.</p>
            <BoutonVersRecherche>Chercher mes aides</BoutonVersRecherche>
          </div>
        </section>
      </main>

      <footer className="pied">
        <div className="conteneur">
          <span>
            {NOM} — aides issues d&apos;
            <a href="https://aides-territoires.beta.gouv.fr/" target="_blank" rel="noopener noreferrer">Aides-territoires</a>{' '}
            (Licence Ouverte) et de fondations.
          </span>
        </div>
      </footer>
    </>
  );
}
