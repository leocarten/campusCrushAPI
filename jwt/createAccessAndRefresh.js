import jwt from 'jsonwebtoken';

export const generateAccessAndRefreshToken = (id,key,tokenType,tokenAge,genderUserWantsToSee,filter) => {
    return jwt.sign({id, tokenType, genderUserWantsToSee, filter}, key,{expiresIn: tokenAge});
}
