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
            console.log('A client connected');
            console.log(socket.id);
          });

        resolve("socket");
    });
};
