import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { Layers, Plus, ChevronRight, Users, BookOpen, Edit, Trash2, Hash } from 'lucide-react';

const AdminFilieres = () => {
  const { db, save, remove, nextId } = useData();
  const { success } = useToast();
  
  const [selectedFiliereId, setSelectedFiliereId] = useState(db.filieres[0]?.id);
  const [showFilierePanel, setShowFilierePanel] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState(null);

  const [filiereData, setFiliereData] = useState({ code: '', name: '', level: "Cycle d'Ingénieur", semesters: 6 });
  const [groupData, setGroupData] = useState({ name: '', type: 'TD', capacity: 30 });

  const selectedFiliere = useMemo(() => 
    db.filieres.find(f => f.id === selectedFiliereId), 
  [db.filieres, selectedFiliereId]);

  const groups = useMemo(() => {
    const list = db.groupesTD || db.groups || [];
    return list.filter(g => (g.idFiliere || g.filiereId) === selectedFiliereId);
  }, [db.groupesTD, db.groups, selectedFiliereId]);

  const filiereStats = useMemo(() => {
    const stats = {};
    const studentsList = db.etudiants || db.students || [];
    db.filieres.forEach(f => {
      stats[f.id] = studentsList.filter(s => (s.idFiliere || s.filiereId) === f.id).length;
    });
    return stats;
  }, [db.filieres, db.etudiants, db.students]);

  const handleEditFiliere = (f) => {
    setEditingFiliere(f);
    setFiliereData({ ...f });
    setShowFilierePanel(true);
  };

  const handleDeleteFiliere = (id) => {
    if (window.confirm('Supprimer cette filière et tous ses groupes/modules associés ?')) {
      remove('filieres', id);
      success('Supprimée', 'La filière a été retirée.');
    }
  };

  const handleSubmitFiliere = (e) => {
    e.preventDefault();
    const data = { 
      ...filiereData, 
      id: editingFiliere ? editingFiliere.id : nextId('filieres'),
      nom: filiereData.nom || filiereData.name,
      niveauEtude: filiereData.niveauEtude || filiereData.level,
      nombreSemestres: parseInt(filiereData.nombreSemestres || filiereData.semesters),
      // Legacy
      name: filiereData.nom || filiereData.name,
      level: filiereData.niveauEtude || filiereData.level,
      semesters: parseInt(filiereData.nombreSemestres || filiereData.semesters)
    };
    save('filieres', data);
    setShowFilierePanel(false);
    success(editingFiliere ? 'Mise à jour' : 'Créée', 'Filière enregistrée.');
    if (!editingFiliere) setSelectedFiliereId(data.id);
  };

  const handleSubmitGroup = (e) => {
    e.preventDefault();
    const data = { 
        ...groupData, 
        id: nextId('groupesTD'), 
        idFiliere: selectedFiliereId,
        filiereId: selectedFiliereId,
        typeGroup: groupData.typeGroup || groupData.type,
        capacite: parseInt(groupData.capacite || groupData.capacity)
    };
    save('groupesTD', data);
    setShowGroupPanel(false);
    success('Groupe Ajouté', `Le groupe ${groupData.nom || groupData.name} est prêt.`);
  };

  return (
    <div className="page-area fade-in">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Filières & Structure</h2>
          <p className="page-hero-sub">Configuration académique du département</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingFiliere(null); setFiliereData({ code: '', name: '', level: "Cycle d'Ingénieur", semesters: 6 }); setShowFilierePanel(true); }}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Nouvelle Filière
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Sidebar style filiere list */}
        <div className="page-card animate-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Offre de Formation
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {db.filieres.map(f => (
              <div 
                key={f.id}
                onClick={() => setSelectedFiliereId(f.id)}
                style={{ 
                  padding: '16px 20px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid var(--border)',
                  background: selectedFiliereId === f.id ? 'rgba(30,58,95,0.05)' : 'transparent',
                  borderLeft: selectedFiliereId === f.id ? '4px solid var(--blue-mid)' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
                className="filiere-item"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: 'var(--blue-dark)', fontSize: '0.95rem' }}>{f.code}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-3)' }}>{filiereStats[f.id] || 0}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.nom || f.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detailed View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedFiliere ? (
            <>
              {/* Info & Actions */}
              <div className="page-card animate-up" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--blue-dark)', margin: 0 }}>{selectedFiliere.name}</h3>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                       <span className="badge badge-blue">{selectedFiliere.level}</span>
                       <span className="badge badge-gray">{selectedFiliere.semesters} Semestres</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEditFiliere(selectedFiliere)}><Edit size={16} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteFiliere(selectedFiliere.id)}><Trash2 size={16} color="var(--danger)" /></button>
                  </div>
                </div>
              </div>

              {/* Groups Grid */}
              <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--blue-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} /> Groupes TD & TP
                  </h4>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--blue-mid)' }} onClick={() => setShowGroupPanel(true)}>
                    <Plus size={14} style={{ marginRight: '4px' }} /> Ajouter un groupe
                  </button>
                </div>
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                  {groups.map(g => (
                    <div key={g.id} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '800', color: 'var(--blue-dark)' }}>{g.nom || g.name}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>{g.typeGroup || g.type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--blue-mid)' }}>{(db.etudiants || db.students || []).filter(s => (s.idGroupeTD || s.groupTDId) === g.id).length}</div>
                         <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>ÉTUDIANTS</div>
                      </div>
                    </div>
                  ))}
                  {groups.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', py: '20px', color: 'var(--text-3)', fontSize: '0.85rem' }}>Aucun groupe configuré pour l'instant.</div>}
                </div>
              </div>
            </>
          ) : (
            <div className="page-card" style={{ padding: '60px', textAlign: 'center' }}>
               <Layers size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
               <p style={{ color: 'var(--text-3)' }}>Veuillez sélectionner une filière dans la liste pour voir les détails.</p>
            </div>
          )}
        </div>
      </div>

      {/* Filiere Side Panel */}
      <div className={`side-panel-overlay ${showFilierePanel ? 'open' : ''}`} onClick={() => setShowFilierePanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingFiliere ? 'Éditer la Filière' : 'Nouvelle Filière'}</h3>
            <button className="modal-close" onClick={() => setShowFilierePanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
            <form id="filiereForm" onSubmit={handleSubmitFiliere} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Code Court (ex: GI, LSI)</label>
                <input type="text" className="form-control" value={filiereData.code} onChange={(e) => setFiliereData({...filiereData, code: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nom Complet</label>
                <input type="text" className="form-control" value={filiereData.name} onChange={(e) => setFiliereData({...filiereData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Niveau d'études</label>
                <select className="form-control" value={filiereData.level} onChange={(e) => setFiliereData({...filiereData, level: e.target.value})}>
                  <option value="Licence">Licence</option>
                  <option value="Master">Master</option>
                  <option value="Cycle d'Ingénieur">Cycle d'Ingénieur</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre de Semestres</label>
                <input type="number" className="form-control" value={filiereData.semesters} onChange={(e) => setFiliereData({...filiereData, semesters: e.target.value})} />
              </div>
            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowFilierePanel(false)}>Annuler</button>
            <button type="submit" form="filiereForm" className="btn btn-primary">Enregistrer</button>
          </div>
        </div>
      </div>

      {/* Group Side Panel */}
      <div className={`side-panel-overlay ${showGroupPanel ? 'open' : ''}`} onClick={() => setShowGroupPanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">Ajouter un Groupe</h3>
            <button className="modal-close" onClick={() => setShowGroupPanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
            <form id="groupForm" onSubmit={handleSubmitGroup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nom du Groupe (ex: G1, TP-B)</label>
                <input type="text" className="form-control" value={groupData.name} onChange={(e) => setGroupData({...groupData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={groupData.type} onChange={(e) => setGroupData({...groupData, type: e.target.value})}>
                  <option value="TD">TD (Travaux Dirigés)</option>
                  <option value="TP">TP (Travaux Pratiques)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacité Théorique</label>
                <input type="number" className="form-control" value={groupData.capacity} onChange={(e) => setGroupData({...groupData, capacity: e.target.value})} />
              </div>
            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowGroupPanel(false)}>Annuler</button>
            <button type="submit" form="groupForm" className="btn btn-primary">Créer le groupe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFilieres;
