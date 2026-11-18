// Logo de Dossio : une chemise cartonnée blanche sur fond vert, avec une ligne surlignée en jaune
// (ce qui reste à compléter) et une ligne de texte. Même dessin que public/favicon.svg.
import { NOM } from '../lib/marque';

export function Symbole({ taille = 30 }: { taille?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={taille} height={taille} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" fill="#2f6b4f" />
      <path d="M6 10.5a2 2 0 0 1 2-2h5.2l2.2 2.2H24a2 2 0 0 1 2 2V23a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" fill="#fff" />
      <rect x="9.5" y="15" width="13" height="3.4" rx="1.7" fill="#fff07a" />
      <rect x="9.5" y="20.2" width="8.5" height="1.8" rx=".9" fill="#c9d6cf" />
    </svg>
  );
}

export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <a className="logo" href={href} aria-label={`${NOM}, accueil`}>
      <Symbole />
      {NOM}
    </a>
  );
}
