const prisma = require('../prismaClient');

/**
 * @desc    Get all groups by filiere
 * @route   GET /api/groupes
 * @access  Private
 */
const getGroupes = async (req, res) => {
  const { idFiliere } = req.query;

  try {
    const groupes = await prisma.groupe.findMany({
      where: idFiliere ? { idFiliere: parseInt(idFiliere) } : {},
      include: {
        filiere: { select: { code: true, intitule: true } },
        _count: { select: { etudiantsTD: true, etudiantsTP: true } }
      }
    });

    res.json({
      status: 'success',
      data: groupes
    });
  } catch (error) {
    console.error('getGroupes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create a new group
 * @route   POST /api/groupes
 * @access  Private/Admin
 */
const createGroupe = async (req, res) => {
  const { idFiliere, type, capaciteMax } = req.body;

  try {
    const groupe = await prisma.groupe.create({
      data: {
        idFiliere: parseInt(idFiliere),
        type,
        capaciteMax: capaciteMax ? parseInt(capaciteMax) : undefined
      }
    });

    res.status(201).json({
      status: 'success',
      data: groupe
    });
  } catch (error) {
    console.error('createGroupe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a group
 * @route   DELETE /api/groupes/:id
 * @access  Private/Admin
 */
const deleteGroupe = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.groupe.delete({
      where: { idGroupe: parseInt(id) }
    });

    res.json({
      status: 'success',
      message: 'Group deleted'
    });
  } catch (error) {
    console.error('deleteGroupe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getGroupes,
  createGroupe,
  deleteGroupe
};
