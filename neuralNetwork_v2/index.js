import trainedNet from './trained-net.js';
import { elo_statistics } from './statistics/elo.js';
import { multiSelectionSimilarity } from './statistics/multiSelect.js';
import { appPurposeStats } from './statistics/appPurpose.js';
import { petStats } from './statistics/petPreference.js';
import { sleepSchedule } from './statistics/sleepStats.js';
import { movieStats } from './statistics/movieGenre.js';
import { workoutStats } from './statistics/workout.js';
import { communicationStats } from './statistics/communicationStyle.js';
import { idealFirstMeetupStats } from './statistics/idealFirstMeetup.js';

// // PERSON 1
// const elo1 = .88;
// const appPurpose1 = 3;
// const interests1 = ["Kayaking"];
// const music1 = ["Rock", "Rap"];
// const movieGenre1 = "Comedy";
// const petPreference1 = 1;
// const sleepSchedule1 = 2;
// const workout1 = 2;
// const communicationStyle1 = 1;
// const idealFirstMeetUp1 = 3;

// // PERSON 2
// const elo2 = .88;
// const appPurpose2 = 3;
// const interests2 = ["Kayaking"];
// const music2 = ["Rock", "Rap"];
// const movieGenre2 = "Comedy";
// const petPreference2 = 1;
// const sleepSchedule2 = 2;
// const workout2 = 2;
// const communicationStyle2 = 1;
// const idealFirstMeetUp2 = 3;

// // ELO - closer to 1 means the ELO scores are alike
// const eloBetweenUsers = elo_statistics(elo1, elo2);
// // console.log(eloBetweenUsers);

// // APP PURPOSE 
// const appPurposeBetweenUsers = appPurposeStats(appPurpose1, appPurpose2);

// // INTERESTS - closers to 1 means they are very similiar, 0 means not similiar
// const interestsBetweenUsers = multiSelectionSimilarity(interests1, interests2);

// // MUSIC - closers to 1 means they are very similiar, 0 means not similiar
// const MusicsBetweenUsers = multiSelectionSimilarity(music1, music2);

// // MOVIE
// const movieBetweenUsers = movieStats(movieGenre1, movieGenre2);

// // PET
// const petsBetweenUsers = petStats(petPreference1, petPreference2);
// // console.log('pet:',petsBetweenUsers);

// // SLEEP
// const sleepBetweenUSers = sleepSchedule(sleepSchedule1, sleepSchedule2);

// // WORKOUT
// const workoutBetweenUsers = workoutStats(workout1, workout2);

// // COMMUNICATION
// const communicationBetweenUsers = communicationStats(communicationStyle1, communicationStyle2);

// // IDEAL FIRST MEET UP
// const meetupBetweenUsers = idealFirstMeetupStats(idealFirstMeetUp1, idealFirstMeetUp2);

// // results from model
// const result = trainedNet([eloBetweenUsers, appPurposeBetweenUsers, interestsBetweenUsers, MusicsBetweenUsers, movieBetweenUsers, petsBetweenUsers, sleepBetweenUSers, workoutBetweenUsers, communicationBetweenUsers, meetupBetweenUsers])[0];
// console.log((result*100).toFixed(2),'%');

const modelResult = trainedNet([1,1,1,1,1,1,1,1,1,1])[0];
console.log(modelResult);

// function round(number, decimalPlaces) {
//     const factor = Math.pow(10, decimalPlaces);
//     return Math.round(number * factor) / factor;
// }

// for(var i = 0; i < 10; i++){
//     const elo = round(Math.random() * 0.8 + 0.2, 4);
//     const app_purpose = round(Math.random() * 0.8 + 0.2, 4);
//     const interests = round(Math.random() * 0.8 + 0.2, 4);
//     const music = round(Math.random() * 0.8 + 0.2, 4);
//     const movie = round(Math.random() * 0.8 + 0.2, 4);
//     const pet = round(Math.random() * 0.8 + 0.2, 4);
//     const sleep = round(Math.random() * 0.8 + 0.2, 4);
//     const workout = round(Math.random() * 0.8 + 0.2, 4);
//     const communication = round(Math.random() * 0.8 + 0.2, 4);
//     const first_meet_up = round(Math.random() * 0.8 + 0.2, 4);
//     const average = (elo + app_purpose + interests + music + movie + pet + sleep + workout + communication + first_meet_up)/10;
//     const modelResult = trainedNet([elo,app_purpose,interests,music,movie,pet,sleep,workout,communication,first_meet_up])[0]
//     if(i == 0){
//         console.log("---------------------------------");
//         console.log("elo:", elo);
//         console.log("app_purpose:", app_purpose);
//         console.log("interests:", interests);
//         console.log("music:", music);
//         console.log("movie:", movie);
//         console.log("pet:", pet);
//         console.log("sleep:", sleep);
//         console.log("workout:", workout);
//         console.log("communication:", communication);
//         console.log("first_meet_up:", first_meet_up);
//         console.log("Average between parameters:",average)
//         console.log("Model Result:",modelResult*100,'%')
//         console.log("---------------------------------");    
//     }
//     else{
//         console.log("elo:", elo);
//         console.log("app_purpose:", app_purpose);
//         console.log("interests:", interests);
//         console.log("music:", music);
//         console.log("movie:", movie);
//         console.log("pet:", pet);
//         console.log("sleep:", sleep);
//         console.log("workout:", workout);
//         console.log("communication:", communication);
//         console.log("first_meet_up:", first_meet_up);
//         console.log("Average between parameters:",average)
//         console.log("Model Result:",modelResult*100,'%')
//         console.log("---------------------------------");    
//     }

// }