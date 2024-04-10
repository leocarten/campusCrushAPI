import pool from "../db/connectionPool.js";
import { jwtDecode } from "jwt-decode";

export const buyAdditionalMessage = (token) => {
  return new Promise((resolve, reject) => {
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const id = decodedToken['id'];
      console.log('id:',id);
      const verificationQuery = 'SELECT points from users WHERE id = ?';
      pool.query(verificationQuery, [id], (err, result, fields) => {
        if (err) {
          reject(err);
        } else if(result[0]['points'] >= 100) {
            const userNewBalance = (result[0]['points']) - 100;
            console.log("User current balance: ",result[0]['points']);
            console.log("New balance: ", (result[0]['points']) - 100);
            const increase_message = 1;

            const updateQuery = 'UPDATE users set messages_sent = messages_sent + ? where id = ?; UPDATE users set points = ? where id = ?';
            pool.query(updateQuery, [increase_message, id, userNewBalance, id], (updateError, result) => {
                if(updateError){
                    reject(updateError);
                }else{
                    resolve({success: true, newBalance: userNewBalance});
                }
            })
        }else{
            resolve({success: false, message: "Insufficient funds."})
        }
      });
  });
};