import jwt from 'jsonwebtoken';

export const generateAccessAndRefreshToken = (id,key,tokenType,tokenAge,genderUserWantsToSee,filter, lat, long_, proximity, isVerified, has_a_bio,lowAge, highAge, appPurpose) => {
    return jwt.sign({id, tokenType, genderUserWantsToSee, filter, lat, long_, proximity, isVerified, has_a_bio, lowAge, highAge, appPurpose}, key,{expiresIn: tokenAge});
}
