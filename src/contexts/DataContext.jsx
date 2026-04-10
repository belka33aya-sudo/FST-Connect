import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [db, setDb] = useState({
    // SS1 — AUTHENTIFICATION
    utilisateurs: [
      { id: 1, nom: 'Benali', prenom: 'Hassan', name: 'Dr. Hassan Benali', email: 'admin@dept.ma', motDePasse: 'admin123', password: 'admin123', role: 'admin', telephone: '06-00-00-00-00', statut: 'ACTIF', compteurTentatives: 0 },
      { id: 2, nom: 'Idrissi', prenom: 'Samira', name: 'Prof. Samira Idrissi', email: 'prof@dept.ma', motDePasse: 'prof123', password: 'prof123', role: 'teacher', telephone: '06-10-11-22-33', statut: 'ACTIF', compteurTentatives: 0 },
      { id: 3, nom: 'Ait Ahmed', prenom: 'Youssef', name: 'Youssef Ait Ahmed', email: 'etudiant@dept.ma', motDePasse: 'etu123', password: 'etu123', role: 'student', telephone: '06-20-11-22-33', statut: 'ACTIF', compteurTentatives: 0 },
    ],
    administrateurs: [
      { id: 1, utilisateurId: 1, matricule: 'ADM-001' }
    ],
    
    // SS2 — ACTEURS
    etudiants: [
      { id: 3, idEtudiant: 3, utilisateurId: 3, cne: 'GL001', CNE: 'GL001', idFiliere: 1, filiereId: 1, idGroupeTD: 1, groupTDId: 1, idGroupeTP: 1, groupTPId: 1, statut: 'ACTIF', name: 'Youssef Ait Ahmed' },
    ],
    enseignants: [
      { id: 2, idEnseignant: 2, utilisateurId: 2, matricule: 'PES-101', grade: 'PES', type: 'Titulaire', specialite: 'Génie Logiciel', specialty: 'Génie Logiciel', volumeHoraireBase: 12, statut: 'ACTIF', name: 'Prof. Samira Idrissi' }
    ],
    filieres: [
      { id: 1, idFiliere: 1, code: 'LSI', intitule: 'Logiciels et Systèmes Intelligents', name: 'Logiciels et Systèmes Intelligents', niveau: "Cycle d'Ingénieur", level: "Cycle d'Ingénieur", semestres: 6, semesters: 6, duree: 3, idCoordinateur: 2, coordinator: 2 },
      { id: 2, idFiliere: 2, code: 'GI', intitule: 'Génie Informatique', name: 'Génie Informatique', niveau: "Cycle d'Ingénieur", level: "Cycle d'Ingénieur", semestres: 6, semesters: 6, duree: 3, idCoordinateur: 2, coordinator: 2 },
    ],
    groupes: [
      { id: 1, idGroupe: 1, idFiliere: 1, filiereId: 1, type: 'TD', capaciteMax: 30, capacity: 30, name: 'LSI-1' },
      { id: 2, idGroupe: 2, idFiliere: 1, filiereId: 1, type: 'TP', capaciteMax: 15, capacity: 15, name: 'LSI-TP1' },
    ],
    clubs: [
      { id: 1, idClub: 1, nom: 'Club IT', name: 'Club IT', description: 'Club d\'informatique', statut: 'ACTIF', idResponsable: 3 }
    ],

    // SS3 — GESTION PEDAGOGIQUE
    modules: [
      { id: 1, idModule: 1, code: 'GL-S1-01', intitule: 'Génie Logiciel Avancé', title: 'Génie Logiciel Avancé', idFiliere: 1, filiereId: 1, coefficient: 3, coeff: 3, semestre: 'S1', semester: 1, teacherId: 2 },
      { id: 2, idModule: 2, code: 'GL-S1-02', intitule: 'Architecture Logicielle', title: 'Architecture Logicielle', idFiliere: 1, filiereId: 1, coefficient: 3, coeff: 3, semestre: 'S1', semester: 1, teacherId: 2 },
    ],
    affectations: [
      { id: 1, idAffectation: 1, idEnseignant: 2, idModule: 1, typeIntervention: 'Cours', heuresAssignees: 30 }
    ],
    documents: [
      { id: 1, idDocument: 1, titre: 'Support de cours GL', title: 'Support de cours GL', type: 'PDF', cheminFichier: '/docs/gl.pdf', dateUpload: '2026-03-15', idAuteur: 2, filiereId: 1, status: 'PUBLIÉ' }
    ],
    semestres: [
      { id: 1, idSemestre: 1, libelle: 'Automne 2025', estCloture: false },
    ],

    // SS4 — EDT & SALLES
    edts: [
      { id: 1, idEDT: 1, idFiliere: 1, idGroupe: 1, semestre: 'S1', statut: 'PUBLIE' }
    ],
    seances: [
      { id: 1, idSeance: 1, idEDT: 1, idSalle: 1, roomId: 1, type: 'Cours', jour: 'Lundi', day: 1, heureDebut: '08:00', startSlot: '08:00', heureFin: '10:00', endSlot: '10:00', statut: 'MAINTENUE', idModule: 1, moduleId: 1, idEnseignant: 2, teacherId: 2, idGroupe: 1, groupId: 1 },
    ],
    salles: [
      { id: 1, idSalle: 1, nom: 'Amphi A', name: 'Amphi A', capaciteMax: 200, type: 'Amphi', statut: 'DISPONIBLE' },
    ],

    // SS5 — ABSENCES
    absences: [
      { id: 1, idAbsence: 1, idEtudiant: 3, studentId: 3, idSeance: 1, sessionId: 1, dateSaisie: '2026-03-24', date: '2026-03-24', statut: 'INJUSTIFIEE', typeSeance: 'Cours', estExamen: false, justified: false },
    ],
    notes: [
      { id: 1, idNote: 1, idEtudiant: 3, studentId: 3, idModule: 1, moduleId: 1, valeurCC: 15, cc: 15, valeurEF: 14, exam: 14, moyenneModule: 14.5, final: 14.5, dateSaisie: '2026-06-20', estVerrouillee: false },
    ],
    reclamations: [
      { id: 1, idReclamation: 1, idEtudiant: 3, studentId: 3, idModule: 1, moduleId: 1, motif: 'Erreur saisie CC', description: 'Erreur saisie CC', reponseEnseignant: '', dateDepot: '2026-06-21', statut: 'SOUMISE' }
    ],
    pfes: [
      { id: 1, idPFE: 1, titre: 'IoT Security', title: 'IoT Security', description: 'Securing IoT devices', statut: 'EN_COURS', rapportDepose: false, noteFinale: null, avisEncadrant: '', dateSoutenance: '2026-07-01', idEtudiant: 3, studentIds: [3], idEncadrant: 2, encadrantId: 2 }
    ],
    annonces: [
      { id: 1, idAnnonce: 1, titre: 'Réunion', title: 'Réunion', contenu: 'Contenu...', body: 'Contenu...', dateCreation: '2026-04-05', createdAt: '2026-04-05', urgent: true, urgente: true, statut: 'PUBLIE', cible: 'Tous', target: 'Tous', idAdministrateur: 1, readBy: [] }
    ],
  });

  // Proxy the DB to handle legacy collection names
  const legacyDb = new Proxy(db, {
    get: (target, prop) => {
      if (prop === 'users') return target.utilisateurs;
      if (prop === 'students') return target.etudiants;
      if (prop === 'teachers') return target.enseignants;
      if (prop === 'sessions') return target.seances;
      if (prop === 'grades') return target.notes;
      if (prop === 'announcements') return target.annonces;
      if (prop === 'rooms') return target.salles;
      if (prop === 'groups') return target.groupes;
      return target[prop];
    }
  });

  const [counters, setCounters] = useState({
    utilisateurs: 100, etudiants: 100, enseignants: 100, filieres: 100,
    groupes: 100, modules: 100, seances: 100, absences: 100, notes: 100,
    annonces: 100, pfes: 100, salles: 100
  });

  const nextId = (col) => {
    const id = counters[col];
    setCounters(prev => ({ ...prev, [col]: id + 1 }));
    return id;
  };

  const getById = (col, id) => legacyDb[col]?.find(x => x.id === parseInt(id));

  const save = (col, item) => {
    setDb(prev => {
      const actualCol = col === 'users' ? 'utilisateurs' : 
                        col === 'students' ? 'etudiants' : 
                        col === 'teachers' ? 'enseignants' : 
                        col === 'sessions' ? 'seances' : 
                        col === 'grades' ? 'notes' : 
                        col === 'announcements' ? 'annonces' : 
                        col === 'rooms' ? 'salles' : 
                        col === 'groups' ? 'groupes' : col;
      
      const list = [...(prev[actualCol] || [])];
      const idx = list.findIndex(x => x.id === item.id);
      if (idx >= 0) list[idx] = { ...item };
      else list.push({ ...item });
      return { ...prev, [actualCol]: list };
    });
  };

  const remove = (col, id) => {
    const actualCol = col === 'users' ? 'utilisateurs' : col; // add others if needed
    setDb(prev => ({ ...prev, [actualCol]: prev[actualCol].filter(x => x.id !== id) }));
  };

  // Helpers
  const filiereName = (id) => getById('filieres', id)?.intitule || '—';
  const teacherName = (id) => {
    const ens = getById('enseignants', id);
    const user = db.utilisateurs.find(u => u.id === ens?.utilisateurId);
    return user ? `${user.prenom} ${user.nom}` : (ens?.name || '—');
  };
  const studentName = (id) => {
    const etu = getById('etudiants', id);
    const user = db.utilisateurs.find(u => u.id === etu?.utilisateurId);
    return user ? `${user.prenom} ${user.nom}` : (etu?.name || '—');
  };
  const moduleName = (id) => getById('modules', id)?.intitule || '—';
  const roomName = (id) => getById('salles', id)?.nom || '—';
  const groupName = (id) => getById('groupes', id)?.name || '—';

  const unreadAnnouncements = (userId) => {
    return (db.annonces || []).filter(a => !a.readBy?.includes(userId)).length;
  };

  const value = {
    db: legacyDb, nextId, save, remove, getById,
    filiereName, teacherName, studentName, moduleName, roomName, groupName,
    unreadAnnouncements
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
