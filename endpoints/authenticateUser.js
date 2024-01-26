import { authenticateUsersJWT } from "../jwt/verifyJwt.js"
import dotenv from 'dotenv';
dotenv.config();
import { generateAccessAndRefreshToken } from '../jwt/createAccessAndRefresh.js'

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
        if(isAccessToken){
            // don't need to worry about assigning any JWTs
            if(authenticateUsersJWT(tokenToUse, process.env.ACCESS_SECRET_KEY) != false){
                resolve({success: true, message: "User has been authenticated!"});
            }else{
                resolve({success: false, message: "We need the client to send their refresh token"});
            }
        }
        else{
            if(authenticateUsersJWT(tokenToUse, process.env.REFRESH_SECRET_KEY) != false){
                // need to assign the user new JWT tokens and then allow them to access the resource
                console.log('id:',authenticateUsersJWT(tokenToUse, process.env.REFRESH_SECRET_KEY)['id']);
                resolve({success: true, message: "User has been authenticated!"})
            }else{
                resolve({success: false, message: "We need the client to login again..."})
            }
        }
    })
}
