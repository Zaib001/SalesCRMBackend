// controllers/salesController.js
const Sales = require('../models/Sales');
const Client = require('../models/Client');
const Target = require('../models/Target');
const Team = require('../models/Team');
// Employee adds a new sale
exports.addSale = async (req, res) => {
    try {
        const { clientId, salesAmount, salesQty, sourcingCost, date } = req.body;
        const employeeId = req.user.id;
        // Fetch client name using clientId
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ msg: 'Client not found' });

        const sale = new Sales({
            clientId,
            employeeId,
            clientName: client.name, // ✅ Store clientName separately
            salesAmount,
            salesQty,
            sourcingCost,
            date,
        });

        await sale.save();
        res.status(201).json({ msg: 'Sale added successfully', sale });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to add sale', error: err.message });
    }
};

// Admin gets all sales
exports.getSales = async (req, res) => {
    try {
        const sales = await Sales.find().populate('employeeId', 'name email');
        res.status(200).json(sales);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to retrieve sales', error: err.message });
    }
};


exports.getEmployeeSales = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const sales = await Sales.find({ employeeId });
        res.status(200).json(sales);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to retrieve employee sales', error: err.message });
    }
};

// Employee updates their own sale
exports.updateSale = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await Sales.findById(id);

        if (!sale) {
            return res.status(404).json({ msg: 'Sale not found' });
        }



        const updatedSale = await Sales.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedSale);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to update sale', error: err.message });
    }
};

// Employee deletes their own sale
exports.deleteSale = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await Sales.findById(id);

        if (!sale) {
            return res.status(404).json({ msg: 'Sale not found' });
        }
        await Sales.findByIdAndDelete(id);
        res.status(200).json({ msg: 'Sale deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to delete sale', error: err.message });
    }
};

exports.getEmployeePerformance = async (req, res) => {
    try {
        const employeeId = req.user.id;

        const totalSales = await Sales.aggregate([
            {
                $match: { employeeId: new mongoose.Types.ObjectId(req.user.id) } // ✅ Convert to ObjectId
            },
            {
                $group: {
                    _id: null,
                    totalSalesAmount: { $sum: "$salesAmount" },
                    totalSalesQty: { $sum: "$salesQty" },
                }
            }
        ]);
        console.log(totalSales)
        res.status(200).json(totalSales.length > 0 ? totalSales[0] : { totalSalesAmount: 0, totalSalesQty: 0 });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to retrieve performance data', error: err.message });
    }
};


