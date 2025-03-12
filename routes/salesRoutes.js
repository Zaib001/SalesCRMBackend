// routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const {
    addSale, getSales, updateSale, deleteSale,getEmployeeMonthlyPerformance,
    getEmployeeSales, getEmployeePerformance,getSalesPerformanceByEmployee,getMonthlyPerformance, getMonthlyEmployeePerformance, getAllEmployeesMonthlyPerformance
} = require('../controllers/salesController');
const { protect, adminOnly, employeeOnly } = require('../middleware/authMiddleware');

router.post('/', protect, employeeOnly, addSale);

router.get('/', protect, adminOnly, getSales);


router.get('/my-sales', protect, employeeOnly, getEmployeeSales);

router.get('/my-performance', protect, employeeOnly, getEmployeePerformance);
router.get('/employee-performance/monthly', protect, getMonthlyEmployeePerformance);
router.get('/sales-performance/employees', protect, adminOnly, getSalesPerformanceByEmployee);
// router.get('/sales-performance/team', protect, adminOnly, getAllTeamsMonthlyPerformance);

router.get('/monthly-performance', protect, adminOnly, getMonthlyPerformance);
router.get('/employee-performance', protect,  getEmployeeMonthlyPerformance);

router.get('/all-employees-performance/monthly', protect, adminOnly, getAllEmployeesMonthlyPerformance);

router.put('/:id', protect, adminOnly, updateSale);

router.delete('/:id', protect, adminOnly, deleteSale);

module.exports = router;
