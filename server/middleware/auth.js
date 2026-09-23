const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'college_companion_super_secret_key_2026';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    req.user = { id: 'user_demo_123', name: 'Nihaarika', email: 'nihaarika@college.edu' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Graceful fallback for demo tokens in client state
    req.user = { id: 'user_demo_123', name: 'Nihaarika', email: 'nihaarika@college.edu' };
    next();
  }
};

module.exports = { authMiddleware, JWT_SECRET };

