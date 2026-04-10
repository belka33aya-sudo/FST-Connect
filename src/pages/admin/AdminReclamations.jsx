import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { MessageSquare, Filter, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle, Edit3 } from 'lucide-react';

const AdminReclamations = () => {
  const { db, save, studentName, moduleName } = useData();
  const { success } = useToast();
  
  const [statutFilter, setStatutFilter] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  
  const [formData, setFormData] = useState({ reponse: '', newNote: '' });

  const filteredRecs = useMemo(() => {
    return (db.reclamations || []).filter(r => statutFilter ? r.statut === statutFilter : true);
  }, [db.reclamations, statutFilter]);

  const handleOpenDetail = (rec) => {
    setSelectedRec(rec);
    setFormData({ reponse: rec.reponse || '', newNote: '' });
    setShowPanel(true);
  };

  const handleAction = (newStatut) => {
    const updated = { ...selectedRec, statut: newStatut, reponse: formData.reponse, updatedAt: new Date().toISOString() };
    save('reclamations', updated);
    
    // If validated and new note provided, update grade
    if (newStatut === 'VALIDEE' && formData.newNote) {
      const sId = selectedRec.idEtudiant || selectedRec.studentId;
      const mId = selectedRec.idModule || selectedRec.moduleId;
      const grade = (db.notes || db.grades || []).find(g => (g.idEtudiant === sId || g.studentId === sId) && (g.idModule === mId || g.moduleId === mId));
      if (grade) {
        save('notes', { 
            ...grade, 
            idEtudiant: sId,
            idModule: mId,
            moyenne: parseFloat(formData.newNote),
            final: parseFloat(formData.newNote), 
            edited: true 
        });
      }
    }
    
    setShowPanel(false);
    success(newStatut === 'VALIDEE' ? 'Réclamation Validée' : 'Réclamation Rejetée', 'Le statut a été mis à jour et l\'étudiant notifié.');
  };

  const getStatutBadge = (statut) => {
    const map = {
      'SOUMISE': 'badge-blue',
      'EN_COURS': 'badge-orange',
      'VALIDEE': 'badge-green',
      'REJETEE': 'badge-red'
    };
    return <span className={`badge ${map[statut] || 'badge-gray'}`}>{statut.replace('_', ' ')}</span>;
  };

  return (
    <div className="page-area fade-in">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Réclamations & Litiges de Notes</h2>
          <p className="page-hero-sub">Gestion des contestations de notes soumises par les étudiants</p>
        </div>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', width: '220px' }}>
          <Filter size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <select className="form-control" style={{ paddingLeft: '32px' }} value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
             <option value="">Tous les statuts</option>
             <option value="SOUMISE">Nouveau / Soumis</option>
             <option value="EN_COURS">En cours d'examen</option>
             <option value="VALIDEE">Validé / Rectifié</option>
             <option value="REJETEE">Rejeté / Maintenu</option>
          </select>
        </div>
      </div>

      <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Étudiant</th>
                <th>Module concerné</th>
                <th>Date de dépôt</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecs.map(r => (
                <tr key={r.id} className="hover-row" onClick={() => handleOpenDetail(r)} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--blue-dark)' }}>{studentName(r.idEtudiant || r.studentId)}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-2)' }}>{moduleName(r.idModule || r.moduleId)}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} /> {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{getStatutBadge(r.statut)}</td>
                  <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                     <button className="btn btn-ghost btn-sm" style={{ color: 'var(--blue-mid)' }}>
                        Traiter <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                     </button>
                  </td>
                </tr>
              ))}
              {filteredRecs.length === 0 && (
                <tr><td colSpan="5" className="table-empty">Aucune réclamation enregistrée pour cette sélection.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">Dossier de Réclamation</h3>
            <button className="modal-close" onClick={() => setShowPanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
            {selectedRec && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ padding: '20px', background: '#f0f7ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--blue-dark)', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <MessageSquare size={14} /> Motif de l'étudiant
                     </div>
                     <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e3a8a', lineHeight: '1.5', fontStyle: 'italic' }}>
                       "{selectedRec.description}"
                     </p>
                     <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-3)' }}>NOTE CONTESTÉE :</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--danger)' }}>{selectedRec.noteContestee}/20</span>
                     </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Réponse Administrative / Commentaire *</label>
                    <textarea 
                      className="form-control" 
                      style={{ height: '100px', padding: '12px' }}
                      placeholder="Indiquez ici les conclusions de la vérification (erreur de report, erreur de calcul, ou maintien de la note)..."
                      value={formData.reponse}
                      onChange={(e) => setFormData({...formData, reponse: e.target.value})}
                      disabled={selectedRec.statut === 'VALIDEE' || selectedRec.statut === 'REJETEE'}
                    />
                  </div>

                  {selectedRec.statut !== 'VALIDEE' && selectedRec.statut !== 'REJETEE' && (
                    <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#065f46', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                         <Edit3 size={14} /> Rectification de Note
                      </div>
                      <div className="form-group">
                        <label className="form-label">Nouvelle Note Finale (si validée)</label>
                        <input 
                          type="number" step="0.25" min="0" max="20" className="form-control" 
                          style={{ fontWeight: '800', fontSize: '1.1rem', color: '#059669', borderColor: '#a7f3d0' }}
                          placeholder="Entrez la note rectifiée..."
                          value={formData.newNote}
                          onChange={(e) => setFormData({...formData, newNote: e.target.value})}
                        />
                        <p style={{ marginTop: '6px', fontSize: '0.7rem', color: '#047857' }}>Note: La mise à jour sera effective dans le relevé de notes global dès validation.</p>
                      </div>
                    </div>
                  )}

                  {(selectedRec.statut === 'VALIDEE' || selectedRec.statut === 'REJETEE') && (
                    <div style={{ padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: selectedRec.statut === 'VALIDEE' ? '#ecfdf5' : '#fff1f2', color: selectedRec.statut === 'VALIDEE' ? '#059669' : '#e11d48', border: '1px solid currentColor' }}>
                       {selectedRec.statut === 'VALIDEE' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                       <div>
                         <div style={{ fontWeight: '800', fontSize: '0.8rem' }}>RÉCLAMATION TRAITÉE</div>
                         <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Décision prise le {new Date(selectedRec.updatedAt || selectedRec.createdAt).toLocaleDateString()}</div>
                       </div>
                    </div>
                  )}
               </div>
            )}
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            {selectedRec?.statut !== 'VALIDEE' && selectedRec?.statut !== 'REJETEE' && (
              <>
                <button onClick={() => handleAction('REJETEE')} className="btn btn-ghost" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Maintenir la note</button>
                <button onClick={() => handleAction('VALIDEE')} className="btn btn-primary">Valider & Rectifier</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReclamations;
