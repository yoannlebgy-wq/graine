import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { NOM } from '../lib/marque';

export const metadata: Metadata = {
  title: `${NOM} — trouvez vos subventions, ${NOM} écrit le dossier`,
  description:
    `Répondez à cinq questions : ${NOM} trouve les aides publiques et les fondations pour votre association ou votre projet d'artiste, puis rédige le dossier de demande.`,
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
