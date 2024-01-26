import jwt from 'jsonwebtoken';

export const generateAccessAndRefreshToken = (id,key,tokenType,tokenAge,filter) => {
    return jwt.sign({id, tokenType, filter}, key,{expiresIn: tokenAge});
}
