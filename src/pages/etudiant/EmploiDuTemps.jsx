import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const DAYS_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_SLOTS  = ['08:00','09:30','11:00','13:30','15:00','16:30'];

const TYPE_COLORS = {
  Cours: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
  TD:    { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  TP:    { bg: '#ffedd5', border: '#f97316', text: '#c2410c' },
  Examen:{ bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
};

/* ── MODULE 3: Emploi du Temps Étudiant ── */
const EmploiDuTemps = () => {
  const { currentUser } = useAuth();
  const { db, getStudentByUserId, moduleName, teacherName, roomName } = useData();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current, -1 = previous, +1 = next

  const student = getStudentByUserId(currentUser.id);
  if (!student) return <div className="empty-state"><p>Profil étudiant introuvable.</p></div>;

  // Filtre server-side: la requête envoie filiereId, groupTDId, groupTPId depuis JWT
  // L'étudiant ne choisit JAMAIS sa filière manuellement (RG)
  const mySessions = useMemo(() => {
    return db.sessions.filter(s =>
      s.groupId === student.groupTDId || s.groupId === student.groupTPId
    );
  }, [db.sessions, student.groupTDId, student.groupTPId]);

  // Semaine label
  const getWeekLabel = (offset) => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + (offset * 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 5); // sam
    return `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const weekLabel = weekOffset === 0 ? 'Semaine en cours' : weekOffset === -1 ? 'Semaine précédente' : 'Semaine suivante';

  const [hoveredSession, setHoveredSession] = useState(null);

  // Get session for a given day + slot
  const getSession = (day, slot) => mySessions.find(s => s.day === day && s.startSlot === slot);

  const handleExportPDF = () => {
    // GET /edt/export?CNE={cne}&semaine={isoWeek} — déclenche téléchargement
    alert(`Export PDF déclenché pour CNE: ${student.CNE}, Semaine offset: ${weekOffset}\n(Simulation — backend réel requis)`);
  };

  return (
    <div>
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Emploi du Temps</h2>
          <p className="page-hero-sub">
            {db.filieres.find(f => f.id === student.filiereId)?.name} · {db.groups.find(g => g.id === student.groupTDId)?.name}
          </p>
        </div>
        <div className="page-hero-right" style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleExportPDF}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Semaine navigation */}
      <div className="page-card animate-up" style={{ marginBottom: '1rem' }}>
        <div className="page-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1.25rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(w => w - 1)}>
            ← Semaine précédente
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--blue-dark)', fontSize: '.95rem' }}>{weekLabel}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>{getWeekLabel(weekOffset)}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(w => w + 1)}>
            Semaine suivante →
          </button>
        </div>
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {Object.entries(TYPE_COLORS).map(([type, colors]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.78rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '3px', background: colors.bg, border: `1.5px solid ${colors.border}`, display: 'inline-block' }}/>
            {type}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.78rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '3px', background: '#f3f4f6', border: '1.5px dashed #9ca3af', display: 'inline-block' }}/>
          Annulée
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.78rem' }}>
          <span style={{ background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '999px', fontWeight: 700, fontSize: '.65rem' }}>R</span>
          Rattrapage
        </div>
      </div>

      {/* Grille EDT */}
      <div className="page-card animate-up">
        <div style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ width: 70, padding: '.5rem', fontSize: '.75rem', color: 'var(--text-3)', textAlign: 'right', paddingRight: '.75rem' }}>Heure</th>
                {DAYS_LABELS.map((d, i) => (
                  <th key={i} style={{ background: 'var(--blue-dark)', color: '#fff', padding: '.6rem .5rem', fontSize: '.78rem', fontWeight: 700, textAlign: 'center', borderRadius: i === 0 ? '6px 0 0 0' : i === 5 ? '0 6px 0 0' : '0' }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, si) => (
                <tr key={slot}>
                  <td style={{ fontSize: '.72rem', color: 'var(--text-3)', fontWeight: 600, textAlign: 'right', paddingRight: '.75rem', paddingTop: '2px', verticalAlign: 'top' }}>
                    {slot}
                  </td>
                  {DAYS_LABELS.map((_, di) => {
                    const dayNum = di + 1;
                    const sess = getSession(dayNum, slot);
                    if (!sess) {
                      return (
                        <td key={di} style={{ border: '1px solid var(--border)', height: '60px', background: 'var(--surface-2)', borderRadius: '3px' }}/>
                      );
                    }
                    const colors = TYPE_COLORS[sess.type] || TYPE_COLORS.Cours;
                    const isAnnulee = sess.statut === 'ANNULEE';
                    const isRattrapage = sess.isRattrapage;
                    return (
                      <td key={di} style={{ padding: '2px', position: 'relative' }}>
                        <div
                          style={{
                            background: isAnnulee ? '#f3f4f6' : colors.bg,
                            border: `1.5px solid ${isAnnulee ? '#d1d5db' : colors.border}`,
                            borderRadius: '5px',
                            padding: '.3rem .4rem',
                            fontSize: '.7rem',
                            fontWeight: 600,
                            color: isAnnulee ? '#9ca3af' : colors.text,
                            cursor: 'pointer',
                            minHeight: '56px',
                            textDecoration: isAnnulee ? 'line-through' : 'none',
                            opacity: isAnnulee ? 0.7 : 1,
                            position: 'relative',
                          }}
                          onMouseEnter={() => setHoveredSession(sess.id)}
                          onMouseLeave={() => setHoveredSession(null)}
                          title={isAnnulee ? `Annulée: ${sess.motifAnnulation}` : ''}
                        >
                          {isRattrapage && (
                            <span style={{ position: 'absolute', top: 2, right: 3, background: '#f59e0b', color: '#fff', fontSize: '.6rem', fontWeight: 800, padding: '1px 4px', borderRadius: '999px' }}>R</span>
                          )}
                          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {moduleName(sess.moduleId).length > 20 ? moduleName(sess.moduleId).slice(0, 20) + '…' : moduleName(sess.moduleId)}
                          </div>
                          <div style={{ fontSize: '.65rem', opacity: .75, marginTop: '2px' }}>
                            {sess.startSlot}–{sess.endSlot} · {sess.type}
                          </div>
                          {isAnnulee && hoveredSession === sess.id && (
                            <div style={{
                              position: 'absolute', zIndex: 50, top: '100%', left: 0, background: '#1f2937', color: '#fff',
                              padding: '.5rem .75rem', borderRadius: '6px', fontSize: '.75rem', minWidth: '200px',
                              boxShadow: '0 4px 15px rgba(0,0,0,.2)', pointerEvents: 'none', marginTop: '4px',
                            }}>
                              <strong>Séance annulée</strong><br/>Motif: {sess.motifAnnulation}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liste détaillée */}
      <div className="page-card animate-up" style={{ marginTop: '1rem' }}>
        <div className="page-card-header">
          <h3 className="page-card-title">Détail des séances de la semaine</h3>
          <span className="badge badge-gray">{mySessions.length} séance(s)</span>
        </div>
        <div className="page-card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jour</th><th>Horaire</th><th>Module</th><th>Type</th><th>Salle</th><th>Enseignant</th><th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {[...mySessions].sort((a, b) => a.day - b.day || TIME_SLOTS.indexOf(a.startSlot) - TIME_SLOTS.indexOf(b.startSlot)).map(s => (
                  <tr key={s.id} style={{ opacity: s.statut === 'ANNULEE' ? 0.6 : 1 }}>
                    <td style={{ fontWeight: 700 }}>{DAYS_LABELS[s.day - 1]}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: '.82rem' }}>{s.startSlot} – {s.endSlot}</td>
                    <td style={{ textDecoration: s.statut === 'ANNULEE' ? 'line-through' : 'none' }}>{moduleName(s.moduleId)}</td>
                    <td>
                      <span className={`badge badge-${s.type === 'Cours' ? 'blue' : s.type === 'TD' ? 'green' : s.type === 'TP' ? 'orange' : 'red'}`}>
                        {s.type}
                      </span>
                      {s.isRattrapage && <span className="badge badge-yellow" style={{ marginLeft: '4px' }}>R</span>}
                    </td>
                    <td style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>{roomName(s.roomId)}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>{teacherName(s.teacherId)}</td>
                    <td>
                      {s.statut === 'ANNULEE' ? (
                        <span className="badge badge-red" title={s.motifAnnulation}>Annulée</span>
                      ) : s.isRattrapage ? (
                        <span className="badge badge-yellow">Rattrapage</span>
                      ) : (
                        <span className="badge badge-green">Planifiée</span>
                      )}
                    </td>
                  </tr>
                ))}
                {mySessions.length === 0 && (
                  <tr><td colSpan={7} className="table-empty">Aucune séance trouvée pour votre groupe.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploiDuTemps;
