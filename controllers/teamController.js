// controllers/teamController.js
const Team = require('../models/Team');

// Create New Team
exports.createTeam = async (req, res) => {
    try {
        const { teamName, members, targetAmount } = req.body;

        const newTeam = await Team.create({ 
            teamName, 
            members, 
            targetAmount, 
            createdBy: req.user.id 
        });

        res.status(201).json(newTeam);
    } catch (err) {
        console.error('Failed to create team:', err.message);
        res.status(500).json({ msg: 'Failed to create team', error: err.message });
    }
};

// Get All Teams
exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members', 'name email') // Populate member details
            .populate('createdBy', 'name email'); // Populate createdBy details

        res.status(200).json(teams);
    } catch (err) {
        console.error('Failed to retrieve teams:', err.message);
        res.status(500).json({ msg: 'Failed to retrieve teams', error: err.message });
    }
};

// Update Team
exports.updateTeam = async (req, res) => {
    try {
        const { teamName, members, targetAmount } = req.body;
        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id, 
            { 
                teamName, 
                members,
                targetAmount 
            }, 
            { new: true }
        );
        if (!updatedTeam) {
            return res.status(404).json({ msg: 'Team not found' });
        }
        res.status(200).json(updatedTeam);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to update team', error: err.message });
    }
};

// Delete Team
exports.deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) {
            return res.status(404).json({ msg: 'Team not found' });
        }
        res.status(200).json({ msg: 'Team deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to delete team', error: err.message });
    }
};
