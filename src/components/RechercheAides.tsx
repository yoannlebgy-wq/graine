'use client';
// Le questionnaire en 5 questions et les résultats, sur la page d'accueil.
import { useState, type FormEvent, type ReactNode } from 'react';
import { ligneEcheance, ligneSource, libelleBoutonRediger } from '../lib/fiche';
import { validerQuestionnaire, type ReponsesQuestionnaire } from '../lib/questionnaire';
import type { AideTrouvee, ResultatRecherche } from '../lib/recherche';
import { REFERENCE } from '../lib/reference';

export const CLE_EN_ATTENTE = 'dossio_en_attente';

function niveau(score: number): string {
  if (score >= 70) return '';
  if (score >= 45) return 'moyen';
  return 'faible';
}

export function FicheAide({ aide, onRediger }: { aide: AideTrouvee; onRediger?: (a: AideTrouvee) => void }) {
  return (
    <article className="fiche">
      <div className={`liseré ${niveau(aide.score)}`} aria-hidden="true" />
      <div className="corps">
        <h3>{aide.nom}</h3>
        <div className="meta">
          {aide.porteurs || 'Financeur non précisé'} — {aide.perimetre}
          <br />
          {aide.date_limite ? <span className="echeance">{ligneEcheance(aide.date_limite)}</span> : ligneEcheance(null)}
        </div>
        <p className="pourquoi">{aide.pourquoi}</p>
        {aide.a_verifier ? <p className="verifier">À vérifier : {aide.a_verifier}</p> : null}
        <p className="source">
          {aide.url ? (
            <a href={aide.url} target="_blank" rel="noopener noreferrer">{ligneSource(aide)}</a>
          ) : (
            ligneSource(aide)
          )}
        </p>
        <div className="actions">
          {/* Le visiteur n'a pas encore de compte : son premier dossier est offert. */}
          <button className="bouton" type="button" onClick={() => onRediger?.(aide)}>
            {libelleBoutonRediger(true)}
          </button>
          {aide.url ? (
            <a href={aide.url} target="_blank" rel="noopener noreferrer">Voir la fiche officielle</a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ListeResultats({ resultat, onRediger }: { resultat: ResultatRecherche; onRediger?: (a: AideTrouvee) => void }) {
  const n = resultat.aides.length;
  return (
    <section className="bande" id="acc-zone-resultats" aria-labelledby="titre-resultats">
      <div className="etroit resultats">
        <div className="entete-resultats">
          <h2 id="titre-resultats" tabIndex={-1}>Les aides pour votre projet</h2>
          {n ? (
            <span className="aide-champ">
              {n} aide{n > 1 ? 's' : ''} retenue{n > 1 ? 's' : ''} sur {resultat.total} ouverte{resultat.total > 1 ? 's' : ''} dans votre secteur
            </span>
          ) : null}
        </div>
        {n ? (
          resultat.aides.map((a) => <FicheAide key={a.id} aide={a} onRediger={onRediger} />)
        ) : (
          <div className="message info">
            {resultat.message || 'Aucune aide ouverte trouvée pour ces critères. Essayez un autre domaine, ou laissez la commune vide.'}
          </div>
        )}
        <p className="aide-champ">Dossio vous oriente : vérifiez toujours les conditions sur la fiche officielle avant de déposer.</p>
      </div>
    </section>
  );
}

type Props = { children?: ReactNode; resultatInitial?: ResultatRecherche | null };

/** Le haut de la page d'accueil : la promesse (children) à gauche, le questionnaire à droite, puis les résultats. */
export default function RechercheAides({ children, resultatInitial = null }: Props) {
  const [message, setMessage] = useState<{ type: 'erreur' | 'chargement'; texte: string } | null>(null);
  const [resultat, setResultat] = useState<ResultatRecherche | null>(resultatInitial);
  const [projet, setProjet] = useState<ReponsesQuestionnaire | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function chercher(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = Object.fromEntries(new FormData(e.currentTarget).entries());
    const validation = validerQuestionnaire(donnees);
    if (!validation.ok) {
      setMessage({ type: 'erreur', texte: validation.message });
      return;
    }
    setMessage({ type: 'chargement', texte: 'Dossio cherche les aides qui correspondent…' });
    setEnCours(true);
    try {
      const r = await fetch('/api/recherche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projet: validation.projet }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.erreur || 'Une erreur est survenue.');
      setProjet(validation.projet);
      setResultat(data as ResultatRecherche);
      setMessage(null);
      requestAnimationFrame(() => document.getElementById('titre-resultats')?.focus());
    } catch (err) {
      const texte = err instanceof TypeError ? 'Connexion impossible. Vérifiez votre accès à internet et réessayez.' : (err as Error).message;
      setMessage({ type: 'erreur', texte });
    } finally {
      setEnCours(false);
    }
  }

  function rediger(aide: AideTrouvee) {
    try {
      sessionStorage.setItem(CLE_EN_ATTENTE, JSON.stringify({ projet, aide_id: aide.id, aide_nom: aide.nom }));
    } catch {
      /* stockage indisponible : le choix sera redemandé */
    }
    window.location.href = `/inscription?aide=${encodeURIComponent(aide.id)}`;
  }

  return (
    <>
      <section className="hero" id="recherche">
        <div className="conteneur">
          {children}
          <div className="chemise" data-onglet="Ma recherche">
            <form className="feuille" id="form-recherche" noValidate onSubmit={chercher}>
              <fieldset>
                <legend>Vous êtes</legend>
                <div className="choix">
                  {REFERENCE.types.map((t, i) => (
                    <label key={t.cle}>
                      <input type="radio" name="type" value={t.cle} defaultChecked={i === 0} /> {t.libelle}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="ligne-champs">
                <div className="champ">
                  <label htmlFor="departement">Département</label>
                  <select id="departement" name="departement" required defaultValue="">
                    <option value="">Choisir…</option>
                    {REFERENCE.departements.map((d) => (
                      <option key={d.code} value={d.code}>{`${d.code} — ${d.nom}`}</option>
                    ))}
                  </select>
                </div>
                <div className="champ">
                  <label htmlFor="commune">
                    Commune <span className="aide-champ" style={{ display: 'inline' }}>(facultatif)</span>
                  </label>
                  <input type="text" id="commune" name="commune" autoComplete="address-level2" />
                </div>
              </div>
              <div className="champ">
                <label htmlFor="theme">Domaine du projet</label>
                <select id="theme" name="theme" required defaultValue="">
                  <option value="">Choisir…</option>
                  {REFERENCE.themes.map((t) => (
                    <option key={t.cle} value={t.cle}>{t.libelle}</option>
                  ))}
                </select>
              </div>
              <div className="champ">
                <label htmlFor="description">Votre projet en quelques phrases</label>
                <span className="aide-champ" id="aide-description">
                  Exemple : acheter un minibus pour emmener les jeunes du club aux matchs et aux tournois.
                </span>
                <textarea id="description" name="description" rows={3} aria-describedby="aide-description" required />
              </div>
              <div className="ligne-champs">
                <div className="champ">
                  <label htmlFor="budget">Budget du projet (€)</label>
                  <input type="number" id="budget" name="budget" min={0} step={1} inputMode="numeric" />
                </div>
                <div className="champ">
                  <label htmlFor="date_debut">Démarrage souhaité</label>
                  <input type="text" id="date_debut" name="date_debut" placeholder="ex. mars 2027" />
                </div>
              </div>
              <button className="bouton grand" type="submit" id="bouton-chercher" disabled={enCours}>
                Chercher mes aides
              </button>
              <div id="message-recherche" role="status" aria-live="polite">
                {message?.type === 'erreur' ? <div className="message erreur">{message.texte}</div> : null}
                {message?.type === 'chargement' ? <span className="chargement">{message.texte}</span> : null}
              </div>
            </form>
          </div>
        </div>
      </section>
      {resultat ? <ListeResultats resultat={resultat} onRediger={rediger} /> : null}
    </>
  );
}
