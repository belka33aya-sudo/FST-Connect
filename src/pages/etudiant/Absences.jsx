import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

/* ── Formulaire de justificatif ── */
const JustificatifForm = ({ absence, onClose, onSubmit, isReadOnly }) => {
  const [motif, setMotif] = useState('');
  const [fichier, setFichier] = useState(null);
  const [error, setError] = useState('');

  // Préconditions: absence.statut === 'INJUSTIFIEE' && aucun justificatif existant
  const canSubmit = absence.statut === 'INJUSTIFIEE' && !absence.justificatif;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!motif.trim()) { setError('Le motif est obligatoire.'); return; }
    if (fichier && fichier.size > 5 * 1024 * 1024) { setError('La taille du fichier ne doit pas dépasser 5 MB.'); return; }
    onSubmit({ absenceId: absence.id, motif, fichier });
  };

  if (!canSubmit) {
    return (
      <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center', color: '#991b1b', fontSize: '.88rem' }}>
        {absence.statut !== 'INJUSTIFIEE'
          ? `Justificatif non autorisé — Statut: ${absence.statut}`
          : 'Un justificatif a déjà été soumis pour cette absence (règle : 1 justificatif / absence — non remplaçable).'}
      </div>
    );
  }

  if (isReadOnly) {
    return (
      <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center', color: '#991b1b', fontSize: '.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Statut ABANDONNÉ — actions d'écriture désactivées.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '.65rem 1rem', marginBottom: '1rem', color: '#991b1b', fontSize: '.84rem' }}>{error}</div>}
      {/* absenceId hidden (prérempli) */}
      <input type="hidden" value={absence.id}/>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label className="form-label">Motif de l'absence <span style={{ color: 'var(--danger)' }}>*</span></label>
        <textarea
          className="form-control"
          rows={4}
          value={motif}
          onChange={e => setMotif(e.target.value)}
          placeholder="Décrivez la raison de votre absence..."
          required
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label">Document justificatif (PDF, JPG, JPEG, PNG — max 5 MB)</label>
        <input
          type="file"
          className="form-control"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => setFichier(e.target.files[0] || null)}
          style={{ height: 'auto', padding: '.5rem .85rem' }}
        />
        {fichier && <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: '.3rem' }}>{fichier.name} ({(fichier.size / 1024).toFixed(0)} KB)</div>}
      </div>
      <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn btn-primary">Soumettre le justificatif</button>
      </div>
    </form>
  );
};

