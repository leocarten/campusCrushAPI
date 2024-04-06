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
        } else if(result[0]['points'] >= 50) {
            const mean = 30;
            const min = 20;
            const max = 300;
            const random = Math.random();
            const randomNumber = Math.round(random * (max - min) + min + (mean - (max + min) / 2));
            const lotteryPoints = Math.abs(randomNumber);
            const userNewBalance = (result[0]['points'] + lotteryPoints) - 50;
            console.log("User current balance: ",result[0]['points']);
            console.log("User just won: ", lotteryPoints);
            console.log("New balance: ", (result[0]['points'] + lotteryPoints) - 50);

            const updateQuery = 'UPDATE users set points = ? where id = ?';
            pool.query(updateQuery, [userNewBalance, id], (updateError, result) => {
                if(updateError){
                    reject(updateError);
                }else{
                    resolve({success: true, newBalance: userNewBalance, lotteryTokens: lotteryPoints});
                }
            })
        }else{
            resolve({success: false, message: "Insufficient funds."})
        }
      });
  });
};