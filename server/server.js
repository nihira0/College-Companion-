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
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'College Companion Server is healthy 🌿' });
});

// Serve Static React Frontend Build in Production / Render
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('⚠️ Error sending index.html:', err.message);
      if (!res.headersSent) {
        res.status(500).send('College Companion interface loading error. Please check server logs.');
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 College Companion Server listening on port ${PORT}`);
});
