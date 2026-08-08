const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// In-memory fallback store
const mockUsers = [
  {
    id: 'user_demo_123',
    name: 'Nihaarika',
    email: 'nihaarika@college.edu',
    passwordHash: bcrypt.hashSync('password123', 10),
    course: 'B.Tech Computer Science',
    semester: 6,
    avatar: '🌿'
  }
];

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    let existingUser = null;
    try {
      existingUser = await User.findOne({ email });
    } catch (dbErr) {
      existingUser = mockUsers.find(u => u.email === email);
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser = {
      name,
      email,
      password: hashedPassword,
      course: 'B.Tech Computer Science',
      semester: 6,
      avatar: '🌿'
    };

    try {
      const dbUser = new User(newUser);
      await dbUser.save();
      newUser.id = dbUser._id;
    } catch (dbErr) {
      newUser.id = `user_${Date.now()}`;
      mockUsers.push({ ...newUser, passwordHash: hashedPassword });
    }

    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        course: newUser.course,
        semester: newUser.semester,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    let user = null;
    let isMatch = false;

    try {
      user = await User.findOne({ email });
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    } catch (dbErr) {
      // Fallback
    }

    if (!user) {
      const mock = mockUsers.find(u => u.email === email);
      if (mock) {
        isMatch = await bcrypt.compare(password, mock.passwordHash);
        user = {
          id: mock.id,
          name: mock.name,
          email: mock.email,
          course: mock.course,
          semester: mock.semester,
          avatar: mock.avatar
        };
      }
    } else {
      user = {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        semester: user.semester,
        avatar: user.avatar
      };
    }

    if (!user || !isMatch) {
      return res.status(400).json({ message: 'Invalid email or password credentials' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    let user = null;
    try {
      user = await User.findById(req.user.id).select('-password');
    } catch (err) {
      // Fallback
    }

    if (!user) {
      const mock = mockUsers.find(u => u.id === req.user.id);
      if (mock) {
        user = {
          id: mock.id,
          name: mock.name,
          email: mock.email,
          course: mock.course,
          semester: mock.semester,
          avatar: mock.avatar
        };
      }
    }

    if (!user) {
      // Default return logged in payload
      user = {
        id: req.user.id,
        name: req.user.name || 'Nihaarika',
        email: req.user.email || 'nihaarika@college.edu',
        course: 'B.Tech Computer Science',
        semester: 6,
        avatar: '🌿'
      };
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

module.exports = { register, login, getMe };
