import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const viewUserProfile = (req) => {
    console.log('req from view endpoint:',req.body);
  return new Promise((resolve, reject) => {
    const token = req.body;
    if(verifyToken(token, process.env.ACCESS_SECRET_KEY) != false){
      const decodedToken = jwtDecode(token);
      const id = decodedToken['id'];
      pool.query('SELECT first_name,dob,bio,bucket_list,interests,pet_preference,app_purpose,bitmoji_type,pictures,is_verified,job,music_preference,has_tattoos,sleep_schedule,win_my_heart,workout,communication_style,ideal_first_meetup FROM info_to_display WHERE id = ?', [id], (err, result, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    }
  });
};