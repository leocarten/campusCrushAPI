import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const viewUserProfile = (token) => {
  return new Promise((resolve, reject) => {
    // if(verifyToken(token, process.env.ACCESS_SECRET_KEY) != false){
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const id = decodedToken['id'];
      console.log('id:',id);
      pool.query('SELECT first_name,dob,bio,bucket_list,interests,pet_preference,app_purpose,bitmoji_type,is_verified,job,music_preference,has_tattoos,sleep_schedule,win_my_heart,workout,communication_style,ideal_first_meetup,image_data FROM info_to_display WHERE id = ?', [id], (err, result, fields) => {
        if (err) {
          reject(err);
        } else {
          
          const largePromise = [];

          result.forEach(row => {
              const promise = new Promise((resolve, reject) => {
                  if (row.image_data != null && row.image_data !== '') {
                      row.image_data = row.image_data.toString();
                  }
              }).catch(error => {
                  row.image_data = null;
                  console.error("Error calculating compatibility for row:", error);
              });
          
              largePromise.push(promise);
          });
          
          Promise.all(largePromise)
              .then(() => {
                  resolve(result);
              })
              .catch(error => {
                  console.error("Error calculating compatibility for one or more rows:", error);
                  resolve(result);
              });
          

        }
      });
  });
};