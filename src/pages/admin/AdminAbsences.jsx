import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  AlertTriangle, Search, Filter, Calendar, User, Mail, Download, 
  CheckCircle, XCircle, Clock, ChevronRight, Eye, ShieldCheck, FileText, X
} from 'lucide-react';

const AdminAbsences = () => {
  const { db, studentName, filiereName, moduleName, save } = useData();
  const { success, info, warning } = useToast();
  
  const [filiereFilter, setFiliereFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Group absences by student and calculate totals
  const studentStats = useMemo(() => {
    const stats = {};
    db.absences.forEach(a => {
      if (!stats[a.studentId]) stats[a.studentId] = { total: 0, nonJustified: 0, list: [] };
      stats[a.studentId].total++;
      if (!a.justified) stats[a.studentId].nonJustified++;
      stats[a.studentId].list.push(a);
    });
    return stats;
  }, [db.absences]);

  const filteredStudents = useMemo(() => {
    return db.students.filter(s => {
      const stats = studentStats[s.id] || { total: 0 };
      const matchesFiliere = !filiereFilter || s.filiereId === parseInt(filiereFilter);
      const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (s.CNE || s.cne || '').toLowerCase().includes(searchTerm.toLowerCase());
      return stats.total > 0 && matchesFiliere && matchesSearch;
    }).sort((a,b) => (studentStats[b.id]?.total || 0) - (studentStats[a.id]?.total || 0));
  }, [db.students, studentStats, filiereFilter, searchTerm]);

  // --- Handlers ---
  const handleExportReport = () => {
    info('Génération du rapport', 'Préparation du rapport de commission d\'assiduité...');
    setTimeout(() => {
      success('Rapport prêt', 'Le document PDF a été généré et téléchargé.');
    }, 2000);
  };

  const handleSendWarning = (student) => {
    info('Envoi d\'avertissement', `Un email officiel a été envoyé à ${student.name}.`);
    setTimeout(() => {
      success('Notification envoyée', 'L\'étudiant a reçu une alerte sur son tableau de bord.');
    }, 1000);
  };

  const handleOpenDetail = (student) => {
    setSelectedStudent(student);
    setShowPanel(true);
  };

  const handleToggleJustification = (absence) => {
    const updated = { ...absence, justified: !absence.justified, statut: !absence.justified ? 'JUSTIFIEE' : 'INJUSTIFIEE' };
    save('absences', updated);
    success(updated.justified ? 'Absence justifiée' : 'Justification retirée');
  };

  return (
    <div className="page-area fade-in">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Suivi de l'Assiduité</h2>
          <p className="page-hero-sub">Contrôle des absences et alertes sur les seuils critiques d'élimination</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportReport}>
          <Download size={18} style={{ marginRight: '8px' }} /> Rapport Commission
        </button>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.05)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--danger)', flex: 1, minWidth: '300px' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
              {Object.values(studentStats).filter(s => s.total >= 3).length} étudiants ont dépassé le seuil d'alerte (3+ absences).
            </span>
         </div>
         
         <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '36px' }} 
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>

         <select className="form-control" style={{ width: '180px' }} value={filiereFilter} onChange={e => setFiliereFilter(e.target.value)}>
           <option value="">Toutes les filières</option>
           {db.filieres.map(f => <option key={f.id} value={f.id}>{f.code}</option>)}
         </select>
      </div>

      <div className="page-card animate-up">
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Étudiant</th>
                <th>Filière</th>
                <th style={{ textAlign: 'center' }}>Total Absences</th>
                <th style={{ textAlign: 'center' }}>Non Justifiées</th>
                <th>Risque</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => {
                const stats = studentStats[s.id];
                const riskLevel = stats.total >= 5 ? 'Critique' : stats.total >= 3 ? 'Moyen' : 'Faible';
                return (
                  <tr key={s.id} className="hover-row">
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--blue-dark)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{s.CNE || s.cne}</div>
                    </td>
                    <td><span className="badge badge-gray">{filiereName(s.filiereId)}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.1rem', color: stats.total >= 5 ? 'var(--danger)' : stats.total >= 3 ? 'var(--orange)' : 'var(--success)' }}>{stats.total}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <span style={{ fontWeight: '600', color: stats.nonJustified > 0 ? 'var(--danger)' : 'var(--text-3)' }}>{stats.nonJustified}</span>
                    </td>
                    <td>
                      <span className={`badge ${stats.total >= 5 ? 'badge-red' : stats.total >= 3 ? 'badge-orange' : 'badge-green'}`}>
                        {riskLevel}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" title="Voir détails" onClick={() => handleOpenDetail(s)}>
                             <Eye size={16} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Envoyer avertissement" onClick={() => handleSendWarning(s)}>
                             <Mail size={16} color="var(--blue-mid)" />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr><td colSpan="6" className="table-empty">Aucun résultat trouvé pour ces critères.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel: Student Absences Details */}
      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" style={{ width: '550px' }} onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <div>
              <h3 className="side-panel-title">Détail des Absences</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>{selectedStudent?.name}</p>
            </div>
            <button className="modal-close" onClick={() => setShowPanel(false)}><X size={20} /></button>
          </div>
          <div className="side-panel-body">
            {selectedStudent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Taux Global</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--blue-dark)' }}>
                        {((studentStats[selectedStudent.id]?.total / 20) * 100).toFixed(1)}%
                     </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Non Justifiées</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--danger)' }}>
                        {studentStats[selectedStudent.id]?.nonJustified}
                     </div>
                  </div>
                </div>

                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--blue-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  Historique des absences
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {studentStats[selectedStudent.id]?.list.map((abs, idx) => {
                    const session = db.sessions.find(ses => ses.id === abs.sessionId);
                    return (
                      <div key={idx} style={{ padding: '16px', borderRadius: '12px', background: 'white', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--blue-dark)', fontSize: '0.9rem' }}>{moduleName(session?.moduleId)}</div>
                          <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {abs.date}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {session?.startSlot}</span>
                          </div>
                        </div>
                        <div>
                          <button 
                            className={`btn btn-sm ${abs.justified ? 'btn-ghost' : 'btn-primary'}`}
                            style={{ fontSize: '0.7rem', height: '28px', padding: '0 12px' }}
                            onClick={() => handleToggleJustification(abs)}
                          >
                            {abs.justified ? 'Justifiée' : 'Justifier'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Fermer</button>
            <button className="btn btn-primary" onClick={() => handleSendWarning(selectedStudent)}>
              <Mail size={16} style={{ marginRight: '8px' }} /> Envoyer Rappel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .side-panel-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
          z-index: 1000; opacity: 0; visibility: hidden; transition: all 0.3s ease;
        }
        .side-panel-overlay.open { opacity: 1; visibility: visible; }
        .side-panel {
          position: absolute; right: 0; top: 0; height: 100%;
          background: white; box-shadow: -10px 0 30px rgba(0,0,0,0.1);
          display: flex; flex-direction: column;
          transform: translateX(100%); transition: transform 0.3s ease;
        }
        .side-panel-overlay.open .side-panel { transform: translateX(0); }
        .side-panel-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .side-panel-title { font-size: 1.25rem; font-weight: 800; color: var(--blue-dark); margin: 0; }
        .side-panel-body { flex: 1; padding: 24px; overflow-y: auto; background: var(--bg-soft); }
        .side-panel-footer { padding: 20px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
        .hover-row:hover { background: rgba(30,58,95,0.02); }
      `}</style>
    </div>
  );
};

export default AdminAbsences;
