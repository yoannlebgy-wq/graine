// Cadre commun à toutes les pages : bandeau démo, en-tête avec le menu, pied de page.
// Le menu mène à des pages séparées : Comment ça marche, Tarifs, Questions.
import type { ReactNode } from 'react';
import Logo from './Logo';
import { NOM } from '../lib/marque';

export type PageMenu = 'accueil' | 'comment' | 'tarifs' | 'questions';

export const MENU: { page: Exclude<PageMenu, 'accueil'>; href: string; libelle: string }[] = [
  { page: 'comment', href: '/comment-ca-marche', libelle: 'Comment ça marche' },
  { page: 'tarifs', href: '/tarifs', libelle: 'Tarifs' },
  { page: 'questions', href: '/questions', libelle: 'Questions' },
];

export default function Cadre({ page, children }: { page: PageMenu; children: ReactNode }) {
  return (
    <>
      <div className="bandeau-demo">
        Mode démo : les aides affichées sont des exemples fictifs. La recherche réelle (Aides-territoires) arrive à l&apos;étape 3.
      </div>
      <header className="entete">
        <div className="conteneur">
          <Logo />
          <nav className="nav" aria-label="Navigation principale">
            {MENU.map((m) => (
              <a key={m.page} href={m.href} aria-current={m.page === page ? 'page' : undefined}>
                {m.libelle}
              </a>
            ))}
            <a href="/inscription">Se connecter</a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="pied">
        <div className="conteneur">
          <span>
            {NOM} — aides issues d&apos;
            <a href="https://aides-territoires.beta.gouv.fr/" target="_blank" rel="noopener noreferrer">Aides-territoires</a>{' '}
            (Licence Ouverte) et de fondations.
          </span>
          <span className="liens-pied">
            <a href="/">Accueil</a>
            {MENU.map((m) => (
              <a key={m.page} href={m.href}>{m.libelle}</a>
            ))}
          </span>
        </div>
      </footer>
    </>
  );
}

/** Bloc de fin des pages secondaires : ramène au questionnaire de l'accueil. */
export function AppelFinal() {
  return (
    <section className="bande appel-final" aria-labelledby="titre-appel">
      <div className="etroit">
        <h2 id="titre-appel">Prêt à trouver vos aides ?</h2>
        <p>Cinq questions, sans compte. Le premier dossier est offert, sans carte bancaire.</p>
        <a className="bouton grand" href="/#recherche">Chercher mes aides</a>
      </div>
    </section>
  );
}
