import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

export const authenticateUsersJWT = (token, key) => {
    try{
        // const clientToken = jwt.verify(token, key);
        const clientToken = jwt.verify(token, key);
        return clientToken;
    }catch(err){
        return false;
    }
}
