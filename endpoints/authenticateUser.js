import { authenticateUsersJWT } from "../jwt/verifyJwt.js"
import dotenv from 'dotenv';
dotenv.config();

export const authenticateUser = (req) => {
    return new Promise((resolve, reject) => {
        const tokenFromUser = req.body;
	const tokenToUse = tokenFromUser['tokenFromUser'];
        if(authenticateUsersJWT(tokenToUse, process.env.ACCESS_SECRET_KEY) != false){
            resolve({success: true, message: "User has been authenticated!"})
        }else{
            resolve({success: false, message: "Invalid access token."})
        }
    })
}
