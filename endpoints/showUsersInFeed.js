import pool from '../db/connectionPool.js';
import { jwtDecode } from "jwt-decode";
import trainedNet from '../neuralNetwork_v2/trained-net.js';
import { appPurposeStats } from '../neuralNetwork_v2/statistics/appPurpose.js';
import { multiSelectionSimilarity } from '../neuralNetwork_v2/statistics/multiSelect.js';
import { petStats } from '../neuralNetwork_v2/statistics/petPreference.js';
import { sleepSchedule } from '../neuralNetwork_v2/statistics/sleepStats.js';
import { workoutStats } from '../neuralNetwork_v2/statistics/workout.js';
import { elo_statistics } from '../neuralNetwork_v2/statistics/elo.js';


function getRequesterData(idOfRequester) {
    return new Promise((resolve, reject) => {
        const getUserData = 'SELECT app_purpose, interests, music_preference, pet_preference, sleep_schedule, workout, elo_score from info_to_display WHERE id = ?';
        pool.query(getUserData, [idOfRequester], (queryErr, userDataQuery) => {
            if (queryErr) {
                console.error('Error executing query in neural network: ', queryErr);
                reject(queryErr);
            }
            else if (userDataQuery.length === 1) {
                const userData = userDataQuery[0]; // Get the first element of the array
                console.log("Query:", userData);
                if (userData.interests != null && userData.music_preference != null && (userData.interests != "" && userData.music_preference != "") ) {
                    const requesterData = {
                        app_purpose: userData.app_purpose,
                        interests: userData.interests.split(','),
                        music_preference: userData.music_preference.split(','),
                        pet_preference: userData.pet_preference,
                        sleep_schedule: userData.sleep_schedule,
                        workout: userData.workout,
                        elo_score: userData.elo_score
                    };
                    resolve(requesterData);
                } 
                else {
                    const requesterData = {
                        app_purpose: userData.app_purpose,
                        interests: 0.5,
                        music_preference: 0.5,
                        pet_preference: userData.pet_preference,
                        sleep_schedule: userData.sleep_schedule,
                        workout: userData.workout,
                        elo_score: userData.elo_score
                    };
                    resolve(requesterData);
                }            
            }
        });
    });
}

function calculateCompatibility(row, idOfRequester) {
    return new Promise((resolve, reject) => {
        // row will contain everything of the OTHER user
        const otherAppPurpose = row.app_purpose;
        var otherInterests = row.interests;
        var otherMusic = row.music_preference;
        if(otherInterests != null && otherInterests != ""){
            otherInterests = otherInterests.split(',');
        }else{
            otherInterests = [];
        }

        if(otherMusic != null && otherMusic != ""){
            otherMusic = otherMusic.split(',');
        }else{
            otherMusic = [];
        }

        const otherPet = row.pet_preference;
        const otherSleep = row.sleep_schedule;
        const otherWorkout = row.workout;
        const otherEloScore = row.elo_score;

        getRequesterData(idOfRequester)
            .then(requesterData => {
                // Use requesterData here
                const requesterAppPurpose = requesterData.app_purpose;

                var requesterInterests = requesterData.interests;
                var requesterMusic = requesterData.music_preference;

                if(typeof requesterInterests === 'string' && requesterInterests.trim() !== ''){
                    requesterInterests = requesterInterests.split(',');
                }else{
                    requesterInterests = [];
                }
        
                if(typeof requesterMusic === 'string' && requesterMusic.trim() !== ''){
                    requesterMusic = requesterMusic.split(',');
                }else{
                    requesterMusic = [];
                }

                const requesterPet = requesterData.pet_preference;
                const requesterSleep = requesterData.sleep_schedule;
                const requesterWorkout = requesterData.workout;
                const requester_elo_score = requesterData.elo_score;

                const eloBetweenUsers = elo_statistics(otherEloScore, requester_elo_score);
                const appPurposeBetweenUsers = appPurposeStats(otherAppPurpose, requesterAppPurpose);
                const interestsBetweenUsers = multiSelectionSimilarity(otherInterests, requesterInterests);
                const musicBetweenUsers = multiSelectionSimilarity(otherMusic, requesterMusic);
                const petsBetweenUsers = petStats(otherPet, requesterPet);
                const sleepBetweenUsers = sleepSchedule(otherSleep, requesterSleep);
                const workoutBetweenUsers = workoutStats(otherWorkout, requesterWorkout);
                const communicationBetweenUsers = 1;
                const meetupBetweenUsers = 1;

                const modelResult = trainedNet([eloBetweenUsers, appPurposeBetweenUsers, interestsBetweenUsers, musicBetweenUsers, petsBetweenUsers, sleepBetweenUsers, workoutBetweenUsers, communicationBetweenUsers, meetupBetweenUsers])[0];
                resolve(modelResult);
            })
            .catch(error => {
                // Handle error
                console.error("Error fetching requester data:", error);
                resolve(0);
            });
    });
}


