import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";
import { generateAccessAndRefreshToken } from '../jwt/createAccessAndRefresh.js';

// isVerified, has_a_bio,lowAge, highAge, appPurpose

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const updateJWT_forFilter = (token, isVerified, has_a_bio, lowAge, highAge, appPurpose, proximityFromRequest) => {
  return new Promise((resolve, reject) => {
    // if(verifyToken(token, process.env.ACCESS_SECRET_KEY) != false){
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const userID = decodedToken['id'];      

      const original_isVerified = decodedToken['isVerified'];
      const original_has_a_bio = decodedToken['has_a_bio'];
      const original_lowAge = decodedToken['lowAge'];
      const original_highAge = decodedToken['highAge'];
      const original_appPurposeToQueryFor = decodedToken['appPurpose'];

      const proximity = proximityFromRequest;

      if(isVerified == 1 && (has_a_bio == -1 && appPurpose == -1)){
        // create 2 new JWTs with isVerified as 1
        const query = 'SELECT genderUserWantsToSee, lat, long_ from info_to_display where id = ?';
        pool.query(query, [userID], (querryError, results_) => {
            if(querryError){
                resolve(querryError)
            }else{
                const lat = results_[0].lat;
                const long_ = results_[0].long_;
                const wants_to_be_shown = results_[0].genderUserWantsToSee;
                const accessAge = getRandomNumber(50,80);
                const accessAgeToMinutes = accessAge * 60;
                const refreshAge = getRandomNumber(7,11);
                const refreshAgeToDays = refreshAge * 24 * 60 * 60;
                // const proximity = 50;
                const accessToken = generateAccessAndRefreshToken(userID, process.env.ACCESS_SECRET_KEY, 'access', accessAgeToMinutes, wants_to_be_shown, 'filter...', lat, long_, proximity, 1, -1, 18, 100, -1);
                const refreshToken = generateAccessAndRefreshToken(userID, process.env.REFRESH_SECRET_KEY, 'refresh', refreshAgeToDays, wants_to_be_shown, 'filter...', lat, long_, proximity, 1, -1, 18, 100, -1);
                resolve({success: true, message:"New JWT for filter", access: accessToken, refresh: refreshToken});
            }
        })

      }

      else if(has_a_bio == 1 && (isVerified == -1 && appPurpose == -1)){
        // create 2 new JWTs with has_bio as 1
        const query = 'SELECT genderUserWantsToSee, lat, long_ from info_to_display where id = ?';
        pool.query(query, [userID], (querryError, results_) => {
            if(querryError){
                resolve(querryError)
            }else{
                const lat = results_[0].lat;
                const long_ = results_[0].long_;
                const wants_to_be_shown = results_[0].genderUserWantsToSee;
                const accessAge = getRandomNumber(50,80);
                const accessAgeToMinutes = accessAge * 60;
                const refreshAge = getRandomNumber(7,11);
                const refreshAgeToDays = refreshAge * 24 * 60 * 60;
                // const proximity = 50;
                const accessToken = generateAccessAndRefreshToken(userID, process.env.ACCESS_SECRET_KEY, 'access', accessAgeToMinutes, wants_to_be_shown, 'filter...', lat, long_, proximity, -1, 1, 18, 100, -1);
                const refreshToken = generateAccessAndRefreshToken(userID, process.env.REFRESH_SECRET_KEY, 'refresh', refreshAgeToDays, wants_to_be_shown, 'filter...', lat, long_, proximity, -1, 1, 18, 100, -1);
                resolve({success: true, message:"New JWT for filter", access: accessToken, refresh: refreshToken});
            }
        })
      }

      else if(appPurpose != -1 && (has_a_bio == -1 && isVerified == -1)){
        // create 2 new JWTs with appPurpose
        const query = 'SELECT genderUserWantsToSee, lat, long_ from info_to_display where id = ?';
        pool.query(query, [userID], (querryError, results_) => {
            if(querryError){
                resolve(querryError)
            }else{
                console.log("Yuh, ",appPurpose)
                const lat = results_[0].lat;
                const long_ = results_[0].long_;
                const wants_to_be_shown = results_[0].genderUserWantsToSee;
                const accessAge = getRandomNumber(50,80);
                const accessAgeToMinutes = accessAge * 60;
                const refreshAge = getRandomNumber(7,11);
                const refreshAgeToDays = refreshAge * 24 * 60 * 60;
                // const proximity = 50;
                const accessToken = generateAccessAndRefreshToken(userID, process.env.ACCESS_SECRET_KEY, 'access', accessAgeToMinutes, wants_to_be_shown, 'filter...', lat, long_, proximity, -1, -1, 18, 100, appPurpose);
                const refreshToken = generateAccessAndRefreshToken(userID, process.env.REFRESH_SECRET_KEY, 'refresh', refreshAgeToDays, wants_to_be_shown, 'filter...', lat, long_, proximity, -1, -1, 18, 100, appPurpose);
                resolve({success: true, message:"New JWT for filter", access: accessToken, refresh: refreshToken});
            }
        })
      }

      else{
        // create 2 new JWTs with original stuff because something wierd happened
        const query = 'SELECT genderUserWantsToSee, lat, long_ from info_to_display where id = ?';
        pool.query(query, [userID], (querryError, results_) => {
            if(querryError){
                resolve(querryError)
            }else{
                const lat = results_[0].lat;
                const long_ = results_[0].long_;
                const wants_to_be_shown = results_[0].genderUserWantsToSee;
                const accessAge = getRandomNumber(50,80);
                const accessAgeToMinutes = accessAge * 60;
                const refreshAge = getRandomNumber(7,11);
                const refreshAgeToDays = refreshAge * 24 * 60 * 60;
                // const proximity = 50;
                const accessToken = generateAccessAndRefreshToken(userID, process.env.ACCESS_SECRET_KEY, 'access', accessAgeToMinutes, wants_to_be_shown, 'filter...', lat, long_, proximity, -1, -1, lowAge, highAge, -1);
                const refreshToken = generateAccessAndRefreshToken(userID, process.env.REFRESH_SECRET_KEY, 'refresh', refreshAgeToDays, wants_to_be_shown, 'filter...', lat, long_, proximity, -1, -1, lowAge, highAge, -1);
                resolve({success: true, message:"New JWT for filter", access: accessToken, refresh: refreshToken});
            }
        })
      }
      
  });
};