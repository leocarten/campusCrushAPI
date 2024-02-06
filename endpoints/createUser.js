import crypto from 'crypto';
import pool from '../db/connectionPool.js';
import { generateAccessAndRefreshToken } from '../jwt/createAccessAndRefresh.js'
import dotenv from 'dotenv';
dotenv.config();

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

export const createUser = (req) => {
    return new Promise((resolve, reject) => {
        console.log('hello');

        const {
            username, password, firstname, birthday, bio, gender, bucket_list, interests_hobbies,
            music_preference, pet_preference, app_purpose, wants_to_be_shown, has_tattoos,
            sleep_schedule, win_my_heart, job, workout
        } = req.body;
        // ADD COLUMN column_name data_type DEFAULT default_value;

        var server_error = false;
        var new_interests = "";
        var new_music_preference = "";

        if(interests_hobbies.length != 0){
            for(var i = 0; i < interests_hobbies.length; i++){
                if(i === (interests_hobbies.length - 1)){
                    new_interests += interests_hobbies[i];
                }else{
                    new_interests += interests_hobbies[i];
                    new_interests += ',';
                }
            }
        }else{
            new_interests = null;
        }
        if(music_preference.length != 0){
            for(var i = 0; i < music_preference.length; i++){
                if(i === (music_preference.length - 1)){
                    new_music_preference += music_preference[i];
                }else{
                    new_music_preference += music_preference[i];
                    new_music_preference += ',';
                }
            }
        }else{
            new_music_preference = null;
        }

        const messages_sent = 0;
        const points = 100;
        var hash = crypto.createHash('sha256');
        var data = hash.update(password, 'utf-8');
        const hashedPassword = data.digest('hex');
        const date = new Date();
        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
        const nextDay = new Date(date);
        nextDay.setHours(date.getHours() + 24);
        const end_time = nextDay.toISOString().slice(0, 19).replace('T', ' ');

        const sql = 'INSERT INTO users (username, password, gender, points, messages_sent, end_time, genderUserWantsToSee) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [username, hashedPassword, gender, points, messages_sent, end_time, wants_to_be_shown];

        pool.query(sql, values, (queryErr, result) => {
            if (queryErr) {
                console.error('Error executing query:', queryErr);
                server_error = true;
                reject(queryErr);
            } else {
                pool.query('SELECT MAX(id) as max_id FROM users;', (error, results, fields) => {
                    if (error) {
                        console.error('Error executing second query:', error);
                        server_error = true;
                        reject(error);
                    } else {
                        console.log("results:",results);
                        if (results && results.length > 0 && results[0].max_id !== null) {
                            const user_id = results[0].max_id;
                            const genderUserWantsToBeShown = wants_to_be_shown;
                            console.log("wants to be shown:",genderUserWantsToBeShown);
                            const new_query = 'INSERT INTO info_to_display (id, first_name, dob, bio, gender, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, pictures, is_verified, elo_score, location, has_top_placement, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, genderUserWantsToSee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                            const bitmoji_type = 1;
                            const is_verified = 0;
                            const elo_score = 0.5;
                            const location = 0;
                            const has_top_placement = 0;
                            const pictures = "Pictures";
                            const new_values = [user_id, firstname, birthday, bio, gender, bucket_list, new_interests, pet_preference, app_purpose, bitmoji_type, pictures, is_verified, elo_score, location, has_top_placement, job, new_music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, wants_to_be_shown];
                            pool.query(new_query, new_values, (queryErr, result) => {
                                if (queryErr) {
                                    console.error('Error executing third query:', queryErr);
                                    server_error = true;
                                    reject(queryErr);
                                } else {
                                    // Create a JWT from the user and assign it to them!
                                    const accessAge = getRandomNumber(50,80);
                                    const accessAgeToMinutes = accessAge * 60;
                                    const refreshAge = getRandomNumber(7,11);
                                    const refreshAgeToDays = refreshAge * 24 * 60 * 60;
                                    const accessToken = generateAccessAndRefreshToken(user_id, process.env.ACCESS_SECRET_KEY, 'access', accessAgeToMinutes, wants_to_be_shown, 'filter...');
                                    const refreshToken = generateAccessAndRefreshToken(user_id, process.env.REFRESH_SECRET_KEY, 'refresh', refreshAgeToDays, wants_to_be_shown, 'filter...');
                                    resolve({id: user_id, success: true, access:accessToken, refresh: refreshToken });
                                    // resolve({ success: true, message: "User created successfully." });
                                }
                            });
                        } else {
                            console.log("No results found or max_id is null.");
                            server_error = true;
                            reject(new Error("No results found or max_id is null."));
                        }
                    }
                });
            }
        });
    });
};
