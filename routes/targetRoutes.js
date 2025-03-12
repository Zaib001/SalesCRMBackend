// routes/targetRoutes.js
const express = require('express');
const router = express.Router();
const { addTarget, getTargets, updateTarget, deleteTarget,getEmployeeTargets } = require('../controllers/targetController');
const { validateTarget } = require('../validators/targetValidator');
const { protect, adminOnly, employeeOnly } = require('../middleware/authMiddleware');

// Admin creates a sales target
router.post('/', protect, adminOnly, validateTarget, addTarget);

// Admin views all targets
router.get('/', protect, adminOnly, getTargets);

// Employee views assigned targets
router.get('/my-targets', protect, employeeOnly, getEmployeeTargets);

// Admin updates a sales target
router.put('/:id', protect, adminOnly, validateTarget, updateTarget);

// Admin deletes a sales target
router.delete('/:id', protect, adminOnly, deleteTarget);

module.exports = router;
