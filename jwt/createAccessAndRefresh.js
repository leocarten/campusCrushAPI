import jwt from 'jsonwebtoken';

export const generateAccessAndRefreshToken = (id,key,tokenType,tokenAge,genderUserWantsToSee,filter, lat, long_) => {
    return jwt.sign({id, tokenType, genderUserWantsToSee, filter, lat, long_}, key,{expiresIn: tokenAge});
}
