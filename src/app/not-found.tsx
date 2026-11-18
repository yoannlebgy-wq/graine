import Cadre from '../components/Cadre';

export default function PageIntrouvable() {
  return (
    <Cadre page="accueil">
      <section className="bande">
        <div className="etroit">
          <h1>Page introuvable</h1>
          <p>Cette page n&apos;existe pas ou a changé d&apos;adresse.</p>
          <a className="bouton" href="/#recherche">Chercher mes aides</a>
        </div>
      </section>
    </Cadre>
  );
}
