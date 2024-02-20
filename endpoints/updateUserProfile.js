import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const updateUserProfile = (token, thingsToUpdate) => {

  const mapOfValues = {
    "bio":"",
    "bucket_list":"",
    "interests_hobbies":"",
    "music_preference":"",
    "pet_preference":"",
    "app_purpose":"",
    "wants_to_be_shown":"",
    "has_tattoos":"",
    "sleep_schedule":"",
    "win_my_heart":"",
    "job":"",
    "workout":"",
    "communication_style":"",
    "ideal_first_meetup":""
  }

  return new Promise((resolve, reject) => {
    // if(verifyToken(token, process.env.ACCESS_SECRET_KEY) != false){
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const id = decodedToken['id'];
      console.log('id:',id);
      console.log('\ndata from user:\n',thingsToUpdate);
      resolve("Done.");
    //   pool.query('UPDATE info_to_display  WHERE id = ?', [id], (err, result, fields) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result);
    //     }
    //   });
    // }
  });
};