require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const messageRoutes = require('./routes/messageRoutes');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const pollRoutes = require('./routes/pollRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Set io object in app.locals to be accessible in routes
app.locals.io = io;

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);

// Serve static files in uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Add this new code for handling active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join event', (eventId) => {
    socket.join(eventId);
    
    if (!activeUsers.has(eventId)) {
      activeUsers.set(eventId, new Set());
    }
    activeUsers.get(eventId).add(socket.id);
    
    io.to(eventId).emit('user count', activeUsers.get(eventId).size);
    console.log(`Client joined event: ${eventId}. Active users: ${activeUsers.get(eventId).size}`);
  });

  socket.on('leave event', (eventId) => {
    if (activeUsers.has(eventId)) {
      activeUsers.get(eventId).delete(socket.id);
      io.to(eventId).emit('user count', activeUsers.get(eventId).size);
      console.log(`Client left event: ${eventId}. Active users: ${activeUsers.get(eventId).size}`);
    }
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (activeUsers.has(room)) {
        activeUsers.get(room).delete(socket.id);
        io.to(room).emit('user count', activeUsers.get(room).size);
        console.log(`Client disconnected from event: ${room}. Active users: ${activeUsers.get(room).size}`);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('new poll', (poll) => {
    io.to(poll.event.toString()).emit('new poll', poll);
  });

  socket.on('poll update', (poll) => {
    io.to(poll.event.toString()).emit('poll update', poll);
  });

  socket.on('poll ended', (poll) => {
    io.to(poll.event.toString()).emit('poll ended', poll);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server };