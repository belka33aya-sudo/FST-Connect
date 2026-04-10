import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ── Helpers ────────────────────────────────────────────── */
const DAY_NAMES = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TODAY_DOW = new Date().getDay(); // 0=Sun
const todayIdx = TODAY_DOW === 0 ? 7 : TODAY_DOW;

const TYPE_COLOR = {
  Cours:  { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' },
  TD:     { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
  TP:     { bg: '#ffedd5', color: '#c2410c', border: '#f97316' },
  Examen: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
};

const STATUT_BADGE = {
  PLANIFIEE:   { cls: 'badge-green',  label: 'Planifiée' },
  ANNULEE:     { cls: 'badge-red',    label: 'Annulée' },
  RATTRAPAGE:  { cls: 'badge-yellow', label: 'Rattrapage' },
};

const SessionRow = ({ session, moduleName, roomName, groupName, highlight }) => {
  const tc = TYPE_COLOR[session.type] || TYPE_COLOR.Cours;
  const sb = STATUT_BADGE[session.statut] || STATUT_BADGE.PLANIFIEE;
  const start = session.heureDebut || session.startSlot || '—';
  const end = session.heureFin || session.endSlot || '—';
  return (
    <div className={`ens-session-row ${highlight ? 'ens-today' : ''} ${session.statut === 'ANNULEE' ? 'ens-cancelled' : ''}`}>
      <div className="ens-session-time">
        <span>{start}</span>
        <span className="ens-time-sep">—</span>
        <span>{end}</span>
      </div>
      <div className="ens-session-type-pill" style={{ background: tc.bg, color: tc.color, borderLeft: `3px solid ${tc.border}` }}>
        {session.type}
      </div>
      <div className="ens-session-info">
        <div className="ens-session-module">{moduleName(session.idModule || session.moduleId)}</div>
        <div className="ens-session-meta">
          <span>{groupName(session.idGroupe || session.groupId)}</span>
          <span className="ens-dot">·</span>
          <span>{roomName(session.idSalle || session.roomId)}</span>
          {session.isRattrapage && <span className="badge badge-yellow" style={{ marginLeft: 6 }}>Rattrapage</span>}
        </div>
      </div>
      <span className={`badge ${sb.cls}`}>{sb.label}</span>
    </div>
  );
};

const EnseignantDashboard = () => {
  const { db, moduleName, roomName, groupName, filiereName } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');

  const teacher = useMemo(() => db.enseignants.find(t => t.utilisateurId === currentUser.id), [db.enseignants, currentUser.id]);
  const teacherId = teacher?.id;

  const myModules = useMemo(() =>
    db.modules.filter(m => (m.idEnseignant === teacherId || m.teacherId === teacherId)),
    [db.modules, teacherId]);

  const mySessions = useMemo(() =>
    db.seances.filter(s => (s.idEnseignant === teacherId || s.teacherId === teacherId)),
    [db.seances, teacherId]);

  const todaySessions = useMemo(() =>
    mySessions.filter(s => (s.jourNum || s.day) === todayIdx).sort((a, b) => (a.heureDebut || a.startSlot || '').localeCompare(b.heureDebut || b.startSlot || '')),
    [mySessions]);

  const weekSessions = useMemo(() =>
    mySessions.slice().sort((a, b) => (a.jourNum || a.day) - (b.jourNum || b.day) || (a.heureDebut || a.startSlot || '').localeCompare(b.heureDebut || b.startSlot || '')),
    [mySessions]);

  const pendingAbsences = useMemo(() => {
    const mySessionIds = new Set(mySessions.map(s => s.id));
    return db.absences.filter(a =>
      mySessionIds.has(a.idSeance || a.sessionId) && a.statut === 'INJUSTIFIEE'
    );
  }, [db.absences, mySessions]);

  const recentAnnouncements = (db.annonces || db.announcements || []).slice(0, 4);

  return (
    <div className="ens-dashboard">
      <div className="ens-hero animate-up">
        <div className="ens-hero-left">
          <div className="ens-hero-avatar">{(currentUser?.name || 'P').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div>
            <h2 className="ens-hero-title">Bienvenue, {currentUser?.prenom} {currentUser?.nom}</h2>
            <p className="ens-hero-sub">
              {teacher?.specialite || 'Enseignant'} &mdash; {teacher?.grade || ''} &mdash; Portail GDI
            </p>
            <p className="ens-hero-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:5}}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="ens-hero-actions">
          <button className="btn btn-primary" onClick={() => navigate('/absences')}>
            Saisir absences
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/grades')}>
            Publier notes
          </button>
        </div>
      </div>

      <div className="ens-main-grid">
        <div className="ens-col-left">
          <div className="page-card animate-up">
            <div className="page-card-header">
              <h3 className="page-card-title">Emploi du Temps</h3>
              <div className="ens-tabs">
                <button className={`ens-tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>Aujourd'hui</button>
                <button className={`ens-tab ${activeTab === 'week' ? 'active' : ''}`} onClick={() => setActiveTab('week')}>Cette semaine</button>
              </div>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {activeTab === 'today' && (
                todaySessions.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>Aucune séance prévue aujourd'hui.</p>
                  </div>
                ) : (
                  <div className="ens-sessions-list">
                    {todaySessions.map(s => (
                      <SessionRow key={s.id} session={s} moduleName={moduleName} roomName={roomName} groupName={groupName} highlight={true} />
                    ))}
                  </div>
                )
              )}
              {activeTab === 'week' && (
                weekSessions.map((s, idx) => {
                  const sDay = s.jourNum || s.day;
                  const prevSDay = idx > 0 ? (weekSessions[idx - 1].jourNum || weekSessions[idx - 1].day) : null;
                  const dayChanged = idx === 0 || sDay !== prevSDay;
                  return (
                    <React.Fragment key={s.id}>
                      {dayChanged && (
                        <div className="ens-day-divider">
                          <span>{DAY_NAMES[sDay]}</span>
                        </div>
                      )}
                      <SessionRow session={s} moduleName={moduleName} roomName={roomName} groupName={groupName} highlight={sDay === todayIdx} />
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>

          <div className="page-card animate-up">
            <div className="page-card-header">
              <h3 className="page-card-title">Mes Modules</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/modules')}>Voir tout</button>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {myModules.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>Aucun module assigné.</div>
              ) : (
                myModules.map(m => {
                  const filiere = db.filieres.find(f => f.id === m.filiereId);
                  return (
                    <div key={m.id} className="ens-module-item">
                      <div className="ens-module-code">{m.code}</div>
                      <div className="ens-module-body">
                        <div className="ens-module-title">{m.intitule || m.title}</div>
                        <div className="ens-module-meta">
                           <span className="badge badge-blue">{filiereName(m.idFiliere || m.filiereId)}</span>
                           <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Semestre {m.semestre || m.semester}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="ens-col-right">
          <div className="page-card animate-up">
            <div className="page-card-header">
              <h3 className="page-card-title">Absences à traiter</h3>
              {pendingAbsences.length > 0 && <span className="badge badge-red">{pendingAbsences.length}</span>}
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {pendingAbsences.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '.85rem' }}>✓ Aucune absence en attente</div>
              ) : (
                pendingAbsences.slice(0, 5).map(a => {
                  const std = db.etudiants.find(s => s.id === (a.idEtudiant || a.studentId));
                  const u = std ? db.utilisateurs.find(user => user.id === std.utilisateurId) : null;
                  const sName = u ? `${u.prenom} ${u.nom}` : (std?.name || '?');
                  const sess = db.seances.find(s => s.id === (a.idSeance || a.sessionId));
                  return (
                    <div key={a.id} className="ens-absence-item">
                      <div className="ens-absence-avatar">{sName[0]}</div>
                      <div className="ens-absence-info">
                        <div className="ens-absence-name">{sName}</div>
                        <div className="ens-absence-meta">{moduleName(sess?.idModule || sess?.moduleId)} · {a.dateSaisie || a.date}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="page-card animate-up">
            <div className="page-card-header">
              <h3 className="page-card-title">Dernières Annonces</h3>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {recentAnnouncements.map(ann => (
                <div key={ann.id} className={`ens-annonce-row ${(ann.urgent || ann.urgente) ? 'ens-urgent' : ''}`} onClick={() => navigate('/announcements')}>
                  <div className="ens-annonce-content">
                    <div className="ens-annonce-title">{ann.titre || ann.title}</div>
                    <div className="ens-annonce-date">{new Date(ann.dateCreation || ann.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnseignantDashboard;
