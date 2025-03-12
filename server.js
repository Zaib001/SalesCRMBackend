const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');

require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use('/api/clients', clientRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/targets', require('./routes/targetRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
