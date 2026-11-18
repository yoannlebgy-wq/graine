// Questions fréquentes — page séparée, ouverte depuis le menu.
import type { Metadata } from 'next';
import Cadre, { AppelFinal } from '../../components/Cadre';
import { NOM } from '../../lib/marque';

export const metadata: Metadata = { title: `Questions fréquentes — ${NOM}` };

export default function Page() {
  return (
    <Cadre page="questions">
      <section className="bande trame" aria-labelledby="titre-faq">
        <div className="etroit">
          <h1 id="titre-faq">Questions fréquentes</h1>
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
      <AppelFinal />
    </Cadre>
  );
}