export const showItemsInFeed = (token, amountToRequest) => {
    return new Promise((resolve, reject) => {

        const decodedToken = jwtDecode(token);
        const id = decodedToken['id'];
        const genderUserWantsToSee = decodedToken['genderUserWantsToSee'];
        const lat = decodedToken['lat'];
        const long_ = decodedToken['long_'];
        const proximity = decodedToken['proximity'];

        console.log("proximity: ",proximity)

        const isVerified = decodedToken['isVerified']
        const has_a_bio = decodedToken['has_a_bio']
        const lowAge = decodedToken['lowAge']
        const highAge = decodedToken['highAge']
        const appPurposeToQueryFor = decodedToken['appPurpose']

        console.log(lowAge);
        console.log(highAge)

        const today = new Date();
        const lowAgeInQuery = new Date(today.getFullYear() - lowAge, today.getMonth(), today.getDate());
        const highAgeInQuery = new Date(today.getFullYear() - highAge, today.getMonth(), today.getDate());

        // const today = new Date();
        // const lowBirthDate = new Date(today.getFullYear() - lowAge, today.getMonth(), today.getDate());
        // const highBirthDate = new Date(today.getFullYear() - highAge, today.getMonth(), today.getDate());

        console.log(lowAgeInQuery);
        console.log(highAgeInQuery);


        console.log("token:",decodedToken);
        console.log("proximity:",proximity);
        console.log(proximity*2);

        let dynamicOffset; 

        if(amountToRequest == null || amountToRequest == undefined || amountToRequest == 0){
            dynamicOffset = 0;
        }else{
            dynamicOffset = amountToRequest * 7;
        }

        console.log('dynamic offset: ',dynamicOffset)


        // MOST BASIC QUERY WITH NO FILTERS - STILL NEED AGE LOGIC HERE
        if(genderUserWantsToSee == 1 || genderUserWantsToSee == 2 && (isVerified == -1 && has_a_bio == -1 && appPurposeToQueryFor == -1) ){
            console.log('here!@!@');
            let queryString = `
            SELECT 
                info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
            distance < ?
            AND
            TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
            LIMIT ${dynamicOffset}, 7`;

            pool.query(queryString, [lat, long_, id, genderUserWantsToSee, proximity, lowAgeInQuery, highAgeInQuery],(err, result, fields) => {
                if (err) {
                    reject(err);
                } else {

                    const compatibilityPromises = [];

                    result.forEach(row => {
                        // Push each compatibility calculation promise into the array
                        compatibilityPromises.push(
                            calculateCompatibility(row, id)
                                .then(compatibility => {
                                    // Once the compatibility is calculated, assign it to the row
                                    row.compatibility = compatibility;
                                    console.log("Compatibility calculated for row:", row.compatibility);
                                    if (row.image_data != null && row.image_data !== '') {
    
                                        // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                        row.image_data = row.image_data.toString();
                                    } 
                                })
                                .catch(error => {
                                    // Handle any errors that occur during compatibility calculation
                                    row.compatibility = 0;
                                    console.error("Error calculating compatibility for row:", error);
                                })
                        );
                    });

                    // Wait for all compatibility calculations to complete
                    Promise.all(compatibilityPromises)
                        .then(() => {
                            resolve(result);
                        })
                        .catch(error => {
                            console.error("Error calculating compatibility for one or more rows:", error);
                            resolve(result);
                        });
                }
            });
        }

        // OTHER QUERIES WHERE THEY WANT TO SEE MALES OR FEMALES ONLY
        else if(genderUserWantsToSee == 1 || genderUserWantsToSee == 2){
        

            // query for verified users
            if(isVerified == 1 && (has_a_bio == -1 && appPurposeToQueryFor == -1)){
                
                // query for verified users
                let queryString = `
                SELECT 
                    info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
                distance < ?
                AND
                is_verified = 1
                AND
                TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
                LIMIT ${dynamicOffset}, 7`;
    
                pool.query(queryString, [lat, long_, id, genderUserWantsToSee, proximity, lowAgeInQuery, highAgeInQuery],(err, result, fields) => {
                    if (err) {
                        reject(err);
                    } else {
    
                        const compatibilityPromises = [];
    
                        result.forEach(row => {
                            // Push each compatibility calculation promise into the array
                            compatibilityPromises.push(
                                calculateCompatibility(row, id)
                                    .then(compatibility => {
                                        // Once the compatibility is calculated, assign it to the row
                                        row.compatibility = compatibility;
                                        console.log("Compatibility calculated for row:", row.compatibility);
                                        if (row.image_data != null && row.image_data !== '') {
    
                                            // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                            row.image_data = row.image_data.toString();
                                        } 
                                    })
                                    .catch(error => {
                                        row.compatibility = 0;
                                        console.error("Error calculating compatibility for row:", error);
                                    })
                            );
                        });
    
                        Promise.all(compatibilityPromises)
                            .then(() => {
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("Error calculating compatibility for one or more rows:", error);
                                resolve(result);
                            });
                    }
                });


            }

            // query for people with a bio!
            else if(has_a_bio == 1 && (isVerified == -1 && appPurposeToQueryFor == -1)){

                let queryString = `
                SELECT 
                    info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
                distance < ?
                AND

                bio IS NOT NULL
                AND
                TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
                LIMIT ${dynamicOffset}, 7`;
    
                pool.query(queryString, [lat, long_, id, genderUserWantsToSee, proximity, lowAgeInQuery, highAgeInQuery],(err, result, fields) => {
                    if (err) {
                        reject(err);
                    } else {
    
                        const compatibilityPromises = [];
    
                        result.forEach(row => {
                            // Push each compatibility calculation promise into the array
                            compatibilityPromises.push(
                                calculateCompatibility(row, id)
                                    .then(compatibility => {
                                        // Once the compatibility is calculated, assign it to the row
                                        row.compatibility = compatibility;
                                        console.log("Compatibility calculated for row:", row.compatibility);
                                        if (row.image_data != null && row.image_data !== '') {
    
                                            // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                            row.image_data = row.image_data.toString();
                                        } 
                                    })
                                    .catch(error => {
                                        row.compatibility = 0;
                                        console.error("Error calculating compatibility for row:", error);
                                    })
                            );
                        });
    
                        Promise.all(compatibilityPromises)
                            .then(() => {
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("Error calculating compatibility for one or more rows:", error);
                                resolve(result);
                            });
                    }
                });

            }

            // query for specific app purpose
            else if(appPurposeToQueryFor != -1 && (isVerified == -1 && has_a_bio == -1)){

                let queryString = `
                SELECT 
                    info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
                distance < ?
                AND
                app_purpose = ?
                AND
                TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
                LIMIT ${dynamicOffset}, 7`;
    
                pool.query(queryString, [lat, long_, id, genderUserWantsToSee, proximity, appPurposeToQueryFor],(err, result, fields) => {
                    if (err) {
                        reject(err);
                    } else {
    
                        const compatibilityPromises = [];
    
                        result.forEach(row => {
                            // Push each compatibility calculation promise into the array
                            compatibilityPromises.push(
                                calculateCompatibility(row, id)
                                    .then(compatibility => {
                                        // Once the compatibility is calculated, assign it to the row
                                        row.compatibility = compatibility;
                                        console.log("Compatibility calculated for row:", row.compatibility);
                                        if (row.image_data != null && row.image_data !== '') {
    
                                            // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                            row.image_data = row.image_data.toString();
                                        } 
                                    })
                                    .catch(error => {
                                        row.compatibility = 0;
                                        console.error("Error calculating compatibility for row:", error);
                                    })
                            );
                        });
    
                        Promise.all(compatibilityPromises)
                            .then(() => {
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("Error calculating compatibility for one or more rows:", error);
                                resolve(result);
                            });
                    }
                });

            }

            // fail-safe query: default query
            else{

                let queryString = `
                SELECT 
                    info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
                distance < ?
                AND
                TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
                LIMIT ${dynamicOffset}, 7`;
    
                pool.query(queryString, [lat, long_, id, genderUserWantsToSee, proximity, lowAgeInQuery, highAgeInQuery],(err, result, fields) => {
                    if (err) {
                        reject(err);
                    } else {
    
                        const compatibilityPromises = [];
    
                        result.forEach(row => {
                            // Push each compatibility calculation promise into the array
                            compatibilityPromises.push(
                                calculateCompatibility(row, id)
                                    .then(compatibility => {
                                        // Once the compatibility is calculated, assign it to the row
                                        row.compatibility = compatibility;
                                        console.log("Compatibility calculated for row:", row.compatibility);
                                        if (row.image_data != null && row.image_data !== '') {
    
                                            // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                            row.image_data = row.image_data.toString();
                                        } 
                                    })
                                    .catch(error => {
                                        row.compatibility = 0;
                                        console.error("Error calculating compatibility for row:", error);
                                    })
                            );
                        });
    
                        Promise.all(compatibilityPromises)
                            .then(() => {
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("Error calculating compatibility for one or more rows:", error);
                                resolve(result);
                            });
                    }
                });

            }

        }



        // QUERY TO SEE EVERYONE WITH NO FILTERS - STILL NEED AGE LOGIC HERE
        else{

            console.log("ok, this is correct.")

            if(isVerified == -1 && has_a_bio == -1 && appPurposeToQueryFor == -1){
                console.log("here?!?!")
                let queryString = 
                `
                SELECT 
                    info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
                                    id != ? and gender = 1 or gender = 2 or gender = 3 and lat != 0.0 and long_ != 0.0
                            ) AS p
                    ) AS distance_table
                JOIN 
                    info_to_display ON info_to_display.id = distance_table.id
                WHERE 
                distance < ?
                AND
                TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
                LIMIT ${dynamicOffset}, 7`
    
    
                pool.query(queryString, [lat, long_, id, proximity, lowAgeInQuery, highAgeInQuery],(err, result, fields) => {
                    if (err) {
                        reject(err);
                    } else {
                        const compatibilityPromises = [];
    
                        result.forEach(row => {
                            compatibilityPromises.push(
                                calculateCompatibility(row, id)
                                    .then(compatibility => {
                                        // Once the compatibility is calculated, assign it to the row
                                        row.compatibility = compatibility;
                                        console.log("Compatibility calculated for row:", row.compatibility);
                                        if (row.image_data != null && row.image_data !== '') {
    
                                            // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                            row.image_data = row.image_data.toString();
                                        }                                    
                                    })
                                    .catch(error => {
                                        row.compatibility = 0;
                                        console.error("Error calculating compatibility for row:", error);
                                    })
                            );
                        });
    
                        Promise.all(compatibilityPromises)
                            .then(() => {
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("Error calculating compatibility for one or more rows:", error);
                                resolve(result);
                            });
                    }
                });
            }

            // select verified users
            else if(isVerified == 1 && (has_a_bio == -1 && appPurposeToQueryFor == -1)){
                let queryString = 
                `
                SELECT 
                    info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
                                    id != ? and gender = 1 or gender = 2 or gender = 3 and lat != 0.0 and long_ != 0.0
                            ) AS p
                    ) AS distance_table
                JOIN 
                    info_to_display ON info_to_display.id = distance_table.id
                WHERE 
                distance < ?
                AND

                is_verified = 1
                AND
                TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
                LIMIT ${dynamicOffset}, 7`
    
    
                pool.query(queryString, [lat, long_, id, proximity, lowAgeInQuery, highAgeInQuery],(err, result, fields) => {
                    if (err) {
                        reject(err);
                    } else {
                        const compatibilityPromises = [];
    
                        result.forEach(row => {
                            compatibilityPromises.push(
                                calculateCompatibility(row, id)
                                    .then(compatibility => {
                                        // Once the compatibility is calculated, assign it to the row
                                        row.compatibility = compatibility;
                                        console.log("Compatibility calculated for row:", row.compatibility);
                                        if (row.image_data != null && row.image_data !== '') {
    
                                            // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                            row.image_data = row.image_data.toString();
                                        }                                    
                                    })
                                    .catch(error => {
                                        row.compatibility = 0;
                                        console.error("Error calculating compatibility for row:", error);
                                    })
                            );
                        });
    
                        Promise.all(compatibilityPromises)
                            .then(() => {
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("Error calculating compatibility for one or more rows:", error);
                                resolve(result);
                            });
                    }
                });

            }

            // select people who have a bio
            else if(has_a_bio == 1 && (isVerified == -1 && appPurposeToQueryFor == -1)){

                let queryString = 
                `
                SELECT 
                    info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
                                    id != ? and gender = 1 or gender = 2 or gender = 3 and lat != 0.0 and long_ != 0.0
                            ) AS p
                    ) AS distance_table
                JOIN 
                    info_to_display ON info_to_display.id = distance_table.id
                WHERE 
                distance < ?
                AND

                bio IS NOT NULL
                AND
                TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
                LIMIT ${dynamicOffset}, 7`
    
    
                pool.query(queryString, [lat, long_, id, proximity, lowAgeInQuery, highAgeInQuery],(err, result, fields) => {
                    if (err) {
                        reject(err);
                    } else {
                        const compatibilityPromises = [];
    
                        result.forEach(row => {
                            compatibilityPromises.push(
                                calculateCompatibility(row, id)
                                    .then(compatibility => {
                                        // Once the compatibility is calculated, assign it to the row
                                        row.compatibility = compatibility;
                                        console.log("Compatibility calculated for row:", row.compatibility);
                                        if (row.image_data != null && row.image_data !== '') {
    
                                            // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                            row.image_data = row.image_data.toString();
                                        }                                    
                                    })
                                    .catch(error => {
                                        row.compatibility = 0;
                                        console.error("Error calculating compatibility for row:", error);
                                    })
                            );
                        });
    
                        Promise.all(compatibilityPromises)
                            .then(() => {
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("Error calculating compatibility for one or more rows:", error);
                                resolve(result);
                            });
                    }
                });

            }

            // select people with app purpose
            else if(appPurposeToQueryFor != -1 && (isVerified == -1 && has_a_bio == -1)){

                console.log("Cool, you made it to the correct place.");
                console.log(appPurposeToQueryFor)

                let queryString = 
                `
                SELECT 
                    info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
                                    id != ? and gender = 1 or gender = 2 or gender = 3 and lat != 0.0 and long_ != 0.0
                            ) AS p
                    ) AS distance_table
                JOIN 
                    info_to_display ON info_to_display.id = distance_table.id
                WHERE 
                distance < ?
                AND
                app_purpose = ?
                AND
                TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
                LIMIT ${dynamicOffset}, 7`
    
    
                pool.query(queryString, [lat, long_, id, proximity, appPurposeToQueryFor],(err, result, fields) => {
                    if (err) {
                        console.log("uh oh")
                        console.log(err);
                        reject(err);
                    } else {
                        const compatibilityPromises = [];
                        console.log("Executed this one.")
                        result.forEach(row => {
                            compatibilityPromises.push(
                                calculateCompatibility(row, id)
                                    .then(compatibility => {
                                        // Once the compatibility is calculated, assign it to the row
                                        row.compatibility = compatibility;
                                        console.log("Compatibility calculated for row:", row.compatibility);
                                        if (row.image_data != null && row.image_data !== '') {
    
                                            // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                            row.image_data = row.image_data.toString();
                                        }                                    
                                    })
                                    .catch(error => {
                                        row.compatibility = 0;
                                        console.error("Error calculating compatibility for row:", error);
                                    })
                            );
                        });
    
                        Promise.all(compatibilityPromises)
                            .then(() => {
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("Error calculating compatibility for one or more rows:", error);
                                resolve(result);
                            });
                    }
                });

            }

            else{
                let queryString = 
                `
                SELECT 
                    info_to_display.id,first_name, dob, bio, bucket_list, interests, pet_preference, app_purpose, bitmoji_type, is_verified, job, music_preference, has_tattoos, sleep_schedule, win_my_heart, workout, communication_style, ideal_first_meetup, elo_score, distance, image_data
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
                                    id != ? and gender = 1 or gender = 2 or gender = 3 and lat != 0.0 and long_ != 0.0
                            ) AS p
                    ) AS distance_table
                JOIN 
                    info_to_display ON info_to_display.id = distance_table.id
                WHERE 
                distance < ?
                AND
                TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN ${lowAge} AND ${highAge}
                LIMIT ${dynamicOffset}, 7`
    
    
                pool.query(queryString, [lat, long_, id, proximity, lowAgeInQuery, highAgeInQuery],(err, result, fields) => {
                    if (err) {
                        reject(err);
                    } else {
                        const compatibilityPromises = [];
    
                        result.forEach(row => {
                            compatibilityPromises.push(
                                calculateCompatibility(row, id)
                                    .then(compatibility => {
                                        // Once the compatibility is calculated, assign it to the row
                                        row.compatibility = compatibility;
                                        console.log("Compatibility calculated for row:", row.compatibility);
                                        if (row.image_data != null && row.image_data !== '') {
    
                                            // row.image_data = row.image_data.toString('base64'); // this is SO wrong!! I am dumb!!
                                            row.image_data = row.image_data.toString();
                                        }                                    
                                    })
                                    .catch(error => {
                                        row.compatibility = 0;
                                        console.error("Error calculating compatibility for row:", error);
                                    })
                            );
                        });
    
                        Promise.all(compatibilityPromises)
                            .then(() => {
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("Error calculating compatibility for one or more rows:", error);
                                resolve(result);
                            });
                    }
                });

            }

        }
    });
};