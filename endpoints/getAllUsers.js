import pool from '../db/connectionPool.js';
import { verifyToken } from '../jwt/verifyJwt.js';

export const getUsers = (req) => {
  return new Promise((resolve, reject) => {
    const token = req.body;
    if(verifyToken(token, process.env.ACCESS_SECRET_KEY) != false){
      pool.query('SELECT * FROM users', (err, result, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    }
  });
};