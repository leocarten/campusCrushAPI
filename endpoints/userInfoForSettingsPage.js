import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const userInfo = (token) => {
  return new Promise((resolve, reject) => {
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const id = decodedToken['id'];
      console.log('id:',id);
      // things to get from info_to_display
        //  first_name, dob, gender
      const query = 'select first_name, dob, gender from info_to_display where id = ?';
      pool.query(query, [id], (querryError, results) => {
        if(querryError){
            reject(querryError)
        }else{
            resolve({success: true, user_info: results});
        }
      })

  });
};