const express = require('express');
const cors = require('cors');

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const messageRoutes = require('./routes/messageRoutes');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const pollRoutes = require('./routes/pollRoutes');

const app = express();


// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());



app.use('/messagewall/api/auth', authRoutes);
app.use('/messagewall/api/events', eventRoutes);
app.use('/messagewall/api/messages', messageRoutes);
app.use('/messagewall/api/users', userRoutes);
app.use('/messagewall/api/polls', pollRoutes);

// Serve static files in uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
