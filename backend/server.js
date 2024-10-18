require('dotenv').config();
const socketIo = require('socket.io');
const app = require('./app');
const http = require('http');
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ["GET", "POST"]
  },
  path: process.env.SOCKET_IO_PATH || '/socket.io'
});

console.log('Socket.IO server initialized with path:', process.env.SOCKET_IO_PATH || '/socket.io');

// Set io object in app.locals to be accessible in routes
app.locals.io = io;

// Add this new code for handling active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('join event', (eventId) => {
    console.log(`Client ${socket.id} joined event: ${eventId}`);
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
    console.log('Client disconnected', socket.id);
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

  socket.on('event updated', (eventId) => {
    io.to(eventId.toString()).emit('event updated', eventId);
  });

  socket.on('join organizer room', (userId) => {
    socket.join(userId);
    console.log(`Organizer ${userId} joined their personal room`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
