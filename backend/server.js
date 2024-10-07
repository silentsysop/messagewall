require('dotenv').config();
const config = require('./config/config');
const socketIo = require('socket.io');
const app = require('./App');
const http = require('http');
const server = http.createServer(app);

console.log('config', config);


const io = socketIo(server, {
  cors: {
    origin: config.frontendUrl,
    methods: ["GET", "POST"]
  }
});

// Set io object in app.locals to be accessible in routes
app.locals.io = io;

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