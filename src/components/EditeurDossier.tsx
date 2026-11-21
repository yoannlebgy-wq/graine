'use client';
// Écran du dossier rédigé : chaque partie modifiable, budget vérifié, téléchargement Word.
import { useState } from 'react';
import { verifierEquilibre, verifierPartSubvention, total } from '../lib/budget';
import { euros } from '../lib/format';
import { compterACompleter, SECTIONS_TEXTE, type Budget, type Dossier } from '../lib/redaction';

export const CLE_DOSSIER = 'dossio_dossier';

function Surligne({ texte }: { texte: string }) {
  return (
    <>
      {texte.split(/(\[À (?:COMPLÉTER|VÉRIFIER)[^\]]*\])/).map((m, i) =>
        /^\[À /.test(m) ? <mark key={i} className="a-completer">{m}</mark> : <span key={i}>{m}</span>,
      )}
    </>
  );
}

export default function EditeurDossier({ initial }: { initial: Dossier }) {
  const [dossier, setDossier] = useState<Dossier>(initial);
  const [etat, setEtat] = useState('');
  const budget = dossier.contenu.budget;
  const reste = SECTIONS_TEXTE.reduce((n, s) => n + compterACompleter(dossier.contenu.textes[s.cle]), 0);

  function majDossier(d: Dossier) {
    setDossier(d);
    try {
      sessionStorage.setItem(CLE_DOSSIER, JSON.stringify(d));
    } catch {
      /* sans gravité */
    }
  }
  const majTexte = (cle: string, v: string) => majDossier({ ...dossier, contenu: { ...dossier.contenu, textes: { ...dossier.contenu.textes, [cle]: v } } });
  const majBudget = (b: Budget) => majDossier({ ...dossier, contenu: { ...dossier.contenu, budget: b } });
  const montant = (v: string) => (v === '' || Number.isNaN(Number(v)) ? null : Math.round(Number(v)));

  async function telecharger() {
    setEtat('Préparation du fichier Word…');
    try {
      const r = await fetch('/api/dossiers/word', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dossier }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).erreur || 'Le téléchargement a échoué.');
      const nom = (r.headers.get('Content-Disposition') || '').match(/filename="([^"]+)"/)?.[1] || 'dossier.docx';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(await r.blob());
      a.download = nom;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      setEtat('Fichier Word téléchargé.');
    } catch (e) {
      setEtat((e as Error).message);
    }
  }

  const eq = verifierEquilibre(budget);
  const part = verifierPartSubvention(budget, dossier.aide.taux_max);
  const classe = (v: { niveau: string }) => (v.niveau === 'alerte' ? 'alerte-budget' : v.niveau === 'ok' ? 'message succes' : 'aide-champ');

  return (
    <div className="conteneur app-principal">
      <h1 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.3rem)' }}>{dossier.aide.nom}</h1>
      <p className="aide-champ">
        {dossier.aide.porteurs} — projet « {dossier.projet.titre} »
        {dossier.aide.url ? <> — <a href={dossier.aide.url} target="_blank" rel="noopener noreferrer">Fiche officielle de l&apos;aide</a></> : null}
      </p>
      {dossier.mode === 'demo' ? (
        <div className="message info">Rédaction simulée : ce texte est construit à partir de vos seules réponses. La rédaction par Claude s&apos;active quand la clé est branchée.</div>
      ) : null}
      <div className="dossier-outils">
        <button className="bouton" type="button" onClick={telecharger}>Télécharger en Word</button>
        <span className="aide-champ" role="status" aria-live="polite" style={{ alignSelf: 'center' }}>{etat}</span>
      </div>
      {reste ? (
        <div className="message info">
          Relisez chaque partie. <strong>{reste} passage{reste > 1 ? 's' : ''} [À COMPLÉTER]</strong> attend{reste > 1 ? 'ent' : ''} vos informations : rien n&apos;est inventé.
        </div>
      ) : null}
      {SECTIONS_TEXTE.map((s) => {
        const v = dossier.contenu.textes[s.cle] ?? '';
        const n = compterACompleter(v);
        return (
          <section key={s.cle} className="section-dossier carte" data-section={s.cle}>
            <div className="titre-section">
              <h2 id={`titre-${s.cle}`}>{s.titre}</h2>
              {n ? <span className="pastille">{n} à compléter</span> : null}
            </div>
            <textarea id={`s-${s.cle}`} aria-labelledby={`titre-${s.cle}`} rows={Math.min(18, Math.max(5, Math.ceil(v.length / 75)))} value={v} onChange={(e) => majTexte(s.cle, e.target.value)} />
            {n ? <p className="aide-champ" style={{ marginTop: 6 }}><Surligne texte={v.split('\n').filter((l) => /\[À /.test(l)).join(' · ')} /></p> : null}
          </section>
        );
      })}
      <section className="section-dossier carte budget" data-section="budget">
        <div className="titre-section"><h2>Budget prévisionnel</h2></div>
        {(['depenses', 'recettes'] as const).map((type) => {
          const champ = type === 'depenses' ? 'poste' : 'source';
          const lignes = budget[type] as { poste?: string; source?: string; montant: number | null }[];
          const t = total(lignes);
          return (
            <table key={type}>
              <thead><tr><th>{type === 'depenses' ? 'Dépenses' : 'Recettes'}</th><th className="montant">Montant (€)</th></tr></thead>
              <tbody>
                {lignes.map((l, i) => (
                  <tr key={i}>
                    <td><input type="text" aria-label="Libellé" value={(l as Record<string, unknown>)[champ] as string} onChange={(e) => majBudget({ ...budget, [type]: lignes.map((x, j) => (j === i ? { ...x, [champ]: e.target.value } : x)) })} /></td>
                    <td className="montant"><input type="number" min={0} aria-label="Montant en euros" value={l.montant ?? ''} placeholder="à compléter" onChange={(e) => majBudget({ ...budget, [type]: lignes.map((x, j) => (j === i ? { ...x, montant: montant(e.target.value) } : x)) })} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td>Total</td><td>{t == null ? 'à compléter' : euros(t)}</td></tr></tfoot>
            </table>
          );
        })}
        <button className="bouton secondaire" type="button" onClick={() => majBudget({ ...budget, depenses: [...budget.depenses, { poste: 'Nouvelle dépense', montant: null }] })}>Ajouter une dépense</button>{' '}
        <button className="bouton secondaire" type="button" onClick={() => majBudget({ ...budget, recettes: [...budget.recettes, { source: 'Nouvelle recette', montant: null }] })}>Ajouter une recette</button>
        <p className={classe(eq)} style={{ marginTop: 12 }}>{eq.texte}</p>
        <p className={classe(part)}>{part.texte}</p>
      </section>
    </div>
  );
}
