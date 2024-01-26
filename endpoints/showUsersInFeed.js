import pool from '../db/connectionPool.js';

export const showItemsInFeed = (req) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT first_name,dob,bio,bucket_list,interests,pet_preference,bitmoji_type,pictures,job,music_preference FROM info_to_display', (err, result, fields) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
    });
};