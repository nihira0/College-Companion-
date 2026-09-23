const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/academic', require('./routes/academicRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'College Companion Server is healthy 🌿' });
});

app.listen(PORT, () => {
  console.log(`🚀 College Companion Server listening on port ${PORT}`);
});