/* ── MODULE 6: Absences Étudiant ── */
const Absences = () => {
  const { currentUser } = useAuth();
  const { db, save, getStudentByUserId, studentAbsenceRate, moduleName } = useData();
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const student = getStudentByUserId(currentUser.id);
  if (!student) return <div className="empty-state"><p>Profil étudiant introuvable.</p></div>;

  const isReadOnly = student.statut === 'ABANDONNE';

  // Filtre server-side: CNE de l'étudiant authentifié (RG38) — ON NE VOIT JAMAIS les absences d'un autre
  const myAbsences = useMemo(() =>
    db.absences.filter(a => a.studentId === student.id),
    [db.absences, student.id]
  );

  // Groupement par module
  const myModules = useMemo(() => {
    const filiereModules = db.modules.filter(m => m.filiereId === student.filiereId);
    return filiereModules.map(mod => {
      const modSessions = db.sessions.filter(s => s.moduleId === mod.id);
      const modAbsences = myAbsences.filter(a => modSessions.some(s => s.id === a.sessionId));
      const injustifiees = modAbsences.filter(a => a.statut === 'INJUSTIFIEE').length;
      const justifiees   = modAbsences.filter(a => a.statut === 'JUSTIFIEE').length;
      const enAttente    = modAbsences.filter(a => a.statut === 'EN_ATTENTE').length;
      const total        = modAbsences.length;
      // RG36: taux = (absences / totalSeances) * 100 — arrondi à 1 décimale
      const taux = mod.totalSeances > 0 ? +((total / mod.totalSeances) * 100).toFixed(1) : 0;
      return { ...mod, injustifiees, justifiees, enAttente, total, taux, absences: modAbsences, modSessions };
    }).filter(m => m.absences.length > 0 || true); // afficher tous les modules
  }, [db.modules, db.sessions, myAbsences, student.filiereId]);

  const handleSubmitJustificatif = ({ absenceId, motif, fichier }) => {
    const absence = db.absences.find(a => a.id === absenceId);
    if (!absence) return;
    // Postcondition: justificatif.statut = 'EN_ATTENTE' → notification enseignant
    save('absences', {
      ...absence,
      statut: 'EN_ATTENTE',
      justificatif: { motif, fichier: fichier?.name || null, statutJustif: 'EN_ATTENTE' }
    });
    setShowForm(false);
    setSelectedAbsence(null);
    setToast({ type: 'success', msg: 'Justificatif soumis — Statut: EN_ATTENTE. L\'enseignant a été notifié.' });
    setTimeout(() => setToast(null), 4000);
  };

  const getTauxStyle = (taux) => ({
    color: taux < 15 ? '#065f46' : taux <= 30 ? '#c2410c' : '#991b1b',
    background: taux < 15 ? '#d1fae5' : taux <= 30 ? '#ffedd5' : '#fee2e2',
    padding: '2px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '.75rem',
  });

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#fff', border: '1px solid var(--border)', borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--danger)'}`, borderRadius: 'var(--radius)', padding: '.8rem 1rem', boxShadow: 'var(--shadow-lg)', maxWidth: '360px', fontSize: '.85rem' }}>
          {toast.msg}
        </div>
      )}

      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Mes Absences</h2>
          <p className="page-hero-sub">Suivi par module — CNE: {student.CNE} (filtre server-side, RG38)</p>
        </div>
        <div className="page-hero-right">
          <span className="badge badge-gray">{myAbsences.length} absence(s) totale(s)</span>
        </div>
      </div>

      {isReadOnly && (
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--radius)', padding: '.85rem 1.25rem', marginBottom: '1.25rem', color: '#991b1b', fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Statut ABANDONNÉ — soumission de justificatif désactivée.</span>
        </div>
      )}

      {/* Vue par module */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {myModules.map(mod => (
          <div key={mod.id} className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <h3 className="page-card-title">{mod.title}</h3>
                <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{mod.code}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <span style={getTauxStyle(mod.taux)}>Taux: {mod.taux}%</span>
                {mod.taux > 30 && <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Seuil dépassé</span>}
                {mod.taux > 15 && mod.taux <= 30 && <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Attention</span>}
              </div>
            </div>
            <div className="page-card-body" style={{ padding: '1rem 1.25rem' }}>
              {/* Stats rapides */}
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: mod.absences.length > 0 ? '1rem' : 0, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '.82rem' }}>
                  <span style={{ fontWeight: 700, color: '#991b1b' }}>{mod.injustifiees}</span>
                  <span style={{ color: 'var(--text-2)' }}> Injustifiée(s)</span>
                </span>
                <span style={{ fontSize: '.82rem' }}>
                  <span style={{ fontWeight: 700, color: '#065f46' }}>{mod.justifiees}</span>
                  <span style={{ color: 'var(--text-2)' }}> Justifiée(s)</span>
                </span>
                <span style={{ fontSize: '.82rem' }}>
                  <span style={{ fontWeight: 700, color: '#92400e' }}>{mod.enAttente}</span>
                  <span style={{ color: 'var(--text-2)' }}> En attente</span>
                </span>
                <span style={{ fontSize: '.82rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{mod.total}</span>
                  <span style={{ color: 'var(--text-2)' }}> / {mod.totalSeances} séances</span>
                </span>
              </div>

              {/* Détail des absences du module */}
              {mod.absences.length > 0 && (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th><th>Séance</th><th>Type</th><th>Statut</th><th>Justificatif</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mod.absences.map(abs => {
                        const sess = db.sessions.find(s => s.id === abs.sessionId);
                        return (
                          <tr key={abs.id}>
                            <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: '.82rem' }}>{abs.date}</td>
                            <td style={{ fontSize: '.82rem' }}>{sess ? `${sess.startSlot}–${sess.endSlot}` : '—'}</td>
                            <td>{sess && <span className={`badge badge-${sess.type === 'Cours' ? 'blue' : sess.type === 'TD' ? 'green' : 'orange'}`}>{sess.type}</span>}</td>
                            <td>
                              <span className={`badge ${abs.statut === 'INJUSTIFIEE' ? 'badge-red' : abs.statut === 'JUSTIFIEE' ? 'badge-green' : 'badge-yellow'}`}>
                                {abs.statut}
                              </span>
                            </td>
                            <td style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>
                              {abs.justificatif ? (
                                <div>
                                  <div>{abs.justificatif.motif}</div>
                                  <span className={`badge ${abs.justificatif.statutJustif === 'VALIDEE' ? 'badge-green' : abs.justificatif.statutJustif === 'REJETEE' ? 'badge-red' : 'badge-yellow'}`} style={{ marginTop: '2px' }}>
                                    {abs.justificatif.statutJustif}
                                  </span>
                                </div>
                              ) : '—'}
                            </td>
                            <td>
                              {abs.statut === 'INJUSTIFIEE' && !abs.justificatif && !isReadOnly && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => { setSelectedAbsence(abs); setShowForm(true); }}
                                >
                                  Justifier
                                </button>
                              )}
                              {abs.statut === 'INJUSTIFIEE' && !abs.justificatif && isReadOnly && (
                                <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Lecture seule</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {mod.absences.length === 0 && (
                <div style={{ color: 'var(--text-3)', fontSize: '.84rem', fontStyle: 'italic' }}>Aucune absence enregistrée pour ce module.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal justificatif */}
      {showForm && selectedAbsence && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-hdr-title">Soumettre un Justificatif</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-bdy">
              <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.84rem', color: 'var(--text-2)' }}>
                <strong>Absence du:</strong> {selectedAbsence.date} · <strong>Statut:</strong> {selectedAbsence.statut}
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '.65rem 1rem', marginBottom: '1rem', fontSize: '.8rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span><strong>Règle:</strong> Un seul justificatif par absence. Aucun remplacement possible après soumission.</span>
              </div>
              <JustificatifForm
                absence={selectedAbsence}
                onClose={() => setShowForm(false)}
                onSubmit={handleSubmitJustificatif}
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Absences;
