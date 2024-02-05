import pool from '../db/connectionPool.js';
import { jwtDecode } from "jwt-decode";


export const showItemsInFeed = (token) => {
    return new Promise((resolve, reject) => {
        // eventually I need to add parameters here for picking certain genders, app purposes, etc.

        // lets get the users id
        const decodedToken = jwtDecode(token);
        const id = decodedToken['id'];

        pool.query('SELECT first_name,dob,bio,bucket_list,interests,pet_preference,app_purpose,bitmoji_type,pictures,is_verified,job,music_preference,has_tattoos,sleep_schedule,win_my_heart,workout FROM info_to_display WHERE id != ?', [id],(err, result, fields) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
    });
};