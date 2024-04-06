import pool from "../db/connectionPool.js";
import { jwtDecode } from "jwt-decode";

export const lotterySpin = (token) => {
  return new Promise((resolve, reject) => {
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const id = decodedToken['id'];
      console.log('id:',id);
      const verificationQuery = 'SELECT points from users WHERE id = ?';
      pool.query(verificationQuery, [id], (err, result, fields) => {
        if (err) {
          reject(err);
        } else if(result >= 50) {

            const mean = 34;
            const min = 20;
            const max = 300;
            const random = Math.random();
            const randomNumber = Math.round(random * (max - min) + min + (mean - (max + min) / 2));
            const userNewBalance = (result + randomNumber) - 50;

            const updateQuery = 'UPDATE users set points = points + ? where id = ?';
            pool.query(updateQuery, [userNewBalance, id], (updateError, result) => {
                if(updateError){
                    reject(updateError);
                }else{
                    resolve({success: true, newBalance: userNewBalance, lotteryTokens: randomNumber});
                }
            })
        }else{
            resolve({success: false, message: "Insufficient funds."})
        }
      });
  });
};