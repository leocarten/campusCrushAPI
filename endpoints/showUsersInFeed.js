import pool from '../db/connectionPool.js';
import { jwtDecode } from "jwt-decode";


export const showItemsInFeed = (token) => {
    return new Promise((resolve, reject) => {
        // eventually I need to add parameters here for picking certain genders, app purposes, etc.

        // lets get the users id
        const decodedToken = jwtDecode(token);
        const id = decodedToken['id'];
        const genderUserWantsToSee = decodedToken['genderUserWantsToSee'];
        console.log("token:",decodedToken);

        // pool.query(`SELECT first_name,dob,bio,bucket_list,interests,pet_preference,app_purpose,bitmoji_type,pictures,is_verified,job,music_preference,has_tattoos,sleep_schedule,win_my_heart,workout,communication_style,ideal_first_meetup 
        //               FROM info_to_display 
        //               WHERE id != ? 
        //               AND 
        //               gender = ?`, [id, genderUserWantsToSee],(err, result, fields) => {
        pool.query(`
          SELECT 
              first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, pictures, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, distance
          FROM 
              (
                  SELECT 
                      id,
                      3958.8 * 2 * ASIN(
                          SQRT(
                              POWER(
                                  SIN((lat2 - abs(lat1)) * pi()/180 / 2), 2
                              ) + COS(lat2 * pi()/180 ) * COS(abs(lat1) * pi()/180) * POWER(SIN((long2 - long1) * pi()/180 / 2), 2)
                          )
                      ) AS distance
                  FROM 
                      (
                          SELECT 
                              id,
                              43.7570 AS lat2, 
                              71.6882 AS long2, 
                              lat AS lat1, 
                              long_ AS long1
                          FROM 
                              info_to_display
                          WHERE
                              gender = ? AND id != ?
                      ) AS p
              ) AS distance_table
          JOIN 
              info_to_display ON info_to_display.id = distance_table.id
          WHERE 
          distance > 1`, [id, genderUserWantsToSee],(err, result, fields) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
    });
};