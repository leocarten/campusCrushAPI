import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import dotenv from 'dotenv';
dotenv.config();
import { generateAccessAndRefreshToken } from '../jwt/createAccessAndRefresh.js';

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

export const authenticateUserInSocket = (jwt, isAccessToken) => {
    return new Promise((resolve, reject) => {
        console.log("the token from the user was:",jwt);
        if(isAccessToken){
            // don't need to worry about assigning any JWTs
            if(authenticateUsersJWT(jwt, process.env.ACCESS_SECRET_KEY) != false){
                resolve({success: true, message: "User has been authenticated!"});
            }else{
                resolve({success: false, message: "We need the client to send their refresh token"});
            }
        }
        else{
            if(authenticateUsersJWT(jwt, process.env.REFRESH_SECRET_KEY) != false){
                const userID = authenticateUsersJWT(jwt, process.env.REFRESH_SECRET_KEY)['id'];
                const userFilters = authenticateUsersJWT(jwt, process.env.REFRESH_SECRET_KEY)['filter'];
                const genderUserWantsToBeShown = authenticateUsersJWT(jwt, process.env.REFRESH_SECRET_KEY)['genderUserWantsToSee'];
                const accessAge = getRandomNumber(50,80);
                const accessAgeToMinutes = accessAge * 60;
                const refreshAge = getRandomNumber(7,11);
                const refreshAgeToDays = refreshAge * 24 * 60 * 60;
                const accessToken = generateAccessAndRefreshToken(userID, process.env.ACCESS_SECRET_KEY, 'access', accessAgeToMinutes, genderUserWantsToBeShown, 'filter...');
                const refreshToken = generateAccessAndRefreshToken(userID, process.env.REFRESH_SECRET_KEY, 'refresh', refreshAgeToDays, genderUserWantsToBeShown, 'filter...');
                resolve({success: true, message:"We had to re-assign the access and refresh token", access: accessToken, refresh: refreshToken});
            }else{
                resolve({success: false, message: "We need the client to login again..."});
            }
        }
    })
}