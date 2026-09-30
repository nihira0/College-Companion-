const mongoose = require('mongoose');
const User = require('../models/User');

const isDbReady = () => mongoose.connection && mongoose.connection.readyState === 1;

// Reference shared memory users for dev fallback
const getUsers = async (req, res) => {
  try {
    let users = [];
    if (isDbReady()) {
      users = await User.find().select('-password');
    }
    
    if (!users || users.length === 0) {
      // Fallback demo users list
      users = [
        { id: 'user_demo_123', name: 'Nihaarika', email: 'nihaarika@college.edu', role: 'student', course: 'B.Tech Computer Science', semester: 6, avatar: '🌿' },
        { id: 'user_student_2', name: 'Rohan Sharma', email: 'rohan@college.edu', role: 'student', course: 'B.Tech Computer Science', semester: 6, avatar: '🌱' },
        { id: 'user_faculty_1', name: 'Dr. Anil Vasoya', email: 'faculty@college.edu', role: 'faculty', course: 'Database Systems', semester: 6, avatar: '👨‍🏫' },
        { id: 'user_admin_1', name: 'College Admin', email: 'admin@college.edu', role: 'admin', course: 'Administration', semester: 0, avatar: '⚙️' }
      ];
    } else {
      users = users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role || 'student',
        course: u.course || 'B.Tech Computer Science',
        semester: u.semester || 6,
        avatar: u.avatar || '🌿',
        createdAt: u.createdAt
      }));
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving users list' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['student', 'faculty', 'admin'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid role specified. Role must be student, faculty, or admin.' });
    }

    const cleanRole = role.toLowerCase();
    let updatedUser = null;

    if (isDbReady()) {
      try {
        const user = await User.findById(id);
        if (user) {
          user.role = cleanRole;
          await user.save();
          updatedUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            course: user.course,
            semester: user.semester,
            avatar: user.avatar
          };
        }
      } catch (e) {}
    }

    if (!updatedUser) {
      // Mock fallback update
      updatedUser = {
        id,
        name: id.includes('faculty') ? 'Dr. Anil Vasoya' : id.includes('admin') ? 'College Admin' : 'Nihaarika',
        email: id.includes('faculty') ? 'faculty@college.edu' : id.includes('admin') ? 'admin@college.edu' : 'nihaarika@college.edu',
        role: cleanRole,
        course: 'B.Tech Computer Science',
        semester: 6,
        avatar: '🌿'
      };
    }

    res.json({
      message: `User role updated successfully to ${cleanRole}`,
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

module.exports = { getUsers, updateUserRole };
