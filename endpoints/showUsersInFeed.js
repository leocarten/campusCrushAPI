import pool from '../db/connectionPool.js';

export const showItemsInFeed = () => {
    return new Promise((resolve, reject) => {
        // eventually I need to add parameters here for picking certain genders, app purposes, etc.
        pool.query('SELECT first_name,dob,bio,bucket_list,interests,pet_preference,app_purpose,bitmoji_type,pictures,is_verified,job,music_preference,has_tattoos,sleep_schedule,win_my_heart,workout FROM info_to_display', (err, result, fields) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
    });
};