exports.getMonthlyEmployeePerformance = async (req, res) => {
    try {
        const employeeId = req.user.id;

        const salesReport = await Sales.aggregate([
            { $match: { employeeId: new mongoose.Types.ObjectId(employeeId) } }, // Filter by employee
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                    totalSalesAmount: { $sum: "$salesAmount" },
                    totalSalesQty: { $sum: "$salesQty" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        const targetReport = await Target.find({ employeeId }).select('targetAmount date');

        const formattedReport = salesReport.map((data) => {
            const targetData = targetReport.find(target =>
                new Date(target.date).getMonth() + 1 === data._id.month &&
                new Date(target.date).getFullYear() === data._id.year
            );

            const targetAmount = targetData ? targetData.targetAmount : 0;
            const performance = targetAmount ? ((data.totalSalesAmount / targetAmount) * 100).toFixed(2) : 0;

            return {
                month: data._id.month,
                year: data._id.year,
                totalSalesAmount: data.totalSalesAmount,
                totalSalesQty: data.totalSalesQty,
                targetAmount,
                performance: `${performance}%`
            };
        });
        console.log(formattedReport)
        res.status(200).json(formattedReport);
    } catch (error) {
        res.status(500).json({ msg: 'Failed to retrieve employee monthly performance', error: error.message });
    }
};


const mongoose = require("mongoose");

const User = require("../models/User");

exports.getAllEmployeesMonthlyPerformance = async (req, res) => {
    try {
        const salesReport = await Sales.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" },
                        employeeId: "$employeeId"
                    },
                    totalSalesAmount: { $sum: "$salesAmount" },
                    totalSalesQty: { $sum: "$salesQty" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        // Fetch target data
        const targetReport = await Target.find().select("assignedTo targetAmount targetQty month year");

        // Fetch employee names
        const employeeIds = salesReport.map(data => data._id.employeeId);
        const employees = await User.find({ _id: { $in: employeeIds } }).select("name");


        // Format the report correctly
        const formattedReport = salesReport.map((data) => {
            const salesEmployeeId = data._id.employeeId?.toString();

            // Find employee name
            const employee = employees.find(emp => emp._id.toString() === salesEmployeeId);
            const employeeName = employee ? employee.name : "Unknown Employee"; // Default if not found

            // Find target data
            const targetData = targetReport.find(target =>
                target.assignedTo?.toString() === salesEmployeeId &&
                target.month === data._id.month &&
                target.year === data._id.year
            );

            const targetAmount = targetData ? targetData.targetAmount : 0;
            const targetQty = targetData ? targetData.targetQty : 0;

            const performanceAmount = targetAmount ? ((data.totalSalesAmount / targetAmount) * 100).toFixed(2) : 0;
            const performanceQty = targetQty ? ((data.totalSalesQty / targetQty) * 100).toFixed(2) : 0;

            return {
                employeeName, 
                month: data._id.month,
                year: data._id.year,
                totalSalesAmount: data.totalSalesAmount,
                totalSalesQty: data.totalSalesQty,
                targetAmount,
                targetQty,
                performanceAmount: `${performanceAmount}%`,
                performanceQty: `${performanceQty}%`
            };
        });

        console.log("✅ Final Report:", formattedReport);
        res.status(200).json(formattedReport);
    } catch (error) {
        res.status(500).json({ msg: "Failed to retrieve all employees monthly performance", error: error.message });
    }
};

exports.getEmployeeMonthlyPerformance = async (req, res) => {
    try {
        const employeeId = req.user.id; 

        if (!employeeId) {
            return res.status(400).json({ msg: "Employee ID is required" });
        }

        // Fetch sales data for the given employee
        const salesReport = await Sales.aggregate([
            {
            $match: { employeeId: new mongoose.Types.ObjectId(employeeId) }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" },
                    },
                    totalSalesAmount: { $sum: "$salesAmount" },
                    totalSalesQty: { $sum: "$salesQty" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        // Fetch target data for the employee
        const targetReport = await Target.find({ assignedTo: employeeId }).select("targetAmount targetQty month year");

        // Fetch employee name
        const employee = await User.findById(employeeId).select("name");
        if (!employee) {
            return res.status(404).json({ msg: "Employee not found" });
        }

        // Format the report correctly
        const formattedReport = salesReport.map((data) => {
            const targetData = targetReport.find(target =>
                target.month === data._id.month && target.year === data._id.year
            );

            const targetAmount = targetData ? targetData.targetAmount : 0;
            const targetQty = targetData ? targetData.targetQty : 0;

            const performanceAmount = targetAmount ? ((data.totalSalesAmount / targetAmount) * 100).toFixed(2) : 0;
            const performanceQty = targetQty ? ((data.totalSalesQty / targetQty) * 100).toFixed(2) : 0;

            return {
                employeeName: employee.name,
                month: data._id.month,
                year: data._id.year,
                totalSalesAmount: data.totalSalesAmount,
                totalSalesQty: data.totalSalesQty,
                targetAmount,
                targetQty,
                performanceAmount: `${performanceAmount}%`,
                performanceQty: `${performanceQty}%`
            };
        });

        console.log(`✅ Performance Report for Employee (${employeeId}):`, formattedReport);
        res.status(200).json(formattedReport);
    } catch (error) {
        res.status(500).json({ msg: "Failed to retrieve employee monthly performance", error: error.message });
    }
};







exports.getSalesPerformanceByEmployee = async (req, res) => {
    try {
        const report = await Sales.aggregate([
            {
                $group: {
                    _id: "$employeeId",
                    totalSalesAmount: { $sum: "$salesAmount" },
                    totalSalesQty: { $sum: "$salesQty" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { employeeId: { $toObjectId: "$_id" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$employeeId"] } } },
                        { $project: { name: 1, email: 1 } }
                    ],
                    as: "employeeDetails"
                }
            },
            { $unwind: "$employeeDetails" },
            {
                $project: {
                    _id: 1,
                    employeeName: "$employeeDetails.name",
                    employeeEmail: "$employeeDetails.email",
                    totalSalesAmount: 1,
                    totalSalesQty: 1
                }
            }
        ]);

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ msg: 'Failed to fetch sales performance by employee', error: error.message });
    }
};
exports.getMonthlyPerformance = async (req, res) => {
    try {
        const report = await Sales.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                    totalSalesAmount: { $sum: "$salesAmount" },
                    totalSalesQty: { $sum: "$salesQty" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        const formattedReport = report.map((data) => ({
            month: data._id.month,
            year: data._id.year,
            totalSalesAmount: data.totalSalesAmount,
            totalSalesQty: data.totalSalesQty
        }));

        res.status(200).json(formattedReport);
    } catch (error) {
        res.status(500).json({ msg: 'Failed to generate monthly performance report', error: error.message });
    }
};