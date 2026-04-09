import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, User, Clock, FileText } from 'lucide-react';

const AdminModules = () => {
  const { db, filiereName, teacherName, save, remove, nextId } = useData();
  const { success } = useToast();
  
  const [filiereFilter, setFiliereFilter] = useState('');
  const [semestreFilter, setSemestreFilter] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [formData, setFormData] = useState({
    code: '', title: '', filiereId: '', semester: 1, coeff: 3, teacherId: ''
  });

  const filteredModules = useMemo(() => {
    return db.modules.filter(m => {
      const matchesFiliere = filiereFilter ? m.filiereId === parseInt(filiereFilter) : true;
      const matchesSemestre = semestreFilter ? m.semester === parseInt(semestreFilter) : true;
      return matchesFiliere && matchesSemestre;
    });
  }, [db.modules, filiereFilter, semestreFilter]);

  const handleOpenAdd = () => {
    setEditingModule(null);
    setFormData({ code: '', title: '', filiereId: '', semester: 1, coeff: 3, teacherId: '' });
    setShowPanel(true);
  };

  const handleEdit = (m) => {
    setEditingModule(m);
    setFormData({ ...m });
    setShowPanel(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce module ?')) {
      remove('modules', id);
      success('Module supprimé');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { 
      ...formData, 
      id: editingModule ? editingModule.id : nextId('modules'),
      filiereId: parseInt(formData.filiereId),
      semester: parseInt(formData.semester),
      coeff: parseFloat(formData.coeff),
      teacherId: formData.teacherId ? parseInt(formData.teacherId) : null
    };
    save('modules', data);
    setShowPanel(false);
    success(editingModule ? 'Mis à jour' : 'Créé', 'Le catalogue des modules a été actualisé.');
  };

  return (
    <div className="page-area fade-in">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Modules & Programme</h2>
          <p className="page-hero-sub">Gestion des unités d'enseignement et affectations pédagogiques</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Nouveau Module
        </button>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', width: '200px' }}>
          <Filter size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <select 
            className="form-control"
            style={{ paddingLeft: '32px' }}
            value={filiereFilter}
            onChange={(e) => setFiliereFilter(e.target.value)}
          >
            <option value="">Toutes les filières</option>
            {db.filieres.map(f => <option key={f.id} value={f.id}>{f.code}</option>)}
          </select>
        </div>
        <select 
          className="form-control"
          style={{ width: '160px' }}
          value={semestreFilter}
          onChange={(e) => setSemestreFilter(e.target.value)}
        >
          <option value="">Tous semestres</option>
          {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semestre {s}</option>)}
        </select>
      </div>

      <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Module</th>
                <th>Filière</th>
                <th>Semestre</th>
                <th>Coeff</th>
                <th>Responsable</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModules.map(m => (
                <tr key={m.id}>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '6px', background: 'var(--surface-2)', borderRadius: '6px', color: 'var(--blue-mid)' }}>
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--blue-dark)', fontSize: '0.9rem' }}>{m.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: '700', fontFamily: 'monospace' }}>{m.code}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{filiereName(m.filiereId)}</span></td>
                  <td><span style={{ fontWeight: '700', color: 'var(--text-2)' }}>S{m.semester}</span></td>
                  <td><div style={{ fontWeight: '800', color: 'var(--blue-mid)' }}>{m.coeff}</div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={12} color="var(--text-3)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-2)' }}>{teacherName(m.teacherId)}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(m)}><Edit size={16} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(m.id)}><Trash2 size={16} color="var(--danger)" /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingModule ? 'Modifier le Module' : 'Nouveau Module'}</h3>
            <button className="modal-close" onClick={() => setShowPanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
            <form id="moduleForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Code Module *</label>
                    <input type="text" className="form-control" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} required placeholder="Ex: M102" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Coefficient</label>
                    <input type="number" step="0.5" className="form-control" value={formData.coeff} onChange={(e) => setFormData({...formData, coeff: e.target.value})} required />
                  </div>
               </div>

               <div className="form-group">
                 <label className="form-label">Intitulé du Module *</label>
                 <input type="text" className="form-control" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div className="form-group">
                    <label className="form-label">Filière *</label>
                    <select className="form-control" value={formData.filiereId} onChange={(e) => setFormData({...formData, filiereId: e.target.value})} required>
                      <option value="">Choisir...</option>
                      {db.filieres.map(f => <option key={f.id} value={f.id}>{f.code} - {f.name}</option>)}
                    </select>
                 </div>
                 <div className="form-group">
                    <label className="form-label">Semestre</label>
                    <select className="form-control" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                      {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semestre {s}</option>)}
                    </select>
                 </div>
               </div>

               <div className="form-group">
                 <label className="form-label">Enseignant Coordonnateur</label>
                 <select className="form-control" value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})}>
                    <option value="">Non assigné</option>
                    {db.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                 </select>
               </div>
            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            <button type="submit" form="moduleForm" className="btn btn-primary">Enregistrer Module</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModules;
