import jwt from 'jsonwebtoken';
export const verifyToken = (token,key) => {
    try{
        // const clientToken = jwt.verify(token, key);
        const clientToken = jwt.verify(token, key);
        return clientToken;
    }catch(err){
        return false;
    }
}