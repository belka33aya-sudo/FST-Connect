const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all students with user profiles
 * @route   GET /api/etudiants
 * @access  Private
 */
const getEtudiants = async (req, res) => {
  try {
    const etudiants = await prisma.etudiant.findMany({
      include: {
        utilisateur: {
          select: { nom: true, prenom: true, email: true, role: true, statut: true }
        },
        filiere: true,
        groupeTD: true,
        groupeTP: true
      }
    });

    res.json({
      status: 'success',
      data: etudiants
    });
  } catch (error) {
    console.error('getEtudiants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Smart Enrollment (Create User + Etudiant)
 * @route   POST /api/etudiants
 * @access  Private/Admin
 */
const createEtudiant = async (req, res) => {
  const { nom, prenom, email, cne, idFiliere, idGroupeTD, idGroupeTP, anneeInscription, password } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const hashedPassword = await bcrypt.hash(password || 'student123', 10);
      const user = await tx.utilisateur.create({
        data: {
          nom,
          prenom,
          email,
          motDePasse: hashedPassword,
          role: 'student'
        }
      });

      // 2. Create Etudiant
      const etudiant = await tx.etudiant.create({
        data: {
          utilisateurId: user.id,
          cne,
          idFiliere: idFiliere ? parseInt(idFiliere) : undefined,
          idGroupeTD: idGroupeTD ? parseInt(idGroupeTD) : undefined,
          idGroupeTP: idGroupeTP ? parseInt(idGroupeTP) : undefined,
          statut: 'ACTIF'
        }
      });

      // 3. Init Absence Counter
      await tx.compteurAbsence.create({
        data: { idEtudiant: etudiant.idEtudiant, totalHeuresAbsence: 0 }
      });

      return { user, etudiant };
    });

    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Conflict: Email or CNE already exists' });
    }
    console.error('createEtudiant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update Student Profile & User data
 * @route   PATCH /api/etudiants/:id
 * @access  Private/Admin
 */
const updateEtudiant = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, cne, idFiliere, idGroupeTD, idGroupeTP, statut } = req.body;

  try {
    const etudiant = await prisma.etudiant.findUnique({ where: { idEtudiant: parseInt(id) } });
    if (!etudiant) return res.status(404).json({ message: 'Student not found' });

    const result = await prisma.$transaction(async (tx) => {
      // Update User
      await tx.utilisateur.update({
        where: { id: etudiant.utilisateurId },
        data: { nom, prenom, email }
      });

      // Update Etudiant
      const updatedEtudiant = await tx.etudiant.update({
        where: { idEtudiant: parseInt(id) },
        data: {
          cne,
          idFiliere: idFiliere ? parseInt(idFiliere) : undefined,
          idGroupeTD: idGroupeTD ? parseInt(idGroupeTD) : undefined,
          idGroupeTP: idGroupeTP ? parseInt(idGroupeTP) : undefined,
          statut
        }
      });

      return updatedEtudiant;
    });

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('updateEtudiant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEtudiant = async (req, res) => {
  const { id } = req.params;

  try {
    const etudiant = await prisma.etudiant.findUnique({ where: { idEtudiant: parseInt(id) } });
    if (!etudiant) return res.status(404).json({ message: 'Student not found' });

    await prisma.$transaction(async (tx) => {
      // Delete associated data first
      await tx.compteurAbsence.deleteMany({ where: { idEtudiant: parseInt(id) } });
      await tx.note.deleteMany({ where: { idEtudiant: parseInt(id) } });
      await tx.absence.deleteMany({ where: { idEtudiant: parseInt(id) } });
      
      // Delete Etudiant
      await tx.etudiant.delete({ where: { idEtudiant: parseInt(id) } });
      
      // Delete User
      await tx.utilisateur.delete({ where: { id: etudiant.utilisateurId } });
    });

    res.json({
      status: 'success',
      message: 'Student and associated user deleted'
    });
  } catch (error) {
    console.error('deleteEtudiant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEtudiants,
  createEtudiant,
  updateEtudiant,
  deleteEtudiant
};
