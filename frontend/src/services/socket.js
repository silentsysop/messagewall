
import io from 'socket.io-client';
import config from '../config';

const socket = io(config.socketUrl,{
  path: process.env.REACT_APP_SOCKET_PATH || '/socket.io',
});

export default socket;