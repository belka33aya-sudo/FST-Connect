const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check for user
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      include: {
        etudiant: {
          include: {
            filiere: true,
            groupeTD: true,
            groupeTP: true
          }
        },
        enseignant: true,
        administrateur: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    // 4. Return user data (excluding password)
    const { motDePasse, ...userWithoutPassword } = user;
    
    res.json({
      status: 'success',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
      include: {
        etudiant: {
          include: {
            filiere: true,
            groupeTD: true,
            groupeTP: true
          }
        },
        enseignant: true,
        administrateur: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { motDePasse, ...userWithoutPassword } = user;
    res.json({
      status: 'success',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  getMe
};
