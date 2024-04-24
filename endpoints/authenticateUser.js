import { authenticateUsersJWT } from "../jwt/verifyJwt.js"
import dotenv from 'dotenv';
dotenv.config();
import { generateAccessAndRefreshToken } from '../jwt/createAccessAndRefresh.js'

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

export const authenticateUser = (req, isAccessToken) => {
    // type will determine if we are recieving an access or refresh token
    // if we are recieving a refresh token
        // if valid
            // give resrouce [true]
        // if access not valid
            // send back false, and have the client send their refresh token
    // if we are reciecing a refresh token
        // if not valid
            // have the user re-login
        // if valid
            // assign the user a new access and refresh token
            // provide them the resource they want
    return new Promise((resolve, reject) => {
        const tokenFromUser = req.body;
        const tokenToUse = tokenFromUser['tokenFromUser'];
        console.log("the token from the user was:",tokenToUse);
        if(isAccessToken){
            // don't need to worry about assigning any JWTs
            if(authenticateUsersJWT(tokenToUse, process.env.ACCESS_SECRET_KEY) != false){
                resolve({success: true, message: "User has been authenticated!"});
            }else{
                resolve({success: -1, message: "We need the client to send their refresh token"});
                // this case right here will prompt the user to send a new request with refresh token
            }
        }
        else{
            if(authenticateUsersJWT(tokenToUse, process.env.REFRESH_SECRET_KEY) != false){
                const userID = authenticateUsersJWT(tokenToUse, process.env.REFRESH_SECRET_KEY)['id'];
                const userFilters = authenticateUsersJWT(tokenToUse, process.env.REFRESH_SECRET_KEY)['filter'];
                const genderUserWantsToBeShown = authenticateUsersJWT(tokenToUse, process.env.REFRESH_SECRET_KEY)['genderUserWantsToSee'];
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
