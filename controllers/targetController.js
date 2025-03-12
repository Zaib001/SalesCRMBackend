// controllers/targetController.js
const Target = require('../models/Target');
const User = require('../models/User');
const Team = require('../models/Team');

exports.addTarget = async (req, res) => {
    try {
        const { assignedTo, targetAmount, targetQty, month, year } = req.body;

        const isUser = await User.findById(assignedTo);
        const isTeam = await Team.findById(assignedTo).populate('members');

        if (!isUser && !isTeam) {
            return res.status(400).json({ msg: 'Invalid assignedTo ID' });
        }

        let targetsToCreate = [];

        if (isUser) {
            // If an individual user is assigned
            targetsToCreate.push({
                assignedTo,
                assignedToModel: 'User',
                targetAmount,
                targetQty,
                month,
                year,
            });
        } else if (isTeam) {
            // If a team is assigned, assign the target to all team members
            targetsToCreate = isTeam.members.map(member => ({
                assignedTo: member._id,
                assignedToModel: 'User', // Save as individual targets for each team member
                targetAmount,
                targetQty,
                month,
                year,
            }));
        }

        const newTargets = await Target.insertMany(targetsToCreate);
        res.status(201).json(newTargets);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to create target', error: err.message });
    }
};




exports.getTargets = async (req, res) => {
    try {
        const targets = await Target.find()
            .populate({
                path: 'assignedTo',
                select: 'name teamName', // Populate both name & teamName
                strictPopulate: false,  // Allow flexible population
            });

        res.status(200).json(targets);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to retrieve targets', error: err.message });
    }
};


exports.getEmployeeTargets = async (req, res) => {
    try {
        const employeeId = req.user.id; // Get logged-in employee ID

        // Fetch targets where assignedTo is the logged-in employee
        const targets = await Target.find({ assignedTo: employeeId })
            .populate('assignedTo', 'name email')
            .populate({
                path: 'assignedTo',
                select: 'name teamName',
            });

        res.status(200).json(targets);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to retrieve employee targets', error: err.message });
    }
};



// Update Target
exports.updateTarget = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTarget = await Target.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedTarget);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to update target', error: err.message });
    }
};

// Delete Target
exports.deleteTarget = async (req, res) => {
    try {
        const { id } = req.params;
        await Target.findByIdAndDelete(id);
        res.status(200).json({ msg: 'Target deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to delete target', error: err.message });
    }
};
