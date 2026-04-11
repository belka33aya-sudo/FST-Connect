import React, { createContext, useContext, useState, useMemo } from 'react';
import api from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [db, setDb] = useState({
    utilisateurs: [], administrateurs: [],
    etudiants: [], enseignants: [], filieres: [], groupes: [], clubs: [],
    modules: [], affectations: [], documents: [], semestres: [],
    edts: [], seances: [], salles: [],
    absences: [], notes: [], reclamations: [], pfes: [], annonces: [], stages: []
  });

  const [loading, setLoading] = useState(true);

  const fetchSync = async () => {
    try {
      const token = localStorage.getItem('gdi_token');
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await api('/sync');
        if (data.status === 'success' && data.data) {
          // Merge with initial state to ensure all keys exist
          setDb(prev => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        console.error("Failed to sync data", err);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSync();
  }, []);

  const legacyDb = useMemo(() => new Proxy(db, {
    get: (target, prop) => {
      if (prop === 'users') return target.utilisateurs || [];
      if (prop === 'students') return target.etudiants || [];
      if (prop === 'teachers') return target.enseignants || [];
      if (prop === 'sessions') return target.seances || [];
      if (prop === 'grades') return target.notes || [];
      if (prop === 'announcements') return target.annonces || [];
      if (prop === 'rooms') return target.salles || [];
      if (prop === 'groups') return target.groupes || [];
      
      const val = target[prop];
      if (val === undefined && [
        'utilisateurs', 'etudiants', 'enseignants', 'filieres', 'groupes', 'clubs',
        'modules', 'affectations', 'documents', 'semestres', 'edts', 'seances', 'salles',
        'absences', 'notes', 'reclamations', 'pfes', 'annonces', 'stages'
      ].includes(prop)) {
          return [];
      }
      return val;
    }
  }), [db]);

  const [counters, setCounters] = useState({
    utilisateurs: 5000, etudiants: 5000, enseignants: 5000, filieres: 5000,
    groupes: 5000, modules: 5000, seances: 5000, absences: 5000, notes: 5000,
    annonces: 5000, pfes: 5000, salles: 5000
  });

  const nextId = (col) => {
    const id = counters[col] || 5000;
    setCounters(prev => ({ ...prev, [col]: id + 1 }));
    return id;
  };

  const getById = (col, id) => {
    const list = legacyDb[col];
    if (!Array.isArray(list)) return null;
    return list.find(x => (x.id || x.idAnnonce || x.idEtudiant || x.idEnseignant || x.idModule) === parseInt(id));
  };

  const save = async (col, item) => {
    const actualCol = col === 'users' ? 'utilisateurs' : 
                      col === 'students' ? 'etudiants' : 
                      col === 'teachers' ? 'enseignants' : 
                      col === 'sessions' ? 'seances' : 
                      col === 'grades' ? 'notes' : 
                      col === 'announcements' ? 'annonces' : 
                      col === 'rooms' ? 'salles' : 
                      col === 'groups' ? 'groupes' : col;

    // Optimistic Update — add/update item locally immediately
    setDb(prev => {
      const list = [...(prev[actualCol] || [])];
      const targetId = item.id || item.idAnnonce || item.idEtudiant || item.idEnseignant || item.idModule || item.idDocument;
      const idx = list.findIndex(x => (x.id || x.idAnnonce || x.idEtudiant || x.idEnseignant || x.idModule || x.idDocument) === targetId);
      if (idx >= 0) list[idx] = { ...item };
      else list.push({ ...item });
      return { ...prev, [actualCol]: list };
    });

    try {
      if (actualCol === 'annonces') {
        const isNew = !item.idAnnonce && (!item.id || item.id > 1000);
        const endpoint = isNew ? '/annonces' : `/annonces/${item.idAnnonce || item.id}`;
        await api(endpoint, {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify({
            titre: item.titre || item.title,
            contenu: item.contenu || item.content,
            urgent: item.urgente !== undefined ? item.urgente : item.urgent,
            cible: item.cible || item.target,
            statut: item.statut || 'PUBLIEE'
          })
        });
      }
      else if (actualCol === 'etudiants') {
        const isNew = !item.idEtudiant && (!item.id || item.id > 1000);
        const endpoint = isNew ? '/etudiants' : `/etudiants/${item.idEtudiant || item.id}`;
        await api(endpoint, {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify(item)
        });
      }
      else if (actualCol === 'enseignants') {
        const isNew = !item.idEnseignant && (!item.id || item.id > 1000);
        const endpoint = isNew ? '/enseignants' : `/enseignants/${item.idEnseignant || item.id}`;
        await api(endpoint, {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify(item)
        });
      }
      else if (actualCol === 'modules') {
        const isNew = !item.idModule && (!item.id || item.id > 1000);
        const endpoint = isNew ? '/modules' : `/modules/${item.idModule || item.id}`;
        await api(endpoint, {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify(item)
        });
      }
      else if (actualCol === 'documents') {
        const isNew = !item.idDocument || item.idDocument > 1000000; // large = optimistic temp id
        if (isNew) {
          // POST and get the real DB record back, then replace the temp optimistic item
          const result = await api('/documents', {
            method: 'POST',
            body: JSON.stringify({
              titre: item.titre || item.title,
              type: item.type,
              cheminFichier: item.cheminFichier || item.fichier || item.filename || 'document.pdf',
              idModule: item.idModule || item.moduleId,
              idFiliere: item.idFiliere || item.filiereId
            })
          });
          // Replace the optimistic item with the real DB record (has correct idDocument)
          if (result?.data) {
            const serverDoc = result.data;
            const realDoc = {
              ...item,
              ...serverDoc,
              id: serverDoc.idDocument,
              idDocument: serverDoc.idDocument,
              idModule: serverDoc.idModule || item.idModule,
              moduleId: serverDoc.idModule || item.idModule,
              titre: serverDoc.titre || item.titre,
              type: serverDoc.type || item.type,
              fichier: serverDoc.cheminFichier || item.fichier,
              filename: serverDoc.cheminFichier || item.fichier,
            };
            setDb(prev => {
              // Remove the optimistic item, add the real one
              const list = (prev[actualCol] || []).filter(
                x => (x.id || x.idDocument) !== (item.id || item.idDocument)
              );
              list.push(realDoc);
              return { ...prev, [actualCol]: list };
            });
          }
          // Delay full sync so DB write has time to propagate
          setTimeout(() => fetchSync(), 1000);
          return; // Don't call fetchSync() immediately
        } else {
          await api(`/documents/${item.idDocument}`, {
            method: 'PATCH',
            body: JSON.stringify({
              titre: item.titre || item.title,
              type: item.type,
              cheminFichier: item.fichier || item.filename || 'document.pdf',
              idModule: item.idModule || item.moduleId,
            })
          });
        }
      }
      fetchSync();
    } catch (err) {
      console.error(`Failed to persist ${actualCol}:`, err);
      fetchSync();
    }
  };

  const remove = async (col, id) => {
    const actualCol = col === 'users' ? 'utilisateurs' : 
                      col === 'announcements' ? 'annonces' : 
                      col === 'students' ? 'etudiants' : 
                      col === 'teachers' ? 'enseignants' :
                      col === 'modules' ? 'modules' : col;

    setDb(prev => ({ 
      ...prev, 
      [actualCol]: (prev[actualCol] || []).filter(x => (x.id || x.idAnnonce || x.idEtudiant || x.idEnseignant || x.idModule || x.idDocument) !== id) 
    }));

    try {
      const endpointMap = {
        'annonces': '/annonces',
        'etudiants': '/etudiants',
        'enseignants': '/enseignants',
        'modules': '/modules',
        'documents': '/documents'
      };
      if (endpointMap[actualCol]) {
        await api(`${endpointMap[actualCol]}/${id}`, { method: 'DELETE' });
      }
      fetchSync();
    } catch (err) {
      console.error(`Failed to remove from ${actualCol}:`, err);
      fetchSync();
    }
  };

  // Helpers
  const filiereName = (id) => (db.filieres || []).find(f => (f.idFiliere || f.id) === parseInt(id))?.intitule || '—';
  const teacherName = (id) => {
    const ens = (db.enseignants || []).find(e => (e.idEnseignant || e.id) === parseInt(id));
    const user = (db.utilisateurs || []).find(u => u.id === ens?.utilisateurId);
    return user ? `${user.prenom} ${user.nom}` : (ens?.name || '—');
  };
  const studentName = (id) => {
    const etu = (db.etudiants || []).find(e => (e.idEtudiant || e.id) === parseInt(id));
    const user = (db.utilisateurs || []).find(u => u.id === etu?.utilisateurId);
    return user ? `${user.prenom} ${user.nom}` : (etu?.name || '—');
  };
  const moduleName = (id) => (db.modules || []).find(m => (m.idModule || m.id) === parseInt(id))?.intitule || '—';
  const roomName = (id) => (db.salles || []).find(r => (r.idSalle || r.id) === parseInt(id))?.nom || '—';
  const groupName = (id) => (db.groupes || []).find(g => (g.idGroupe || g.id) === parseInt(id))?.nom || '—';

  const unreadAnnouncements = (userId) => {
    return (db.annonces || []).filter(a => !a.readBy?.includes(userId)).length;
  };

  const getStudentByUserId = (userId) => (db.etudiants || []).find(s => s.utilisateurId === userId);
  const getTeacherByUserId = (userId) => (db.enseignants || []).find(t => t.utilisateurId === userId);

  const gradeAvg = (cc = 0, exam = 0, coeffCC = 0.4, coeffExam = 0.6) => {
    return (cc * coeffCC) + (exam * coeffExam);
  };

  const value = {
    db: legacyDb, loading, nextId, save, remove, getById,
    filiereName, teacherName, studentName, moduleName, roomName, groupName,
    unreadAnnouncements, getStudentByUserId, getTeacherByUserId, gradeAvg,
    fetchSync
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
