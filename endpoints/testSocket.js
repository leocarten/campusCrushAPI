import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";



export const socketTesting = (token, io) => {
    return new Promise((resolve, reject) => {
        const decodedToken = jwtDecode(token);
        console.log('the decoded token:', decodedToken);
        const id = decodedToken['id'];
        console.log('id:', id);

        io.on('connection', (socket) => {
            console.log('A user connected');

            // Handle messages
            socket.on('message', (data) => {
                console.log('Message received:', data);
                // Broadcast the message to all connected clients
                io.emit('message', data);
            });

            // Handle disconnections
            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });

        resolve("socket");
    });
};
