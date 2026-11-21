// Gabarit des pages légales : un bandeau rappelle que le texte est un modèle à compléter et à faire relire.
import type { ReactNode } from 'react';
import Cadre from './Cadre';

export default function PageLegale({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <Cadre page="accueil">
      <section className="bande">
        <div className="etroit legal">
          <h1>{titre}</h1>
          <div className="message info">
            Modèle préparé avant la mise en ligne : les passages <mark className="a-completer">[À COMPLÉTER]</mark> sont à remplir, et
            l&apos;ensemble est à faire relire par un professionnel du droit.
          </div>
          {children}
        </div>
      </section>
    </Cadre>
  );
}

export function AC({ children }: { children: ReactNode }) {
  return <mark className="a-completer">[À COMPLÉTER : {children}]</mark>;
}
