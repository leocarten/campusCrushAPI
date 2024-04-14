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

        const {
            username, password, firstname, birthday, bio, gender, bucket_list, interests_hobbies,
            music_preference, pet_preference, app_purpose, wants_to_be_shown, has_tattoos,
            sleep_schedule, win_my_heart, job, workout, communication_style, ideal_first_meetup,
            lat, long_
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

        const messages_sent = 3;
        const points = 100;
        var hash = crypto.createHash('sha256');
        var data = hash.update(password, 'utf-8');
        const hashedPassword = data.digest('hex');
        const date = new Date();
        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
        const nextDay = new Date(date);
        nextDay.setHours(date.getHours() + 24);
        const end_time = nextDay.toISOString().slice(0, 19).replace('T', ' ');

        const sql = 'INSERT INTO users (username, password, gender, points, messages_sent, end_time, genderUserWantsToSee, lat, long_) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [username, hashedPassword, gender, points, messages_sent, end_time, wants_to_be_shown, lat, long_];

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
                            const new_query = 'INSERT INTO info_to_display (id, first_name, dob, bio, gender, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, pictures, is_verified, elo_score, location, has_top_placement, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, genderUserWantsToSee, communication_style, ideal_first_meetup, lat, long_) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                            const bitmoji_type = 1;
                            const is_verified = 0;
                            const elo_score = 0.5;
                            const location = 0;
                            const has_top_placement = 0;
                            const pictures = "Pictures";
                            const new_values = [user_id, firstname, birthday, bio, gender, bucket_list, new_interests, pet_preference, app_purpose, bitmoji_type, pictures, is_verified, elo_score, location, has_top_placement, job, new_music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, wants_to_be_shown, communication_style, ideal_first_meetup, lat, long_];
                            pool.query(new_query, new_values, (queryErr, result) => {
                                if (queryErr) {
                                    console.error('Error executing third query:', queryErr);
                                    server_error = true;
                                    reject(queryErr);
                                } else {

                                    // 
                                    const all_messages_interface = 'INSERT INTO all_messages_interface (originalSenderID,mostRecentMessage,IdOfPersonWhoSentLastMessage,hasOpenedMessage,originalRecieverID) VALUES (?, ?, ?, ?, ?)';
                                    const senderID = 31;
                                    const message = "Hey there, and welcome to CampusCrush!\n\nGet ready to dive into the heart of our buzzing community!\n\nExplore in-app features such as: customizing your feed, redeeming cool in-app currencies, and unleash your social prowess! But wait, there's a twist: You're limited to starting just 3 conversations per day! Choose wisely!\n\nWe're thrilled you've joined us on CampusCrush! Let the connections begin!"
                                    const IdOfPersonWhoSentLastMessage = 31;
                                    const hasOpenedMessage = 0;
                                    const recieverID = user_id;
                                    const values = [senderID,message,IdOfPersonWhoSentLastMessage,hasOpenedMessage,recieverID];  

                                    pool.query(all_messages_interface, values, (querryError, results_) => {
                                        if(querryError){
                                            reject(querryError)
                                        }else{
                                            pool.query('SELECT MAX(convoID) as max_id FROM all_messages_interface;', (error, results, fields) => {
                                                if (error) {
                                                    console.error('Error executing second query:', error);
                                                    reject(error);
                                                } else {
                                                    if (results && results.length > 0 && results[0].max_id !== null) {
                                                        const convoID = results[0].max_id;
                                                        const new_query = 'INSERT INTO messages (convoID,messageContent,senderID) VALUES (?,?,?)';
                                                        const new_values = [convoID,message,senderID];
                                                        pool.query(new_query, new_values, (queryErr, result) => {
                                                            if (queryErr) {
                                                                console.error('Error executing third query:', queryErr);
                                                                reject(queryErr);
                                                            }else{
                                                                const accessAge = getRandomNumber(50,80);
                                                                const accessAgeToMinutes = accessAge * 60;
                                                                const refreshAge = getRandomNumber(7,11);
                                                                const refreshAgeToDays = refreshAge * 24 * 60 * 60;
                                                                const proximity = 50;
                                                                const accessToken = generateAccessAndRefreshToken(user_id, process.env.ACCESS_SECRET_KEY, 'access', accessAgeToMinutes, wants_to_be_shown, 'filter...', lat, long_, proximity);
                                                                const refreshToken = generateAccessAndRefreshToken(user_id, process.env.REFRESH_SECRET_KEY, 'refresh', refreshAgeToDays, wants_to_be_shown, 'filter...', lat, long_, proximity);
                                                                resolve({id: user_id, success: true, access:accessToken, refresh: refreshToken });
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    })
                                    
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
