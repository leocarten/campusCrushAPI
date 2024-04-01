import pool from '../db/connectionPool.js';
import { jwtDecode } from "jwt-decode";
import trainedNet from '../neuralNetwork_v2/trained-net.js';
import { appPurposeStats } from '../neuralNetwork_v2/statistics/appPurpose.js';
import { multiSelectionSimilarity } from '../neuralNetwork_v2/statistics/multiSelect.js';
import { petStats } from '../neuralNetwork_v2/statistics/petPreference.js';
import { sleepSchedule } from '../neuralNetwork_v2/statistics/sleepStats.js';
import { workoutStats } from '../neuralNetwork_v2/statistics/workout.js';

function getRequesterData(idOfRequester) {
    return new Promise((resolve, reject) => {
        const getUserData = 'SELECT app_purpose, interests, music_preference, pet_preference, sleep_schedule, workout from info_to_display WHERE id = ?';
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
                        workout: userData.workout
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
                        workout: userData.workout
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

        getRequesterData(idOfRequester)
            .then(requesterData => {
                // Use requesterData here
                const requesterAppPurpose = requesterData.app_purpose;
                const requesterInterests = requesterData.interests;
                const requesterMusic = requesterData.music_preference;
                const requesterPet = requesterData.pet_preference;
                const requesterSleep = requesterData.sleep_schedule;
                const requesterWorkout = requesterData.workout;

                const eloBetweenUsers = 0.9;
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



// function calculateCompatibility(row, idOfRequester){
//     // row will contain everything of the OTHER user
//     const otherAppPurpose = row.app_purpose;
//     const otherInterests = row.interests.split(',');
//     const otherMusic = row.music_preference.split(',');
//     const otherPet = row.pet_preference;
//     const otherSleep = row.sleep_schedule;
//     const otherWorkout = row.workout;


//     // query based on requester ID
//     let requesterAppPurpose;
//     let requesterInterests;
//     let requesterMusic;
//     let requesterPet;
//     let requesterSleep;
//     let requesterWorkout;

//     getRequesterData(idOfRequester)
//     .then(requesterData => {
//         // Use requesterData here
//         requesterAppPurpose = requesterData.app_purpose;
//         requesterInterests = requesterData.interests;
//         requesterMusic = requesterData.music_preference;
//         requesterPet = requesterData.pet_preference;
//         requesterSleep = requesterData.sleep_schedule;
//         requesterWorkout = requesterData.workout;

//         console.log(otherInterests);
//         console.log(otherMusic);
//         console.log(requesterInterests);
//         console.log(requesterMusic);

//         const eloBetweenUsers = .9;
//         const appPurposeBetweenUsers = appPurposeStats(otherAppPurpose, requesterAppPurpose);
//         const interestsBetweenUsers = multiSelectionSimilarity(otherInterests, requesterInterests);
//         const MusicsBetweenUsers = multiSelectionSimilarity(otherMusic, requesterMusic);
//         const movieBetweenUsers = 1;
//         const petsBetweenUsers = petStats(otherPet, requesterPet);
//         const sleepBetweenUSers = sleepSchedule(otherSleep, requesterSleep);
//         const workoutBetweenUsers = workoutStats(otherWorkout, requesterWorkout);
//         const communicationBetweenUsers = 1;
//         const meetupBetweenUsers = 1;

//         console.log("eloBetweenUsers:", eloBetweenUsers);
//         console.log("appPurposeBetweenUsers:", appPurposeBetweenUsers);
//         console.log("interestsBetweenUsers:", interestsBetweenUsers);
//         console.log("MusicsBetweenUsers:", MusicsBetweenUsers);
//         console.log("movieBetweenUsers:", movieBetweenUsers);
//         console.log("petsBetweenUsers:", petsBetweenUsers);
//         console.log("sleepBetweenUSers:", sleepBetweenUSers);
//         console.log("workoutBetweenUsers:", workoutBetweenUsers);
//         console.log("communicationBetweenUsers:", communicationBetweenUsers);
//         console.log("meetupBetweenUsers:", meetupBetweenUsers);

//         const modelResult = trainedNet([eloBetweenUsers, appPurposeBetweenUsers, interestsBetweenUsers, MusicsBetweenUsers, movieBetweenUsers, petsBetweenUsers, sleepBetweenUSers, workoutBetweenUsers, communicationBetweenUsers, meetupBetweenUsers])[0];
//         return modelResult;
//     })
//     .catch(error => {
//         // Handle error
//         console.error(error);
//         return 0;
//     });


//     // const getUserData = 'SELECT app_purpose, interests, music_preference, pet_preference, sleep_schedule, workout from info_to_display WHERE id = ?';
//     // pool.query(getUserData, [idOfRequester], (queryErr, userDataQuery) => {
//     //     if (queryErr) {
//     //         console.error('Error executing query in neural network: ', queryErr);
//     //         requesterAppPurpose = 0;
//     //         requesterInterests = 0;
//     //         requesterMusic = 0;
//     //         requesterPet = 0;
//     //         requesterSleep = 0;
//     //         requesterWorkout = 0;
//     //         reject(queryErr)
//     //     }else if(userDataQuery.length == 1){
//     //         requesterAppPurpose = userDataQuery.app_purpose;
//     //         requesterInterests = userDataQuery.interests.split(',');
//     //         requesterMusic = userDataQuery.music_preference.split(',');
//     //         requesterPet = userDataQuery.pet_preference;
//     //         requesterSleep = userDataQuery.sleep_schedule;
//     //         requesterWorkout = userDataQuery.workout;
//     //         resolve({success: true});
//     //     }
//     // })

//     // const eloBetweenUsers = .9;
//     // const appPurposeBetweenUsers = appPurposeStats(otherAppPurpose, requesterAppPurpose);
//     // const interestsBetweenUsers = multiSelectionSimilarity(otherInterests, requesterInterests);
//     // const MusicsBetweenUsers = multiSelectionSimilarity(otherMusic, requesterMusic);
//     // const movieBetweenUsers = 1;
//     // const petsBetweenUsers = petStats(otherPet, requesterPet);
//     // const sleepBetweenUSers = sleepSchedule(otherSleep, requesterSleep);
//     // const workoutBetweenUsers = workoutStats(otherWorkout, requesterWorkout);
//     // const communicationBetweenUsers = 1;
//     // const meetupBetweenUsers = 1;
//     // const modelResult = trainedNet([eloBetweenUsers, appPurposeBetweenUsers, interestsBetweenUsers, MusicsBetweenUsers, movieBetweenUsers, petsBetweenUsers, sleepBetweenUSers, workoutBetweenUsers, communicationBetweenUsers, meetupBetweenUsers])[0];
//     // return modelResult;
// }

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
                    // // console.log("Result before adding compatibility:", result);
                    // result.forEach(row => {
                    //     // Calculate compatibility here based on the fields in the 'row'
                    //     row.compatibility = calculateCompatibility(row);
                    //     console.log("Compatibility calculated for row:", row.compatibility, id);
                    // });
                    // // console.log("Result after adding compatibility:", result);
                    // resolve(result);


                    // // Loop through each row in the result array
                    // result.forEach(row => {
                    //     calculateCompatibility(row, id)
                    //         .then(compatibility => {
                    //             // Once the compatibility is calculated, assign it to the row
                    //             row.compatibility = compatibility;
                    //             console.log("Compatibility calculated for row:", row.compatibility);
                    //         })
                    //         .catch(error => {
                    //             // Handle any errors that occur during compatibility calculation
                    //             row.compatibility = 0;
                    //             console.error("Error calculating compatibility for row:", error);
                    //         });
                    // });
                    
                    // // Resolve the result array after all compatibility calculations are done
                    // resolve(result);

                    const compatibilityPromises = [];

                    result.forEach(row => {
                        // Push each compatibility calculation promise into the array
                        compatibilityPromises.push(
                            calculateCompatibility(row, id)
                                .then(compatibility => {
                                    // Once the compatibility is calculated, assign it to the row
                                    row.compatibility = compatibility;
                                    console.log("Compatibility calculated for row:", row.compatibility);
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
                            // Once all calculations are done, resolve result
                            resolve(result);
                        })
                        .catch(error => {
                            // Handle any errors that occur during compatibility calculations
                            console.error("Error calculating compatibility for one or more rows:", error);
                            // Still resolve result if an error occurs, or you may choose to reject
                            resolve(result);
                        });
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
                    // // console.log("Result before adding compatibility:", result);
                    // result.forEach(row => {
                    //     // Calculate compatibility here based on the fields in the 'row'
                    //     row.compatibility = calculateCompatibility(row);
                    //     console.log("Compatibility calculated for row:", row.compatibility, id);
                    // });
                    // // console.log("Result after adding compatibility:", result);
                    // resolve(result);
                    // Assuming you're already inside a function or a block of code

                    // result.forEach(row => {
                    //     calculateCompatibility(row, id)
                    //         .then(compatibility => {
                    //             // Once the compatibility is calculated, assign it to the row
                    //             row.compatibility = compatibility;
                    //             console.log("Compatibility calculated for row:", row.compatibility);
                    //         })
                    //         .catch(error => {
                    //             // Handle any errors that occur during compatibility calculation
                    //             row.compatibility = 0;
                    //             console.error("Error calculating compatibility for row:", error);
                    //         });
                    // });

                    // resolve(result);

                    // Array to hold promises for compatibility calculations
                    const compatibilityPromises = [];

                    result.forEach(row => {
                        // Push each compatibility calculation promise into the array
                        compatibilityPromises.push(
                            calculateCompatibility(row, id)
                                .then(compatibility => {
                                    // Once the compatibility is calculated, assign it to the row
                                    row.compatibility = compatibility;
                                    console.log("Compatibility calculated for row:", row.compatibility);
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
                            // Once all calculations are done, resolve result
                            resolve(result);
                        })
                        .catch(error => {
                            // Handle any errors that occur during compatibility calculations
                            console.error("Error calculating compatibility for one or more rows:", error);
                            // Still resolve result if an error occurs, or you may choose to reject
                            resolve(result);
                        });


                }
            });
        }
    });
};