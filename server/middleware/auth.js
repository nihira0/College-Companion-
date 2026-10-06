const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'college_companion_leafy_secret_key_2026';

const authMiddleware = (req, res, next) => {
  let token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Access denied.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired authentication session.' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required. Access denied.' });
    }

    const userRole = req.user.role || 'student';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }

    next();
  };
};

const optionalAuth = (req, res, next) => {
  let token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {}
  }

  if (!req.user) {
    req.user = {
      id: 'user_demo_123',
      name: 'Nihaarika',
      email: 'nihaarika@college.edu',
      role: 'student',
      divisionId: 'div_ita_1',
      rollNo: 'IT-A-042'
    };
  }

  next();
};

module.exports = { authMiddleware, optionalAuth, requireRole, JWT_SECRET };
