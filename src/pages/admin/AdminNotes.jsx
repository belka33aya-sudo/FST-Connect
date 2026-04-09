import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  FileText, Search, Download, Filter, GraduationCap, 
  AlertCircle, X, Save, Edit3, CheckCircle, ChevronRight,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';

const AdminNotes = () => {
  const { db, studentName, filiereName, moduleName, save } = useData();
  const { success, info, warning } = useToast();
  
  const [filiereFilter, setFiliereFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [formData, setFormData] = useState({ cc: '', exam: '', final: '' });

  const grades = useMemo(() => {
    return db.grades.filter(g => {
      const student = db.students.find(s => s.id === g.studentId);
      const matchesFiliere = !filiereFilter || student?.filiereId === parseInt(filiereFilter);
      const matchesSearch = !search || student?.name.toLowerCase().includes(search.toLowerCase()) || 
                           (student?.CNE || student?.cne || '').toLowerCase().includes(search.toLowerCase());
      return matchesFiliere && matchesSearch;
    });
  }, [db.grades, db.students, filiereFilter, search]);

  // --- Handlers ---
  const handleExportPV = () => {
    info('Génération PV', 'Le Procès-Verbal global est en cours de préparation...');
    setTimeout(() => {
      success('PV Généré', 'Le document officiel a été téléchargé.');
    }, 2000);
  };

  const handleOpenDetail = (grade) => {
    setSelectedGrade(grade);
    setFormData({ 
      cc: grade.cc || '', 
      exam: grade.exam || '', 
      final: grade.final || '' 
    });
    setShowPanel(true);
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    const updated = {
      ...selectedGrade,
      cc: parseFloat(formData.cc),
      exam: parseFloat(formData.exam),
      final: parseFloat(formData.final)
    };
    save('grades', updated);
    setShowPanel(false);
    success('Notes rectifiées', 'La moyenne a été mise à jour dans le système.');
  };

  // Auto-calculate final if CC or Exam changes
  const updateFinal = (newCC, newExam) => {
    const ccVal = parseFloat(newCC) || 0;
    const examVal = parseFloat(newExam) || 0;
    const finalVal = (ccVal * 0.4 + examVal * 0.6).toFixed(2); // Standard weighting
    setFormData(prev => ({ ...prev, cc: newCC, exam: newExam, final: finalVal }));
  };

  return (
    <div className="page-area fade-in">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Gestion des Notes & Procès-verbaux</h2>
          <p className="page-hero-sub">Consultation globale des résultats académiques et validation des relevés</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportPV}>
          <Download size={18} style={{ marginRight: '8px' }} /> Exporter PV Global
        </button>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input 
            type="text" 
            placeholder="Rechercher un étudiant par nom ou CNE..." 
            className="form-control"
            style={{ paddingLeft: '40px', width: '100%' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: '220px' }} value={filiereFilter} onChange={e => setFiliereFilter(e.target.value)}>
          <option value="">Toutes les filières</option>
          {db.filieres.map(f => <option key={f.id} value={f.id}>{f.code} - {f.name}</option>)}
        </select>
      </div>

      <div className="page-card animate-up">
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Étudiant</th>
                <th>Filière</th>
                <th>Module</th>
                <th>Note Finale</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(g => {
                const s = db.students.find(st => st.id === g.studentId);
                const isValidation = g.final >= 12;
                return (
                  <tr key={g.id} className="hover-row">
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--blue-dark)' }}>{studentName(g.studentId)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{s?.CNE || s?.cne}</div>
                    </td>
                    <td><span className="badge badge-gray">{filiereName(s?.filiereId)}</span></td>
                    <td><div style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: '600' }}>{moduleName(g.moduleId)}</div></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: isValidation ? 'var(--success)' : 'var(--danger)' }}>
                          {g.final.toFixed(2)}
                        </div>
                        {g.final > 15 ? <TrendingUp size={14} color="var(--success)" /> : g.final < 10 ? <TrendingDown size={14} color="var(--danger)" /> : <Minus size={14} color="var(--text-3)" />}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isValidation ? 'badge-green' : 'badge-red'}`}>
                        {isValidation ? 'Validé' : 'Ajourné'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                       <button className="btn btn-ghost btn-sm" onClick={() => handleOpenDetail(g)} title="Ajuster les notes">
                          <Edit3 size={16} />
                       </button>
                    </td>
                  </tr>
                );
              })}
              {grades.length === 0 && (
                <tr><td colSpan="6" className="table-empty">Aucune note enregistrée pour ces critères.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel: Grade Detail & Edit */}
      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <div>
              <h3 className="side-panel-title">Détail des Évaluations</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>{studentName(selectedGrade?.studentId)}</p>
            </div>
            <button className="modal-close" onClick={() => setShowPanel(false)}><X size={20} /></button>
          </div>
          <div className="side-panel-body">
            {selectedGrade && (
              <form id="gradeForm" onSubmit={handleSaveNotes} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ padding: '20px', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--blue-dark)', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <GraduationCap size={16} /> Module : {moduleName(selectedGrade.moduleId)}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Note CC (40%)</label>
                      <input 
                        type="number" step="0.25" min="0" max="20" className="form-control"
                        value={formData.cc}
                        onChange={e => updateFinal(e.target.value, formData.exam)}
                        required
                        style={{ fontWeight: '700', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Note Examen (60%)</label>
                      <input 
                        type="number" step="0.25" min="0" max="20" className="form-control"
                        value={formData.exam}
                        onChange={e => updateFinal(formData.cc, e.target.value)}
                        required
                        style={{ fontWeight: '700', fontSize: '1.1rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '32px 20px', borderRadius: '16px', border: '2px solid var(--blue-mid)', background: 'rgba(30,58,95,0.02)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Moyenne Calculée
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: '950', color: 'var(--blue-dark)', lineHeight: '1' }}>
                    {formData.final}
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <span className={`badge ${parseFloat(formData.final) >= 12 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                      {parseFloat(formData.final) >= 12 ? 'Validation Acquise' : 'Module Non Validé'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', color: '#92400e', fontSize: '0.8rem', display: 'flex', gap: '12px' }}>
                  <AlertCircle size={20} />
                  <div>
                    <strong>Avertissement :</strong> Toute modification manuelle des notes sera enregistrée dans les logs d'audit et impactera immédiatement le PV de délibération.
                  </div>
                </div>
              </form>
            )}
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            <button type="submit" form="gradeForm" className="btn btn-primary">
              <Save size={18} style={{ marginRight: '8px' }} /> Valider la Note
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
        .side-panel-body { flex: 1; padding: 24px; overflow-y: auto; }
        .side-panel-footer { padding: 20px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
        .hover-row:hover { background: rgba(30,58,95,0.02); }
      `}</style>
    </div>
  );
};

export default AdminNotes;
