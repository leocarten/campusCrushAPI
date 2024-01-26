import { verifyToken } from "../jwt/verifyJwt"
import dotenv from 'dotenv';
dotenv.config();

export const authenticateUsersJWT = (req) => {
    return new Promise((resolve, reject) => {
        const tokenFromUser = req.body;
        if(verifyToken(tokenFromUser, process.env.ACCESS_SECRET_KEY) != false){
            resolve({success: true, message: "User has been authenticated!"})
        }else{
            reject({success: false, message: "Invalid access token."})
        }
    })
}
