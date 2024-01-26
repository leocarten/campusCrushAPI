import { authenticateUsersJWT } from "../jwt/verifyJwt"
import dotenv from 'dotenv';
dotenv.config();

export const authenticateUser = (req) => {
    return new Promise((resolve, reject) => {
        const tokenFromUser = req.body;
        if(authenticateUsersJWT(tokenFromUser, process.env.ACCESS_SECRET_KEY) != false){
            resolve({success: true, message: "User has been authenticated!"})
        }else{
            reject({success: false, message: "Invalid access token."})
        }
    })
}
