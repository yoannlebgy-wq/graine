'use client';
// Page du dossier : après « Rédiger ce dossier (offert) ».
// 1. Quelques infos facultatives sur la structure, 2. rédaction (message d'attente), 3. éditeur et Word.
import { useEffect, useState, type FormEvent } from 'react';
import Cadre from '../../components/Cadre';
import EditeurDossier, { CLE_DOSSIER } from '../../components/EditeurDossier';
import { CLE_EN_ATTENTE } from '../../components/RechercheAides';
import { messageRedaction } from '../../lib/fiche';
import type { Dossier } from '../../lib/redaction';

type EnAttente = { projet: Record<string, unknown> | null; aide_id: string; aide_nom: string } | null;

function lire<T>(cle: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(cle) || 'null') as T;
  } catch {
    return null;
  }
}

export default function PageDossier() {
  const [pret, setPret] = useState(false);
  const [attente, setAttente] = useState<EnAttente>(null);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const a = lire<EnAttente>(CLE_EN_ATTENTE);
    const d = lire<Dossier>(CLE_DOSSIER);
    setAttente(a);
    if (d && (!a || d.aide.id === a.aide_id)) setDossier(d);
    setPret(true);
  }, []);

  async function rediger(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!attente?.projet) return;
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    setErreur('');
    setEnCours(true);
    try {
      const r = await fetch('/api/dossiers/rediger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aide_id: attente.aide_id,
          projet: { ...attente.projet, montant_demande: f.montant_demande, public: f.public },
          structure: { nom: f.nom, presentation: f.presentation, adherents: f.adherents, benevoles: f.benevoles, salaries: f.salaries },
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.erreur || 'La rédaction a échoué. Réessayez.');
      try { sessionStorage.setItem(CLE_DOSSIER, JSON.stringify(data.dossier)); } catch { /* sans gravité */ }
      setDossier(data.dossier);
      window.scrollTo(0, 0);
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  if (!pret) return <Cadre page="accueil"><div className="etroit app-principal"><span className="chargement">Chargement…</span></div></Cadre>;
  if (dossier) return <Cadre page="accueil"><EditeurDossier initial={dossier} /></Cadre>;
  if (!attente?.projet) {
    return (
      <Cadre page="accueil">
        <div className="etroit app-principal">
          <h1>Aucun dossier en cours</h1>
          <p>Lancez une recherche, puis choisissez une aide pour faire rédiger votre dossier.</p>
          <a className="bouton" href="/#recherche">Chercher mes aides</a>
        </div>
      </Cadre>
    );
  }
  return (
    <Cadre page="accueil">
      <div className="etroit app-principal">
        <h1>Votre dossier pour « {attente.aide_nom} »</h1>
        <p>Facultatif, mais utile : plus vous en dites, moins il restera de passages à compléter. Rien ne sera inventé.</p>
        <div className="chemise" data-onglet="Ma structure">
          <form className="feuille" onSubmit={rediger}>
            <div className="champ"><label htmlFor="nom">Nom de la structure (ou votre nom d&apos;artiste)</label><input type="text" id="nom" name="nom" /></div>
            <div className="champ">
              <label htmlFor="presentation">Présentation</label>
              <span className="aide-champ">Depuis quand vous existez, votre mission, vos activités habituelles.</span>
              <textarea id="presentation" name="presentation" rows={4} />
            </div>
            <div className="ligne-champs">
              <div className="champ"><label htmlFor="benevoles">Bénévoles</label><input type="number" min={0} id="benevoles" name="benevoles" /></div>
              <div className="champ"><label htmlFor="adherents">Adhérents</label><input type="number" min={0} id="adherents" name="adherents" /></div>
            </div>
            <div className="ligne-champs">
              <div className="champ"><label htmlFor="public">Public visé</label><input type="text" id="public" name="public" placeholder="ex. 45 jeunes de 10 à 17 ans" /></div>
              <div className="champ"><label htmlFor="montant_demande">Montant demandé (€)</label><input type="number" min={0} id="montant_demande" name="montant_demande" /></div>
            </div>
            <button className="bouton grand" type="submit" disabled={enCours}>Rédiger mon dossier (offert)</button>
            <div role="status" aria-live="polite">
              {enCours ? <div className="carte" style={{ marginTop: 14 }}><span className="chargement">{messageRedaction(attente.aide_nom, true)}</span></div> : null}
              {erreur ? <div className="message erreur">{erreur}</div> : null}
            </div>
          </form>
        </div>
      </div>
    </Cadre>
  );
}
