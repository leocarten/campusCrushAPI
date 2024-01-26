import { authenticateUsersJWT } from "../jwt/verifyJwt.js"
import dotenv from 'dotenv';
dotenv.config();

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
        if(isAccessToken){
            const tokenFromUser = req.body;
            const tokenToUse = tokenFromUser['tokenFromUser'];
            if(authenticateUsersJWT(tokenToUse, process.env.ACCESS_SECRET_KEY) != false){
                resolve({success: true, message: "User has been authenticated!"})
            }else{
                resolve({success: false, message: "We need the client to send their refresh token"})
            }
        }
        else{
            resolve({success: true, message: "This is us checking to see if the refresh token is valid."})
        }
    })
}
