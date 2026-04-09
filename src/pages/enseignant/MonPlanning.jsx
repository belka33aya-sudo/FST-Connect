import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

const DAYS_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_SLOTS  = ['08:00','09:30','11:00','13:30','15:00','16:30'];

const MonPlanning = () => {
  const { currentUser } = useAuth();
  const { db, save, moduleName, roomName, groupName, filiereName } = useData();
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);

  // Modals state
  const [showAppelModal, setShowAppelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [absentIds, setAbsentIds] = useState([]);
  const [toast, setToast] = useState(null);

  const teacherId = currentUser?.linkedId;
  const teacher = db.teachers.find(t => t.id === teacherId);

  const mySessions = useMemo(() => {
    return db.sessions.filter(s => s.teacherId === teacherId);
  }, [db.sessions, teacherId]);

  const getWeekRange = (offset) => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (now.getDay() || 7) + 1 + (offset * 7));
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    return { monday, saturday };
  };

  const { monday, saturday } = getWeekRange(weekOffset);
  const weekLabel = weekOffset === 0 ? 'Semaine en cours' : weekOffset === -1 ? 'Semaine précédente' : 'Semaine suivante';
  const rangeText = `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} – ${saturday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const getSession = (day, slot) => mySessions.find(s => s.day === day && s.startSlot === slot);

  // ── Handlers ──
  const openAppel = (session) => {
    setActiveSession(session);
    const existing = db.absences.filter(a => a.sessionId === session.id);
    setAbsentIds(existing.map(a => a.studentId));
    setShowAppelModal(true);
  };

  const openEdit = (session) => {
    setActiveSession({ ...session });
    setShowEditModal(true);
  };

  const handleSaveAppel = () => {
    // In a real app, we'd sync the whole list. Here we update the mock DB.
    absentIds.forEach(sid => {
      const exists = db.absences.find(a => a.sessionId === activeSession.id && a.studentId === sid);
      if (!exists) {
        save('absences', {
          id: Date.now() + sid,
          studentId: sid,
          sessionId: activeSession.id,
          date: new Date().toISOString().split('T')[0],
          statut: 'INJUSTIFIEE',
          justificatif: null
        });
      }
    });
    setToast({ msg: "L'appel a été enregistré avec succès." });
    setShowAppelModal(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveEdit = () => {
    save('sessions', activeSession);
    setToast({ msg: "La séance a été mise à jour." });
    setShowEditModal(false);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleAbsent = (id) => {
    setAbsentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (!teacher) return <div className="empty-state"><p>Profil enseignant introuvable.</p></div>;

  const studentsInGroup = activeSession ? db.students.filter(s => s.groupTDId === activeSession.groupId || s.groupTPId === activeSession.groupId) : [];

  return (
    <div className="planning-container animate-up">
      {toast && (
        <div className="toast success" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, pointerEvents: 'all' }}>
          <div className="toast-icon">✓</div>
          <div className="toast-body"><div className="toast-title">Succès</div><div className="toast-msg">{toast.msg}</div></div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="page-hero" style={{ marginBottom: '2rem' }}>
        <div className="page-hero-left">
          <h2 className="page-hero-title">Mon Planning</h2>
          <p className="page-hero-sub">Portail de gestion pédagogique — {teacher.name}</p>
        </div>
        <div className="page-hero-right" style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={() => window.print()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimer
          </button>
          <button className="btn btn-primary" onClick={() => alert("Planning exporté en PDF.")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter
          </button>
        </div>
      </div>

      {/* ── WEEK NAVIGATION ── */}
      <div className="week-nav-bar">
        <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(w => w - 1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Précédente
        </button>
        <div className="week-nav-info">
          <div className="week-nav-title">{weekLabel}</div>
          <div className="week-nav-range">{rangeText}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(w => w + 1)}>
          Suivante
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* ── GRID PLANNING ── */}
      <div className="planning-grid-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="planning-table">
            <thead>
              <tr>
                <th>Heure</th>
                {DAYS_LABELS.map((d, i) => (
                  <th key={i}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot) => (
                <tr key={slot}>
                  <td className="planning-time-cell">{slot}</td>
                  {DAYS_LABELS.map((_, di) => {
                    const sess = getSession(di + 1, slot);
                    if (!sess) return <td key={di} className="planning-slot" />;
                    
                    const isAnnulee = sess.statut === 'ANNULEE';
                    const typeClass = `session-${sess.type.toLowerCase()}`;
                    const mod = db.modules.find(m => m.id === sess.moduleId);

                    return (
                      <td key={di} className="planning-slot">
                        <div 
                          className={`session-card ${typeClass} ${isAnnulee ? 'session-annulee' : ''}`}
                          onClick={() => openAppel(sess)}
                        >
                          {isAnnulee && <div className="session-annulee-stamp">Annulé</div>}
                          <div>
                            <div className="session-type-tag">{sess.type}</div>
                            <div className="session-title" title={mod?.title}>{mod?.title}</div>
                          </div>
                          <div className="session-meta">
                            <span>{groupName(sess.groupId)}</span>
                            <span>{roomName(sess.roomId)}</span>
                          </div>
                          {sess.isRattrapage && (
                            <div style={{ position:'absolute', top: -5, right: -5, background: 'var(--warning)', color: '#fff', fontSize: '10px', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>R</div>
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

      {/* ── DETAILED LIST ── */}
      <div className="page-card" style={{ marginTop: '3rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div className="page-card-header" style={{ padding: '1.5rem' }}>
          <h3 className="page-card-title" style={{ fontSize: '1.1rem' }}>Liste détaillée des séances</h3>
          <span className="badge badge-refined" style={{ background: '#f1f5f9', color: '#64748b' }}>{mySessions.length} séances au total</span>
        </div>
        <div className="page-card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="table-modern-refined">
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Horaire</th>
                  <th>Module & Filière</th>
                  <th>Groupe</th>
                  <th>Salle</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {[...mySessions].sort((a, b) => a.day - b.day || a.startSlot.localeCompare(b.startSlot)).map(s => {
                  const mod = db.modules.find(m => m.id === s.moduleId);
                  const isAnnulee = s.statut === 'ANNULEE';
                  return (
                    <tr key={s.id} style={{ opacity: isAnnulee ? 0.5 : 1 }}>
                      <td style={{ fontWeight: 700, color: 'var(--blue-dark)' }}>{DAYS_LABELS[s.day - 1]}</td>
                      <td style={{ fontWeight: 600, color: '#475569' }}>{s.startSlot} – {s.endSlot}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{mod?.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{filiereName(mod?.filiereId)}</div>
                      </td>
                      <td><span className="badge-refined" style={{ background: '#f1f5f9', color: '#475569' }}>{groupName(s.groupId)}</span></td>
                      <td style={{ fontWeight: 500 }}>{roomName(s.roomId)}</td>
                      <td>
                        <span className={`badge-refined session-${s.type.toLowerCase()}`} style={{ border: 'none' }}>
                          {s.type}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL: FAIRE L'APPEL ── */}
      {showAppelModal && activeSession && (
        <div className="modal-overlay" onClick={() => setShowAppelModal(false)}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-hdr-title">Feuille d'appel — {moduleName(activeSession.moduleId)}</h3>
              <button className="modal-close" onClick={() => setShowAppelModal(false)}>×</button>
            </div>
            <div className="modal-bdy" style={{ maxHeight: '60vh' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div><strong>Groupe:</strong> {groupName(activeSession.groupId)}</div>
                <div><strong>Salle:</strong> {roomName(activeSession.roomId)}</div>
                <div style={{ marginLeft: 'auto' }}><strong>Date:</strong> {new Date().toLocaleDateString('fr-FR')}</div>
              </div>
              <div className="ens-sessions-list">
                {studentsInGroup.map(student => (
                  <div key={student.id} className="presence-item" style={{ padding: '0.75rem 0' }}>
                    <div className="presence-name" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="ens-absence-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{student.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{student.CNE}</div>
                      </div>
                    </div>
                    <div className="presence-toggle">
                      <button 
                        className={`ptoggle-btn present ${!absentIds.includes(student.id) ? 'active' : ''}`}
                        onClick={() => toggleAbsent(student.id)}
                      >Présent</button>
                      <button 
                        className={`ptoggle-btn absent ${absentIds.includes(student.id) ? 'active' : ''}`}
                        onClick={() => toggleAbsent(student.id)}
                      >Absent</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAppelModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSaveAppel}>Enregistrer l'appel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MODIFIER LA SÉANCE ── */}
      {showEditModal && activeSession && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-hdr-title">Modifier la séance</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-bdy">
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Statut de la séance</label>
                <select 
                  className="form-control" 
                  value={activeSession.statut}
                  onChange={e => setActiveSession({...activeSession, statut: e.target.value})}
                >
                  <option value="PLANIFIEE">Planifiée (Normal)</option>
                  <option value="ANNULEE">Annulée</option>
                  <option value="RATTRAPAGE">Rattrapage</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Salle</label>
                <select 
                  className="form-control"
                  value={activeSession.roomId}
                  onChange={e => setActiveSession({...activeSession, roomId: parseInt(e.target.value)})}
                >
                  {db.rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type de séance</label>
                <select 
                  className="form-control"
                  value={activeSession.type}
                  onChange={e => setActiveSession({...activeSession, type: e.target.value})}
                >
                  <option value="Cours">Cours</option>
                  <option value="TD">TD</option>
                  <option value="TP">TP</option>
                  <option value="Examen">Examen</option>
                </select>
              </div>
              {activeSession.statut === 'ANNULEE' && (
                <div className="form-group" style={{ marginTop: '1.25rem' }}>
                  <label className="form-label">Motif d'annulation</label>
                  <textarea 
                    className="form-control" 
                    value={activeSession.motifAnnulation || ''}
                    onChange={e => setActiveSession({...activeSession, motifAnnulation: e.target.value})}
                    placeholder="Ex: Absence enseignant, Jour férié..."
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Enregistrer les modifications</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonPlanning;
