import io from 'socket.io-client';
import { logger } from '../utils/logger';

const socketURL = process.env.REACT_APP_SOCKET_URL;
const socketPath = process.env.REACT_APP_SOCKET_PATH;

logger.log('Attempting to connect to Socket.IO server:', socketURL);
logger.log('Using Socket.IO path:', socketPath);

const socket = io(socketURL, {
  path: socketPath,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  logger.log('Socket.IO connected successfully');
});

socket.on('connect_error', (error) => {
  logger.error('Socket.IO connection error:', error);
});

socket.on('disconnect', (reason) => {
  logger.log('Socket.IO disconnected:', reason);
});

export default socket;