// Mise en forme en français : dates, jours restants, montants.

/** « 2027-02-28 » → « 28 février 2027 ». Chaîne vide si pas de date. */
export function dateFr(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
}

/** Nombre de jours jusqu'à la fin de la journée limite (négatif si dépassée). */
export function joursRestants(iso: string | null | undefined, maintenant: Date = new Date()): number | null {
  if (!iso) return null;
  const fin = new Date(`${iso}T23:59:59`);
  if (Number.isNaN(fin.getTime())) return null;
  return Math.ceil((fin.getTime() - maintenant.getTime()) / 86_400_000);
}

/** 30000 → « 30 000 € » ; vide → « — ». */
export function euros(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return '—';
  return `${Number(n).toLocaleString('fr-FR')} €`.replace(/ /g, ' ');
}

/** Date du jour au format AAAA-MM-JJ, à l'heure de Paris. */
export function aujourdhui(maintenant: Date = new Date()): string {
  return maintenant.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
}
