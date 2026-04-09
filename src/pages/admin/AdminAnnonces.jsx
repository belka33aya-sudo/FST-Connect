import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { Bell, Plus, Search, Megaphone, Trash2, Edit, Calendar, User, Globe, Lock } from 'lucide-react';

const AdminAnnonces = () => {
  const { db, save, remove, nextId } = useData();
  const { success } = useToast();
  
  const [showPanel, setShowPanel] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', content: '', target: 'ALL', urgent: false, date: new Date().toISOString()
  });

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData({ title: '', content: '', target: 'ALL', urgent: false, date: new Date().toISOString() });
    setShowPanel(true);
  };

  const handleEdit = (a) => {
    setEditingAnnouncement(a);
    setFormData({ ...a });
    setShowPanel(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette annonce ?')) {
      remove('announcements', id);
      success('Annonce supprimée');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      id: editingAnnouncement ? editingAnnouncement.id : nextId('announcements')
    };
    save('announcements', data);
    setShowPanel(false);
    success(editingAnnouncement ? 'Mise à jour' : 'Publiée', 'L\'annonce est visible sur les tableaux de bord.');
  };

  return (
    <div className="page-area fade-in">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Communication & Annonces</h2>
          <p className="page-hero-sub">Diffusion d'informations officielles et alertes aux étudiants et enseignants</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Megaphone size={18} style={{ marginRight: '8px' }} /> Publier un Flash
        </button>
      </div>

      <div className="page-card animate-up">
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Annonce</th>
                <th>Cible</th>
                <th>Priorité</th>
                <th>Date Publication</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {db.announcements.map(a => (
                <tr key={a.id}>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--blue-dark)', fontSize: '0.95rem' }}>{a.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.content}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       {a.target === 'ALL' ? <Globe size={14} color="var(--blue-mid)" /> : <Lock size={14} color="var(--orange)" />}
                       <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{a.target === 'ALL' ? 'Tout le dépt' : a.target}</span>
                    </div>
                  </td>
                  <td>
                    {a.urgent ? (
                      <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Bell size={10} /> URGENT
                      </span>
                    ) : (
                      <span className="badge badge-gray">Normal</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Calendar size={12} /> {new Date(a.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(a)}><Edit size={16} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(a.id)}><Trash2 size={16} color="var(--danger)" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Panel */}
      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingAnnouncement ? 'Éditer l\'annonce' : 'Nouvelle Annonce'}</h3>
            <button className="modal-close" onClick={() => setShowPanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
            <form id="annonceForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Titre de l'annonce</label>
                <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Ex: Report de cours, Planning DS..." />
              </div>

              <div className="form-group">
                <label className="form-label">Contenu détaillé</label>
                <textarea className="form-control" style={{ height: '120px', padding: '12px' }} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
              </div>

              <div className="form-group">
                <label className="form-label">Public Cible</label>
                <select className="form-control" value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})}>
                  <option value="ALL">Tous (Étudiants & Enseignants)</option>
                  <option value="Étudiants">Étudiants uniquement</option>
                  <option value="Enseignants">Enseignants uniquement</option>
                  <option value="LSI">Filière LSI</option>
                  <option value="GI">Filière GI</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: formData.urgent ? '#fff1f2' : 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', transition: 'background 0.3s' }}>
                <input 
                  type="checkbox" 
                  id="urgent" 
                  checked={formData.urgent} 
                  onChange={e => setFormData({...formData, urgent: e.target.checked})} 
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="urgent" style={{ fontWeight: '700', fontSize: '0.9rem', color: formData.urgent ? 'var(--danger)' : 'var(--text-1)', cursor: 'pointer' }}>
                  Marquer comme URGENTE (Badge rouge & Notification)
                </label>
              </div>
            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            <button type="submit" form="annonceForm" className="btn btn-primary">Diffuser l'annonce</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnonces;
