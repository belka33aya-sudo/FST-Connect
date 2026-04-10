import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

/* ── helpers ── */
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

/* ── MODULE 9: Dashboard Étudiant (Simplified) ── */
const EtudiantDashboard = () => {
  const { currentUser } = useAuth();
  const { db, moduleName, roomName } = useData();
  const navigate = useNavigate();

  const student = db.etudiants.find(s => s.utilisateurId === currentUser.id);
  const user = db.utilisateurs.find(u => u.id === currentUser.id);

  if (!student || !user) return <div className="empty-state"><p>Profil étudiant introuvable.</p></div>;

  const isReadOnly = student.statut === 'ABANDONNE';

  // Prochains Examens
  const upcomingExams = useMemo(() => {
    return db.seances.filter(s =>
      (s.idGroupe === student.idGroupeTD || s.idGroupe === student.idGroupeTP) &&
      s.type === 'Examen' &&
      s.statut !== 'ANNULEE'
    ).slice(0, 3);
  }, [db.seances, student]);

  // Notes Publiées
  const myGrades = useMemo(() => db.notes.filter(g => g.idEtudiant === student.id), [db.notes, student.id]);

  // Annonces
  const myAnnonces = useMemo(() => {
    const filtered = db.annonces.filter(a =>
      a.cible === 'Tous' || (a.cible === 'filiere' && a.idFiliere === student.idFiliere)
    );
    return [...filtered].sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return new Date(b.dateCreation) - new Date(a.dateCreation);
    }).slice(0, 5);
  }, [db.annonces, student.idFiliere]);

  // Documents récents
  const recentDocs = useMemo(() => {
    const studentModules = db.modules.filter(m => m.idFiliere === student.idFiliere).map(m => m.id);
    return db.documents
      .filter(d => studentModules.includes(d.idModule || d.moduleId))
      .sort((a, b) => new Date(b.dateUpload) - new Date(a.dateUpload))
      .slice(0, 4);
  }, [db.documents, db.modules, student.idFiliere]);

  // PFE / Stage (pour les deadlines)
  const myPFE = db.pfes.find(p => p.idEtudiant === student.id || (p.studentIds && p.studentIds.includes(student.id)));

  return (
    <div className="dashboard-page">
      {/* Hero */}
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Content de vous revoir, {user.prenom}</h2>
          <p className="page-hero-sub">
            {db.filieres.find(f => f.id === student.idFiliere)?.intitule} • Année {student.anneeInscription}
          </p>
        </div>
        <div className="page-hero-right">
          <span className={`badge ${student.statut === 'ACTIF' ? 'badge-green' : 'badge-orange'}`}>
            Statut: {student.statut}
          </span>
        </div>
      </div>

      {isReadOnly && (
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--radius)', padding: '.85rem 1.25rem', marginBottom: '1.25rem', color: '#991b1b', fontSize: '.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>Accès en mode lecture seule (Statut: ABANDONNÉ).</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Column: Communications and Resources */}
        <div className="dg-left">
          {/* Annonces */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                <h3 className="page-card-title">Annonces de l'établissement</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/announcements')}>Tout voir</button>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {myAnnonces.length === 0 ? (
                <div className="empty-state"><p>Aucune annonce pour le moment.</p></div>
              ) : (
                myAnnonces.map(ann => (
                  <div key={ann.id} style={{
                    padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
                    borderLeft: ann.urgente ? '4px solid var(--danger)' : '4px solid transparent',
                    background: ann.urgente ? 'rgba(239,68,68,.02)' : 'transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                      {ann.urgente && <span className="badge badge-red" style={{ fontSize: '.65rem' }}>URGENT</span>}
                      <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text)' }}>{ann.title}</span>
                    </div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>
                      Posté le {new Date(ann.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ressources Récentes */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                <h3 className="page-card-title">Ressources Récentes</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/etudiant/ressources')}>Médiathèque</button>
            </div>
            <div className="page-card-body" style={{ padding: '0 1.25rem 1.25rem' }}>
              {recentDocs.length === 0 ? (
                <p style={{ fontSize: '.85rem', color: 'var(--text-3)', textAlign: 'center', padding: '1rem' }}>Aucun document disponible.</p>
              ) : (
                recentDocs.map(doc => (
                  <div key={doc.id} className="doc-item" style={{ cursor: 'pointer', marginBottom: '.5rem' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .6, color: 'var(--blue-mid)' }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{doc.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>{moduleName(doc.moduleId)} • {doc.uploadedAt}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Academic and Support */}
        <div className="dg-right">
          {/* Dernières Notes */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                <h3 className="page-card-title">Dernières Notes</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/etudiant/notes')}>Relevé</button>
            </div>
            <div className="page-card-body" style={{ padding: '0 1.25rem 1rem' }}>
              {myGrades.length === 0 ? (
                <p style={{ fontSize: '.85rem', color: 'var(--text-3)', textAlign: 'center', padding: '1.5rem 0' }}>En attente de publication.</p>
              ) : (
                myGrades.slice(0, 4).map(g => {
                  const mod = db.modules.find(m => m.id === g.moduleId);
                  const avg = gradeAvg(g.cc, g.final, mod?.coeffCC, mod?.coeffEF);
                  return (
                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{mod?.title}</div>
                      <div className={avg >= 10 ? 'grade-pass' : 'grade-fail'}>{avg.toFixed(2)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Événements à venir */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <h3 className="page-card-title">Événements à venir</h3>
              </div>
            </div>
            <div className="page-card-body" style={{ padding: '0 1.25rem 1.25rem' }}>
              {upcomingExams.length > 0 ? (
                upcomingExams.map(ex => (
                  <div key={ex.id} style={{ display: 'flex', gap: '1rem', padding: '.75rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '.4rem .6rem', textAlign: 'center', minWidth: '50px' }}>
                      <div style={{ fontSize: '.85rem', fontWeight: 800 }}>{DAYS[ex.day-1]}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.85rem' }}>Examen: {moduleName(ex.moduleId)}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{ex.startSlot} • {roomName(ex.roomId)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '.82rem', color: 'var(--text-3)', textAlign: 'center', padding: '1rem 0' }}>Aucun examen prévu.</p>
              )}
              
              {myPFE && myPFE.statut === 'EN_COURS' && (
                <div style={{ marginTop: '1rem', padding: '.75rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius)', border: '1px dashed var(--blue-light)' }}>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--blue-mid)', textTransform: 'uppercase' }}>Deadline PFE</div>
                  <div style={{ fontWeight: 600, fontSize: '.82rem' }}>Dépôt du rapport final</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>30 Avril 2026</div>
                </div>
              )}
            </div>
          </div>

          {/* Besoin d'aide ? */}
          <div className="page-card animate-up" style={{ background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', color: '#fff', border: 'none' }}>
            <div className="page-card-body" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '.5rem', color: '#fff' }}>Besoin d'aide ?</h4>
              <p style={{ fontSize: '.85rem', opacity: .9, marginBottom: '1.25rem' }}>Contactez le secrétariat ou accédez au support pour toute assistance technique ou pédagogique.</p>
              <button className="btn btn-orange btn-sm btn-block" onClick={() => window.open('https://edoc-fstt.uae.ac.ma/login', '_blank', 'noopener,noreferrer')}>Centre de Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtudiantDashboard;
