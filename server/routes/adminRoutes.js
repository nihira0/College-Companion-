const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole } = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
