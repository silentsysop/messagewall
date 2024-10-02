
import io from 'socket.io-client';
import config from '../config';

const socket = io(config.socketUrl);

export default socket;