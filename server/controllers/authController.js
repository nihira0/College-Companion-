const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const isDbReady = () => mongoose.connection && mongoose.connection.readyState === 1;

// Seed/Fallback Users for Dev & DB Disconnection
const mockUsers = [
  {
    id: 'user_demo_123',
    name: 'Nihaarika',
    email: 'nihaarika@college.edu',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'student',
    course: 'B.Tech Computer Science',
    semester: 6,
    avatar: '🌿'
  },
  {
    id: 'user_faculty_1',
    name: 'Dr. Anil Vasoya',
    email: 'faculty@college.edu',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'faculty',
    course: 'Database Systems',
    semester: 6,
    avatar: '👨‍🏫'
  },
  {
    id: 'user_admin_1',
    name: 'College Admin',
    email: 'admin@college.edu',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'admin',
    course: 'Administration',
    semester: 0,
    avatar: '⚙️'
  }
];

const sanitizeUser = (u) => ({
  id: u._id ? u._id.toString() : u.id,
  name: u.name,
  email: u.email,
  role: u.role || 'student',
  course: u.course || 'B.Tech Computer Science',
  semester: u.semester || 6,
  avatar: u.avatar || '🌿'
});

const isAllowedDomain = (email) => {
  const allowedStr = process.env.ALLOWED_EMAIL_DOMAINS;
  if (!allowedStr || !allowedStr.trim()) return true;
  const allowedList = allowedStr.split(',').map(d => d.trim().toLowerCase());
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return allowedList.some(d => domain === d || domain.endsWith('.' + d));
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Domain validation
    if (!isAllowedDomain(cleanEmail)) {
      return res.status(400).json({ 
        message: 'Registration is restricted to authorized college email domains (e.g. @college.edu)' 
      });
    }

    let existingUser = null;
    if (isDbReady()) {
      try {
        existingUser = await User.findOne({ email: cleanEmail });
      } catch (e) {}
    }
    if (!existingUser) {
      existingUser = mockUsers.find(u => u.email === cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Privileged role assignment from client is strictly IGNORED
    const role = 'student';

    let savedUser = null;
    if (isDbReady()) {
      try {
        const newUser = new User({
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          role,
          course: 'B.Tech Computer Science',
          semester: 6,
          avatar: '🌿'
        });
        await newUser.save();
        savedUser = newUser;
      } catch (dbErr) {}
    }

    if (!savedUser) {
      const mockNew = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        passwordHash: hashedPassword,
        role,
        course: 'B.Tech Computer Science',
        semester: 6,
        avatar: '🌿'
      };
      mockUsers.push(mockNew);
      savedUser = mockNew;
    }

    const safeProfile = sanitizeUser(savedUser);
    const token = jwt.sign(
      { id: safeProfile.id, name: safeProfile.name, email: safeProfile.email, role: safeProfile.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: safeProfile
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, keepLoggedIn } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let dbUser = null;
    let isMatch = false;

    if (isDbReady()) {
      try {
        dbUser = await User.findOne({ email: cleanEmail });
        if (dbUser) {
          isMatch = await bcrypt.compare(password, dbUser.password);
        }
      } catch (dbErr) {}
    }

    let authenticatedUser = null;
    if (dbUser && isMatch) {
      authenticatedUser = dbUser;
    } else {
      const mock = mockUsers.find(u => u.email === cleanEmail);
      if (mock && (await bcrypt.compare(password, mock.passwordHash))) {
        authenticatedUser = mock;
      }
    }

    if (!authenticatedUser) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const safeProfile = sanitizeUser(authenticatedUser);
    const expiresIn = keepLoggedIn ? '30d' : '1d';
    const token = jwt.sign(
      { id: safeProfile.id, name: safeProfile.name, email: safeProfile.email, role: safeProfile.role },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      token,
      user: safeProfile
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    let user = null;
    if (isDbReady()) {
      try {
        user = await User.findById(req.user.id).select('-password');
      } catch (err) {}
    }

    if (!user) {
      const mock = mockUsers.find(u => u.id === req.user.id);
      if (mock) {
        user = mock;
      }
    }

    if (!user && req.user.id) {
      user = {
        id: req.user.id,
        name: req.user.name || 'Student User',
        email: req.user.email || 'student@college.edu',
        role: req.user.role || 'student',
        course: 'B.Tech Computer Science',
        semester: 6,
        avatar: '🌿'
      };
    }

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

module.exports = { register, login, getMe };
