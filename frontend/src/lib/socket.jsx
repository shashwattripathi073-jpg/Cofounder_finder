import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const connectSocket = (userId) => {
    if (!socket.connected) {
        socket.connect();
        socket.emit('register', userId);
    }
};

export const disconnectSocket = () => {
    if (socket.connected) socket.disconnect();
};

export default socket;
