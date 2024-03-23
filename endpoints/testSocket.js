import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";
import http from 'http';
import { Server } from 'socket.io';


export const socketTesting = (token) => {
    return new Promise((resolve, reject) => {
        const decodedToken = jwtDecode(token);
        console.log('the decoded token:', decodedToken);
        const id = decodedToken['id'];
        console.log('id:', id);

        const server = http.createServer();
        const io = new Server(server);

        const PORT = 3001;

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

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
