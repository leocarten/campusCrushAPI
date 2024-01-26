import pool from '../db/connectionPool.js';

export const showItemsInFeed = (req) => {
    return new Promise((resolve, reject) => {
        // first_name,dob,bio,bucket_list,interests,pet_preference,bitmoji_type,pictures,job,music_preference
        pool.query('SELECT * FROM info_to_display', (err, result, fields) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
    });
};