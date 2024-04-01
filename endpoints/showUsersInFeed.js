import pool from '../db/connectionPool.js';
import { jwtDecode } from "jwt-decode";
import trainedNet from '../neuralNetwork_v2/trained-net.js';

function calculateCompatibility(row){
    // this is where we need to get all the data and convert it into model parameters
    const modelResult = trainedNet([1,1,1,1,1,1,1,1,1,1])[0];
    return modelResult;
}

export const showItemsInFeed = (token) => {
    return new Promise((resolve, reject) => {
        // eventually I need to add parameters here for picking certain genders, app purposes, etc.

        // lets get the users id
        const decodedToken = jwtDecode(token);
        const id = decodedToken['id'];
        const genderUserWantsToSee = decodedToken['genderUserWantsToSee'];
        const lat = decodedToken['lat'];
        const long_ = decodedToken['long_'];
        const proximity = decodedToken['proximity'];
        console.log("token:",decodedToken);
        console.log("proximity:",proximity);
        console.log(proximity*2);

        if(genderUserWantsToSee == 1 || genderUserWantsToSee == 2){
            pool.query(`
            SELECT 
                info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, pictures, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, distance
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
                                ? AS lat2, 
                                ? AS long2, 
                                lat AS lat1, 
                                long_ AS long1
                            FROM 
                                info_to_display
                            WHERE
                                id != ? and gender = ? and lat != 0.0 and long_ != 0.0
                        ) AS p
                ) AS distance_table
            JOIN 
                info_to_display ON info_to_display.id = distance_table.id
            WHERE 
            distance < ?`, [lat, long_, id, genderUserWantsToSee, proximity],(err, result, fields) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log("Result before adding compatibility:", result);
                    result.forEach(row => {
                        // Calculate compatibility here based on the fields in the 'row'
                        row.compatibility = calculateCompatibility(row);
                        console.log("Compatibility calculated for row:", row.compatibility);
                    });
                    // console.log("Result after adding compatibility:", result);
                    resolve(result);
                }
            });
        }
        else{
            pool.query(`
            SELECT 
                info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, pictures, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, distance
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
                                ? AS lat2, 
                                ? AS long2, 
                                lat AS lat1, 
                                long_ AS long1
                            FROM 
                                info_to_display
                            WHERE
                                id != ? and gender = 1 or gender = 2 and lat != 0.0 and long_ != 0.0
                        ) AS p
                ) AS distance_table
            JOIN 
                info_to_display ON info_to_display.id = distance_table.id
            WHERE 
            distance < ?`, [lat, long_, id, proximity],(err, result, fields) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log("Result before adding compatibility:", result);
                    result.forEach(row => {
                        // Calculate compatibility here based on the fields in the 'row'
                        row.compatibility = calculateCompatibility(row);
                        console.log("Compatibility calculated for row:", row.compatibility);
                    });
                    // console.log("Result after adding compatibility:", result);
                    resolve(result);
                }
            });
        }
    });
};