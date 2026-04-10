import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const TeacherGrades = () => {
  const { db, save, nextId, gradeAvg } = useData();
  const { currentUser } = useAuth();
  const teacher = useMemo(() => db.enseignants.find(t => t.utilisateurId === currentUser.id), [db.enseignants, currentUser.id]);
  const teacherId = teacher?.id;

  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [editGrades, setEditGrades] = useState({});

  const myModules = useMemo(() =>
    db.modules.filter(m => (m.idEnseignant === teacherId || m.teacherId === teacherId)),
  [db.modules, teacherId]);

  const selectedModule = useMemo(() =>
    selectedModuleId ? myModules.find(m => m.id === parseInt(selectedModuleId)) : null,
  [myModules, selectedModuleId]);

  const studentsInModule = useMemo(() => {
    if (!selectedModule) return [];
    const filiereId = selectedModule.idFiliere || selectedModule.filiereId;
    return filiereId ? db.etudiants.filter(s => (s.idFiliere === filiereId || s.filiereId === filiereId)) : db.etudiants;
  }, [db.etudiants, selectedModule]);

  // Load initial grades from db to local state whenever module changes or db changes
  React.useEffect(() => {
    if (!selectedModule) {
      setEditGrades({});
      return;
    }
    const initGrades = {};
    studentsInModule.forEach(student => {
      const g = db.notes.find(x => (x.idEtudiant === student.id || x.studentId === student.id) && (x.idModule === selectedModule.id || x.moduleId === selectedModule.id));
      if (g) {
        initGrades[student.id] = { cc: g.valeurCC ?? g.cc ?? '', final: g.valeurEF ?? g.final ?? '', publiee: g.publiee };
      } else {
        initGrades[student.id] = { cc: '', final: '', publiee: false };
      }
    });
    setEditGrades(initGrades);
  }, [db.notes, selectedModule, studentsInModule]);

  const handleGradeChange = (studentId, field, value) => {
    // Only allow numbers
    let val = value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) return; // Prevent multiple decimal points
    if (parseFloat(val) > 20) val = '20';
    setEditGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
    }));
  };

  const handleSaveStudent = (studentId, publish = false) => {
    if (!selectedModule) return;
    const gRow = db.notes.find(x => (x.idEtudiant === studentId || x.studentId === studentId) && (x.idModule === selectedModule.id || x.moduleId === selectedModule.id));
    const lg = editGrades[studentId];
    
    // Parse valid numbers
    const ccVal = lg.cc !== '' ? parseFloat(lg.cc) : null;
    const finalVal = lg.final !== '' ? parseFloat(lg.final) : null;

    if (gRow) {
      save('notes', {
        ...gRow,
        valeurCC: ccVal,
        valeurEF: finalVal,
        cc: ccVal, // Keep legacy for now too
        final: finalVal, // Keep legacy for now too
        publiee: publish || gRow.publiee,
        edited: true,
        datePublication: publish ? new Date().toISOString() : gRow.datePublication
      });
    } else {
      save('notes', {
        id: nextId('notes'),
        idEtudiant: studentId,
        studentId: studentId,
        idModule: selectedModule.id,
        moduleId: selectedModule.id,
        valeurCC: ccVal,
        valeurEF: finalVal,
        cc: ccVal,
        final: finalVal,
        publiee: publish,
        edited: true,
        datePublication: publish ? new Date().toISOString() : null
      });
    }
  };

  const handlePublishAll = () => {
    if (!selectedModule) return;
    studentsInModule.forEach(student => {
      handleSaveStudent(student.id, true);
    });
  };

  return (
    <div className="page-area animate-up">
      <div className="page-hero">
        <div>
          <h1 className="page-hero-title">Notes et Examens</h1>
          <p className="page-hero-sub">Saisie et publication des notes pour vos modules</p>
        </div>
      </div>

      <div className="page-card">
        <div className="page-card-header">
          <h3 className="page-card-title">Sélection du Module</h3>
        </div>
        <div className="page-card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ minWidth: 260 }}
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
          >
            <option value="">-- Choisissez un module --</option>
            {myModules.map(m => (
              <option key={m.id} value={m.id}>{m.code} - {m.intitule || m.title}</option>
            ))}
          </select>
          {selectedModule && (
            <button className="btn btn-primary" onClick={handlePublishAll}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>
              </svg>
              Publier toutes les notes
            </button>
          )}
        </div>
      </div>

      {selectedModule ? (
        <div className="page-card">
          <div className="page-card-header">
            <h3 className="page-card-title">Étudiants Inscrits</h3>
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>CNE</th>
                  <th>Note CC (40%)</th>
                  <th>Note Finale (60%)</th>
                  <th>Moyenne</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentsInModule.length > 0 ? studentsInModule.map(student => {
                  const sGrade = editGrades[student.id] || { cc: '', final: '', publiee: false };
                  const gRecord = db.notes.find(x => (x.idEtudiant === student.id || x.studentId === student.id) && (x.idModule === selectedModule.id || x.moduleId === selectedModule.id));
                  
                  // Compute average visually
                  const ccVal = parseFloat(sGrade.cc);
                  const finalVal = parseFloat(sGrade.final);
                  let avg = '—';
                  if (!isNaN(ccVal) && !isNaN(finalVal)) {
                    avg = gradeAvg(ccVal, finalVal, selectedModule.coeffCC || 0.4, selectedModule.coeffEF || 0.6);
                  }

                  const isPublished = gRecord?.publiee;
                  const u = db.utilisateurs.find(user => user.id === student.utilisateurId);
                  const fullName = u ? `${u.prenom} ${u.nom}` : (student.name || '—');

                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 600, color: 'var(--blue-dark)' }}>{fullName}</td>
                      <td>{student.CNE}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          style={{ width: 80, height: 32, fontSize: '0.85rem' }}
                          value={sGrade.cc}
                          onChange={(e) => handleGradeChange(student.id, 'cc', e.target.value)}
                          disabled={isPublished}
                          placeholder=" /20"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          style={{ width: 80, height: 32, fontSize: '0.85rem' }}
                          value={sGrade.final}
                          onChange={(e) => handleGradeChange(student.id, 'final', e.target.value)}
                          disabled={isPublished}
                          placeholder=" /20"
                        />
                      </td>
                      <td>
                        <strong style={{ color: avg >= 10 ? 'var(--success)' : (avg !== '—' ? 'var(--danger)' : 'inherit') }}>
                          {avg}
                        </strong>
                      </td>
                      <td>
                        {isPublished ? (
                          <span className="badge badge-green">Publiée</span>
                        ) : (
                          <span className="badge badge-gray">Brouillon</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!isPublished && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleSaveStudent(student.id, false)}>
                              Sauvegarder
                            </button>
                            <button className="btn btn-outline-blue btn-sm" onClick={() => handleSaveStudent(student.id, true)}>
                              Publier
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" className="table-empty">
                      Aucun étudiant inscrit dans cette filière.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3>Aucun module sélectionné</h3>
          <p>Veuillez sélectionner un module dans la liste déroulante ci-dessus pour gérer les notes.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherGrades;
