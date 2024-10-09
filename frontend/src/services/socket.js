
import io from 'socket.io-client';

const socketURL = process.env.REACT_APP_SOCKET_URL;
const socketPath = process.env.REACT_APP_SOCKET_PATH;

console.log('socketUrl', socketURL);
console.log('REACT_APP_SOCKET_PATH', socketPath);

const socket = io(socketURL,{
  path: socketPath,
  transports: ['websocket', 'polling'], // Try both WebSocket and long-polling
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

console.log('socket', socket);

export default socket;