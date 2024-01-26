import crypto from 'crypto';
import pool from '../db/connectionPool.js';
import { generateAccessAndRefreshToken } from '../jwt/createAccessAndRefresh.js'
import dotenv from 'dotenv';
dotenv.config();

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const loginUser = (req) => {
    return new Promise((resolve, reject) => {
        const { username, password } = req.body;
	// Perform the query
        const hash = crypto.createHash('sha256');
        hash.update(password, 'utf-8');
        const hashedPassword = hash.digest('hex');
        pool.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, hashedPassword], function (err, result, fields) {
          if (err) {
            reject(err)
          } else if(result.length > 0) {
 	    const userID = result[0].id;
	    // still need to figure out the filters !!
	    const accessAge = getRandomNumber(50,80);
	    const accessAgeToMinutes = accessAge * 60;
	    const refreshAge = getRandomNumber(7,11);
	    const refreshAgeToDays = refreshAge * 24 * 60 * 60;
	    const accessToken = generateAccessAndRefreshToken(userID, process.env.ACCESS_SECRET_KEY, 'access', accessAgeToMinutes, 'filter...');
            const refreshToken = generateAccessAndRefreshToken(userID, process.env.REFRESH_SECRET_KEY, 'refresh', refreshAgeToDays, 'filter...');
	    resolve({id: userID, success: true, access:accessToken, refresh: refreshToken });
          }
          else{
            resolve({ success: false, message: "User not found." }); 
          }
        });
    })
};
