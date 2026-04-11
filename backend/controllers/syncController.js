const prisma = require('../prismaClient');

/**
 * Normalizes entity objects by adding a generic 'id' property based on their primary key.
 * This version is safer and won't mangle complex types like Dates or Decimals.
 */
const normalizeData = (data) => {
  if (data === null || data === undefined) return data;

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item));
  }

  // Handle Plain Objects only
  if (typeof data === 'object' && (data.constructor === Object || !data.constructor)) {
    const normalized = { ...data };
    
    const pkPatterns = [
      'idSeance', 'idAbsence', 'idNote', 'idAnnonce', 'idClub', 'idSalle', 
      'idModule', 'idEtudiant', 'idEnseignant', 'idEDT', 'idAffectation', 
      'idDocument', 'idExamen', 'idReclamation', 'idResultat', 'idPG', 
      'idStage', 'idJury', 'idFormation', 'idCollaborateur', 'idInscription', 
      'idNotification', 'idDashboard', 'idJustificatif',
      'idSemestre', 'idGroupe', 'idFiliere' 
    ];

    if (normalized.id === undefined) {
      for (const pk of pkPatterns) {
        if (normalized[pk] !== undefined) {
          normalized.id = normalized[pk];
          break;
        }
      }
    }

    // Recursively normalize properties
    for (const key in normalized) {
      normalized[key] = normalizeData(normalized[key]);
    }

    return normalized;
  }

  return data;
};

/**
 * @desc    Get complete application state (Big Sync)
 * @route   GET /api/sync
 * @access  Private
 */
const getFullState = async (req, res) => {
  const { id, role } = req.user;

  try {
    // Basic shared data (Filieres, Groupes, Salles, Modules)
    const baseQueries = {
      filieres: prisma.filiere.findMany(),
      groupes: prisma.groupe.findMany(),
      salles: prisma.salle.findMany(),
      modules: prisma.module.findMany(),
      utilisateurs: prisma.utilisateur.findMany({
        select: { id: true, nom: true, prenom: true, email: true, role: true, photo: true, statut: true }
      }),
      annonces: prisma.annonce.findMany({ where: { statut: 'PUBLIEE' } }),
      reclamations: prisma.reclamation.findMany({ include: { note: true } }),
      documents: prisma.document.findMany()
    };

    let resultData = {};

    if (role === 'admin') {
      const [filieres, groupes, salles, modules, utilisateurs, annonces, reclamations, documents, etudiants, enseignants, seances, absences, notes, pfes, juries, stages, edts] = await Promise.all([
        baseQueries.filieres,
        baseQueries.groupes,
        baseQueries.salles,
        baseQueries.modules,
        baseQueries.utilisateurs,
        baseQueries.annonces,
        baseQueries.reclamations,
        baseQueries.documents,
        prisma.etudiant.findMany(),
        prisma.enseignant.findMany(),
        prisma.seance.findMany(),
        prisma.absence.findMany(),
        prisma.note.findMany(),
        prisma.pfe.findMany(),
        prisma.jury.findMany({ include: { membresEnseignants: { include: { utilisateur: true } }, pfes: true } }),
        prisma.stage.findMany({ include: { etudiant: true } }),
        prisma.edt.findMany()
      ]);

      resultData = { filieres, groupes, salles, modules, utilisateurs, annonces, reclamations, documents, etudiants, enseignants, seances, absences, notes, pfes, juries, stages, edts };
    } 
    else if (role === 'teacher') {
      const teacher = await prisma.enseignant.findUnique({ where: { utilisateurId: id } });
      const teacherId = teacher?.idEnseignant;

      const [filieres, groupes, salles, modules, utilisateurs, annonces, documents, seances, pfes, juries, affectations] = await Promise.all([
        baseQueries.filieres,
        baseQueries.groupes,
        baseQueries.salles,
        baseQueries.modules,
        baseQueries.utilisateurs,
        baseQueries.annonces,
        baseQueries.documents,
        prisma.seance.findMany({ where: { idEnseignant: teacherId } }),
        prisma.pfe.findMany({ where: { idEncadrant: teacherId } }),
        prisma.jury.findMany({ 
          where: { membresEnseignants: { some: { idEnseignant: teacherId } } },
          include: { membresEnseignants: { include: { utilisateur: true } }, pfes: true }
        }),
        prisma.affectation.findMany({ where: { idEnseignant: teacherId } })
      ]);

      const moduleIds = [...new Set([...seances.map(s => s.idModule), ...affectations.map(a => a.idModule)])];
      const affectedModules = await prisma.module.findMany({
        where: { idModule: { in: moduleIds } },
        select: { idFiliere: true }
      });
      const filiereIds = [...new Set(affectedModules.map(m => m.idFiliere).filter(id => id !== null))];

      const students = await prisma.etudiant.findMany({
        where: { 
          OR: [
            { idGroupeTD: { in: [...new Set(seances.map(s => s.idGroupe))] } }, 
            { idGroupeTP: { in: [...new Set(seances.map(s => s.idGroupe))] } },
            { idFiliere: { in: filiereIds } }
          ] 
        }
      });
      const [notes, absences, reclamations] = await Promise.all([
        prisma.note.findMany({ where: { idModule: { in: moduleIds } } }),
        prisma.absence.findMany({ where: { idSeance: { in: seances.map(s => s.idSeance) } } }),
        prisma.reclamation.findMany({ where: { note: { idModule: { in: moduleIds } } }, include: { note: true } })
      ]);

      resultData = { filieres, groupes, salles, modules, utilisateurs, annonces, documents, seances, etudiants: students, pfes, notes, absences, juries, reclamations, affectations };
    }
    else if (role === 'student') {
      const etudiant = await prisma.etudiant.findUnique({ where: { utilisateurId: id } });
      const etudiantId = etudiant?.idEtudiant;

      const [filieres, groupes, salles, modules, utilisateurs, annonces, documents, seances, notes, absences, pfes, juries, stages, reclamations] = await Promise.all([
        baseQueries.filieres,
        baseQueries.groupes,
        baseQueries.salles,
        baseQueries.modules,
        baseQueries.utilisateurs,
        baseQueries.annonces,
        baseQueries.documents,
        prisma.seance.findMany({ where: { idGroupe: etudiant.idGroupeTD || etudiant.idGroupeTP } }),
        prisma.note.findMany({ where: { idEtudiant: etudiantId } }),
        prisma.absence.findMany({ where: { idEtudiant: etudiantId } }),
        prisma.pfe.findMany({ where: { idEtudiant: etudiantId } }),
        prisma.jury.findMany({ 
          where: { pfes: { some: { idEtudiant: etudiantId } } },
          include: { membresEnseignants: { include: { utilisateur: true } } }
        }),
        prisma.stage.findMany({ where: { idEtudiant: etudiantId } }),
        prisma.reclamation.findMany({ where: { note: { idEtudiant: etudiantId } }, include: { note: true } })
      ]);

      resultData = { filieres, groupes, salles, modules, utilisateurs, annonces, documents, seances, etudiants: [etudiant], notes, absences, pfes, juries, stages, reclamations };
    }

    res.json({
      status: 'success',
      data: normalizeData(resultData)
    });

  } catch (error) {
    console.error('getFullState error:', error);
    res.status(500).json({ message: 'Server error during sync' });
  }
};

module.exports = { getFullState, normalizeData };
