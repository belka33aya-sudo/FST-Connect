import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [db, setDb] = useState({
    users: [
      { id: 1, email: 'admin@dept.ma',    password: 'admin123', role: 'admin',   name: 'Dr. Hassan Benali',     linkedId: null },
      { id: 2, email: 'prof@dept.ma',     password: 'prof123',  role: 'teacher', name: 'Prof. Samira Idrissi',  linkedId: 1 },
      { id: 3, email: 'etudiant@dept.ma', password: 'etu123',   role: 'student', name: 'Youssef Ait Ahmed',     linkedId: 1, CNE: 'GL001' },
    ],
    filieres: [
      { id: 1, code: 'LSI',  name: 'Logiciels et Systèmes Intelligents', level: "Cycle d'Ingénieur", semesters: 6, duree: 3, coordinator: 1 },
      { id: 2, code: 'GI',   name: 'Génie Informatique',              level: "Cycle d'Ingénieur", semesters: 6, duree: 3, coordinator: 2 },
      { id: 3, code: 'AI',   name: 'Intelligence Artificielle',        level: 'Master',             semesters: 4, duree: 2, coordinator: 3 },
      { id: 4, code: 'CYBER',name: 'Cybersecurity',                    level: 'Master',             semesters: 4, duree: 2, coordinator: 4 },
      { id: 5, code: 'IDAI', name: 'Ingénierie des Données & IA',      level: 'Licence',            semesters: 2, duree: 1, coordinator: 1 },
      { id: 6, code: 'AD',   name: 'Analyse de Données',               level: 'Licence',            semesters: 2, duree: 1, coordinator: 2 },
    ],
    groups: [
      { id: 1, filiereId: 1, name: 'LSI-1', type: 'TD', capacity: 30 },
      { id: 2, filiereId: 1, name: 'LSI-2', type: 'TD', capacity: 30 },
      { id: 3, filiereId: 1, name: 'LSI-3', type: 'TD', capacity: 30 },
      { id: 4, filiereId: 2, name: 'GI-1',  type: 'TD', capacity: 30 },
      { id: 10,filiereId: 2, name: 'GI-2',  type: 'TD', capacity: 30 },
      { id: 11,filiereId: 2, name: 'GI-3',  type: 'TD', capacity: 30 },
      { id: 5, filiereId: 3, name: 'AI-M1', type: 'TD', capacity: 25 },
      { id: 6, filiereId: 3, name: 'AI-M2', type: 'TD', capacity: 25 },
      { id: 7, filiereId: 4, name: 'CYB-M1',type: 'TD', capacity: 25 },
      { id: 8, filiereId: 5, name: 'IDAI-G1',type: 'TD', capacity: 40 },
      { id: 9, filiereId: 6, name: 'AD-G1',  type: 'TD', capacity: 40 },
    ],
    teachers: [
      { id: 1, name: 'Prof. Samira Idrissi',   email: 'idrissi@dept.ma',  grade: 'PES', specialty: 'Génie Logiciel',             phone: '06-10-11-22-33', matricule: 'PES-101' },
      { id: 2, name: 'Dr. Khalid Moussaoui',   email: 'moussaoui@dept.ma', grade: 'PA',  specialty: 'Intelligence Artificielle',   phone: '06-10-22-33-44', matricule: 'PA-202' },
      { id: 3, name: 'M. Amine Tahiri',        email: 'tahiri@dept.ma',    grade: 'PA',  specialty: 'Réseaux & Sécurité',          phone: '06-10-33-44-55', matricule: 'PA-303' },
      { id: 4, name: 'Dr. Fatima Zerouali',    email: 'zerouali@dept.ma',  grade: 'PH',  specialty: 'Bases de Données',            phone: '06-10-44-55-66', matricule: 'PH-404' },
      { id: 5, name: 'M. Yassine Benmoussa',   email: 'benmoussa@dept.ma', grade: 'PA',  specialty: 'Algorithmique Avancée',       phone: '06-10-55-66-77', matricule: 'PA-505' },
      { id: 6, name: 'Prof. Karima Belkadi',   email: 'belkadi@dept.ma',   grade: 'PES', specialty: 'Data Science',                phone: '06-10-66-77-88', matricule: 'PES-606' },
      { id: 7, name: 'Dr. Omar El Fassi',      email: 'elfassi@dept.ma',   grade: 'PH',  specialty: 'Cryptographie',               phone: '06-10-77-88-99', matricule: 'PH-707' },
    ],
    students: [
      { id: 1,  name: 'Youssef Ait Ahmed',   CNE: 'GL001', email: 'y.aitahmed@etu.uae.ac.ma',   filiereId: 1, groupTDId: 1, statut: 'ACTIF',       anneeInscription: 3, birthdate: '2001-03-15', phone: '06-20-11-22-33' },
      { id: 2,  name: 'Nadia Ouazzani',      CNE: 'GL002', email: 'n.ouazzani@etu.uae.ac.ma',   filiereId: 1, groupTDId: 1, statut: 'ACTIF',       anneeInscription: 3, birthdate: '2001-07-20', phone: '06-20-11-22-34' },
      { id: 3,  name: 'Mehdi Alaoui',        CNE: 'GL003', email: 'm.alaoui@etu.uae.ac.ma',     filiereId: 1, groupTDId: 2, statut: 'REDOUBLANT',  anneeInscription: 2, birthdate: '2000-11-05', phone: '06-20-11-22-35' },
      { id: 4,  name: 'Sara Benkirane',      CNE: 'GL004', email: 's.benkirane@etu.uae.ac.ma',  filiereId: 1, groupTDId: 2, statut: 'ACTIF',       anneeInscription: 3, birthdate: '2001-01-28', phone: '06-20-11-22-36' },
      { id: 5,  name: 'Omar El Mansouri',    CNE: 'GL005', email: 'o.elmansouri@etu.uae.ac.ma', filiereId: 1, groupTDId: 1, statut: 'ACTIF',       anneeInscription: 3, birthdate: '2001-05-12', phone: '06-20-11-22-37' },
      { id: 6,  name: 'Imane Chourak',       CNE: 'IA001', email: 'i.chourak@etu.uae.ac.ma',   filiereId: 3, groupTDId: 5, statut: 'ACTIF',      anneeInscription: 2, birthdate: '2001-09-03', phone: '06-20-21-32-43' },
      { id: 7,  name: 'Hamza Belkadi',       CNE: 'IA002', email: 'h.belkadi@etu.uae.ac.ma',   filiereId: 3, groupTDId: 5, statut: 'ACTIF',      anneeInscription: 2, birthdate: '2001-02-17', phone: '06-20-21-32-44' },
      { id: 8,  name: 'Kenza El Idrissi',    CNE: 'IA003', email: 'k.elidrissi@etu.uae.ac.ma', filiereId: 3, groupTDId: 6, statut: 'ACTIF',     anneeInscription: 2, birthdate: '2001-06-22', phone: '06-20-21-32-45' },
      { id: 9,  name: 'Anas Sabri',          CNE: 'IA004', email: 'a.sabri@etu.uae.ac.ma',     filiereId: 2, groupTDId: 4, statut: 'ACTIF',       anneeInscription: 1, birthdate: '2000-12-10', phone: '06-20-21-32-46' },
      { id: 10, name: 'Rim Tazi',            CNE: 'IA005', email: 'r.tazi@etu.uae.ac.ma',      filiereId: 2, groupTDId: 4, statut: 'ACTIF',       anneeInscription: 2, birthdate: '2001-08-30', phone: '06-20-21-32-47' },
      { id: 11, name: 'Abdelilah Zouini',    CNE: 'RS001', email: 'a.zouini@etu.uae.ac.ma',    filiereId: 4, groupTDId: 7, statut: 'ACTIF',       anneeInscription: 2, birthdate: '2001-04-07', phone: '06-20-31-42-53' },
      { id: 12, name: 'Layla Hafidi',        CNE: 'RS002', email: 'l.hafidi@etu.uae.ac.ma',    filiereId: 4, groupTDId: 7, statut: 'ACTIF',       anneeInscription: 2, birthdate: '2001-10-14', phone: '06-20-31-42-54' },
      { id: 13, name: 'Soufiane Bakkali',    CNE: 'RS003', email: 's.bakkali@etu.uae.ac.ma',   filiereId: 1, groupTDId: 3, statut: 'DIPLOME',     anneeInscription: 2, birthdate: '2000-03-25', phone: '06-20-31-42-55' },
      { id: 14, name: 'Dounia Mahjoubi',     CNE: 'RS004', email: 'd.mahjoubi@etu.uae.ac.ma',  filiereId: 1, groupTDId: 3, statut: 'ACTIF',       anneeInscription: 2, birthdate: '2001-07-18', phone: '06-20-31-42-56' },
      { id: 15, name: 'Tariq El Ghazali',    CNE: 'RS005', email: 't.elghazali@etu.uae.ac.ma', filiereId: 2, groupTDId: 10,statut: 'ACTIF',       anneeInscription: 2, birthdate: '2001-11-02', phone: '06-20-31-42-57' },
      { id: 16, name: 'Sami Jalili',         CNE: 'GL006', email: 's.jalili@etu.uae.ac.ma',    filiereId: 1, groupTDId: 1, statut: 'ACTIF',       anneeInscription: 3, birthdate: '2001-02-10', phone: '06-20-11-22-38' },
      { id: 17, name: 'Salma Rachid',        CNE: 'GL007', email: 's.rachid@etu.uae.ac.ma',    filiereId: 1, groupTDId: 2, statut: 'REDOUBLANT',  anneeInscription: 2, birthdate: '2001-05-22', phone: '06-20-11-22-39' },
    ],
    modules: [
      { id: 1,  code: 'GL-S1-01', title: 'Génie Logiciel Avancé',           filiereId: 1, semester: 1, coeff: 3, teacherId: 1 },
      { id: 2,  code: 'GL-S1-02', title: 'Architecture Logicielle',          filiereId: 1, semester: 1, coeff: 3, teacherId: 4 },
      { id: 3,  code: 'GL-S2-01', title: 'Bases de Données Avancées',        filiereId: 1, semester: 2, coeff: 3, teacherId: 4 },
      { id: 4,  code: 'IA-S1-01', title: 'Machine Learning',                 filiereId: 3, semester: 1, coeff: 4, teacherId: 2 },
      { id: 5,  code: 'IA-S1-02', title: 'Deep Learning',                    filiereId: 3, semester: 1, coeff: 3, teacherId: 2 },
      { id: 6,  code: 'GI-S1-01', title: 'Systèmes d\'Exploitation',         filiereId: 2, semester: 1, coeff: 3, teacherId: 5 },
      { id: 7,  code: 'RS-S1-01', title: 'Sécurité des Réseaux',             filiereId: 4, semester: 1, coeff: 3, teacherId: 3 },
      { id: 8,  code: 'AD-S1-01', title: 'Big Data Fundamentals',            filiereId: 6, semester: 1, coeff: 3, teacherId: 6 },
    ],
    sessions: [
      { id: 1,  day: 1, startSlot: '08:00', endSlot: '09:30', moduleId: 1,  groupId: 1, teacherId: 1, roomId: 1, type: 'Cours', statut: 'PLANIFIEE' },
      { id: 2,  day: 1, startSlot: '09:45', endSlot: '11:15', moduleId: 2,  groupId: 1, teacherId: 4, roomId: 1, type: 'TD',    statut: 'PLANIFIEE' },
      { id: 3,  day: 2, startSlot: '13:30', endSlot: '15:00', moduleId: 4,  groupId: 5, teacherId: 2, roomId: 2, type: 'Cours', statut: 'PLANIFIEE' },
      { id: 4,  day: 3, startSlot: '15:15', endSlot: '16:45', moduleId: 7,  groupId: 7, teacherId: 3, roomId: 3, type: 'TD',    statut: 'PLANIFIEE' },
    ],
    absences: [
      { id: 1,  studentId: 3,  sessionId: 1,  date: '2026-03-24', statut: 'INJUSTIFIEE', justified: false },
      { id: 2,  studentId: 3,  sessionId: 2,  date: '2026-03-31', statut: 'INJUSTIFIEE', justified: false },
      { id: 3,  studentId: 3,  sessionId: 1,  date: '2026-04-07', statut: 'INJUSTIFIEE', justified: false },
      { id: 4,  studentId: 3,  sessionId: 2,  date: '2026-04-14', statut: 'INJUSTIFIEE', justified: false },
      { id: 5,  studentId: 17, sessionId: 1,  date: '2026-04-01', statut: 'INJUSTIFIEE', justified: false },
      { id: 6,  studentId: 17, sessionId: 2,  date: '2026-04-08', statut: 'INJUSTIFIEE', justified: false },
      { id: 7,  studentId: 17, sessionId: 1,  date: '2026-04-15', statut: 'INJUSTIFIEE', justified: false },
      { id: 8,  studentId: 5,  sessionId: 1,  date: '2026-04-10', statut: 'INJUSTIFIEE', justified: false },
      { id: 9,  studentId: 5,  sessionId: 2,  date: '2026-04-17', statut: 'INJUSTIFIEE', justified: false },
      { id: 10, studentId: 10, sessionId: 3,  date: '2026-04-10', statut: 'INJUSTIFIEE', justified: false },
    ],
    grades: [
      { id: 1, studentId: 1, moduleId: 1, exam: 14.5, cc: 15, final: 14.75 },
      { id: 2, studentId: 2, moduleId: 1, exam: 11, cc: 13, final: 11.8 },
      { id: 3, studentId: 3, moduleId: 1, exam: 8, cc: 10, final: 8.8 },
      { id: 4, studentId: 4, moduleId: 1, exam: 16, cc: 15.5, final: 15.8 },
      { id: 5, studentId: 1, moduleId: 2, exam: 13, cc: 14, final: 13.4 },
    ],
    announcements: [
      { id: 1, title: 'Réunion Pédagogique - Fin de Semestre', body: 'Tous les enseignants sont priés d\'assister à la réunion... ', target: 'Enseignants', urgente: true, createdAt: '2026-04-05T10:00:00', readBy: [] },
      { id: 2, title: 'Décalage des examens de rattrapage', body: 'Les examens sont décalés de 48h... ', target: 'Tous', urgente: false, createdAt: '2026-04-08T14:30:00', readBy: [] },
      { id: 3, title: 'Inscriptions Doctorat 2026', body: 'Ouverture des dossiers de candidature... ', target: 'Master', urgente: true, createdAt: '2026-04-01T09:00:00', readBy: [] },
    ],
    reclamations: [
      { id: 1, studentId: 3,  moduleId: 1, description: 'Note de CC non saisie correctement.', statut: 'SOUMISE' },
      { id: 2, studentId: 17, moduleId: 2, description: 'Contestage de l\'absence du 08/04.', statut: 'SOUMISE' },
      { id: 3, studentId: 5,  moduleId: 1, description: 'Erreur dans le calcul de la moyenne S1.', statut: 'SOUMISE' },
    ],
    pfes: [
      { id: 1, titre: 'Optimisation des Routages IoT', studentIds: [1], encadrantId: 3, statut: 'EN_COURS' },
      { id: 2, titre: 'IA pour Diagnostic Médical', studentIds: [6], encadrantId: 2, statut: 'EN_COURS' },
      { id: 3, titre: 'BlockChain & Smart Contracts', studentIds: [11], encadrantId: 7, statut: 'EN_COURS' },
      { id: 4, titre: 'Big Data analytics for Smart City', studentIds: [8], encadrantId: 6, statut: 'EN_COURS' },
    ],
    rooms: [
      { id: 1, name: 'Amphi A', type: 'Amphi' },
      { id: 2, name: 'Salle 01', type: 'Cours' },
      { id: 3, name: 'Labo Info 1', type: 'TP' },
    ],
    documents: [
      { id: 1, title: 'Emploi du Temps - Semestre 2 - S2', filiereId: 1, version: '1.2', status: 'PUBLIÉ', date: '2026-03-15', size: '1.2 MB', author: 'Bureau Scolarité' },
      { id: 2, title: 'Emploi du Temps - Semestre 4 - S4', filiereId: 1, version: '1.0', status: 'PUBLIÉ', date: '2026-03-10', size: '0.9 MB', author: 'Bureau Scolarité' },
      { id: 3, title: 'Emploi du Temps - Semestre 6 - S6', filiereId: 1, version: '2.1', status: 'PUBLIÉ', date: '2026-03-20', size: '1.1 MB', author: 'Bureau Scolarité' },
      { id: 4, title: 'Planning Examens - Session Printemps', filiereId: 1, version: '0.9', status: 'BROUILLON', date: '2026-04-01', size: '2.4 MB', author: 'Admin' },
      { id: 5, title: 'Emploi du Temps - GI - S2', filiereId: 2, status: 'PUBLIÉ', date: '2026-03-05', size: '1.5 MB', author: 'Bureau GI' },
      { id: 6, title: 'Emploi du Temps - AI - S2', filiereId: 3, status: 'PUBLIÉ', date: '2026-03-05', size: '1.4 MB', author: 'Bureau AI' },
    ]
  });

  const [counters, setCounters] = useState({
    users: 50, filieres: 10, groups: 20, teachers: 20, students: 100,
    modules: 50, rooms: 10, sessions: 100, announcements: 10,
    absences: 100, reclamations: 10, pfes: 10
  });

  const nextId = (col) => {
    const id = counters[col];
    setCounters(prev => ({ ...prev, [col]: id + 1 }));
    return id;
  };

  const getById = (col, id) => db[col]?.find(x => x.id === parseInt(id));

  const save = (col, item) => {
    setDb(prev => {
      const list = [...(prev[col] || [])];
      const idx = list.findIndex(x => x.id === item.id);
      if (idx >= 0) list[idx] = { ...item };
      else list.push({ ...item });
      return { ...prev, [col]: list };
    });
  };

  const remove = (col, id) => {
    setDb(prev => ({ ...prev, [col]: prev[col].filter(x => x.id !== id) }));
  };

  // Helpers
  const filiereName = (id) => getById('filieres', id)?.code || '—';
  const teacherName = (id) => getById('teachers', id)?.name || '—';
  const studentName = (id) => getById('students', id)?.name || '—';
  const moduleName = (id) => getById('modules', id)?.title || '—';
  const roomName = (id) => getById('rooms', id)?.name || '—';
  const groupName = (id) => getById('groups', id)?.name || '—';

  const unreadAnnouncements = (userId) => {
    return db.announcements.filter(a => !a.readBy?.includes(userId)).length;
  };

  const value = {
    db, nextId, save, remove, getById,
    filiereName, teacherName, studentName, moduleName, roomName, groupName,
    unreadAnnouncements
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
