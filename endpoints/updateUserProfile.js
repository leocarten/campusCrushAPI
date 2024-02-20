import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const updateUserProfile = (token, thingsToUpdate) => {
  let updateQuery = "UPDATE info_to_display SET ";
  let updates = [];
  const mapOfValues = {
    // request:database
    "bio":"bio",
    "bucket_list":"bucket_list",
    "interests_hobbies":"interests",
    "music_preference":"music_preference",
    "pet_preference":"pet_preference",
    "app_purpose":"app_purpose",
    "wants_to_be_shown":"genderUserWantsToSee",
    "has_tattoos":"has_tattoos",
    "sleep_schedule":"sleep_schedule",
    "win_my_heart":"win_my_heart",
    "job":"job",
    "workout":"workout",
    "communication_style":"communication_style",
    "ideal_first_meetup":"ideal_first_meetup"
  }
  let interestsFormatted = "";
  let musicFormatted = "";

  for(const value in thingsToUpdate){
    if(value != "type" && value != "tokenFromUser"){
        // console.log("value:",value);
        // console.log('update:',thingsToUpdate[value]);
        if(thingsToUpdate[value] != "" && thingsToUpdate[value] != []){
            if(value == "interests_hobbies"){
                for(var i = 0; i < thingsToUpdate[value].length; i++){
                    if(i == thingsToUpdate[value].length -1){
                        interestsFormatted += thingsToUpdate[value][i]
                    }
                    else{
                        interestsFormatted += thingsToUpdate[value][i]
                        interestsFormatted += ","
                    }
                }
                updates.push(`${mapOfValues[value]} = ${interestsFormatted}`);    
            }
            else if(value == "music_preference"){
                for(var i = 0; i < thingsToUpdate[value].length; i++){
                    if(i == thingsToUpdate[value].length -1){
                        musicFormatted += thingsToUpdate[value][i]
                    }
                    else{
                        musicFormatted += thingsToUpdate[value][i]
                        musicFormatted += ","
                    }
                }
                updates.push(`${mapOfValues[value]} = ${musicFormatted}`);   
            }
            else{
                updates.push(`${mapOfValues[value]} = ${thingsToUpdate[value]}`);
            }
        }
    }
  }

  return new Promise((resolve, reject) => {
    // if(verifyToken(token, process.env.ACCESS_SECRET_KEY) != false){
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const id = decodedToken['id'];
      console.log('id:',id);
      if(updates.length > 0){
        updateQuery += updates.join(", ");
        updateQuery += ` WHERE id = ?`;
        console.log(updateQuery);
      }
    //   console.log('\ndata from user:\n',thingsToUpdate);
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