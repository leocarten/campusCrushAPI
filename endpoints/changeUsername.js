import pool from "../db/connectionPool.js";
import { jwtDecode } from "jwt-decode";
import crypto from 'crypto';

export const changeUsername = (token, new_username) => {
  return new Promise((resolve, reject) => {
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const id = decodedToken['id'];
      console.log('id:',id);
      const updatePasswordQuery = 'UPDATE users set username = ? WHERE id = ?';
    //   var hash = crypto.createHash('sha256');
    //   var data = hash.update(new_password, 'utf-8');
    //   const hashedPassword = data.digest('hex');
      pool.query(updatePasswordQuery, [new_username,id], (err, result) => {
        if(err){
            reject(err)
        }else{
            resolve({success: true})
        }
      });
  });
};