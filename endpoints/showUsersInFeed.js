import pool from '../db/connectionPool.js';

export const showItemsInFeed = (req) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM info_to_display', (err, result, fields) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
    });
};