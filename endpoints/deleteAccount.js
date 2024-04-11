import pool from '../db/connectionPool.js';
import { jwtDecode } from "jwt-decode";

export const deleteAcc = (token) => {
  return new Promise((resolve, reject) => {
    // if(verifyToken(token, process.env.ACCESS_SECRET_KEY) != false){
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const id = decodedToken['id'];
      console.log('id:',id);
      const deleteFromUsers = 'delete from users where id = ?';
      const deleteFromFeed = 'delete from info_to_display where id = ?';
      const getConvoIDs = 'select convoID from all_messages_interface where originalSenderID = ? or originalRecieverID = ?';
      const deleteFromMessagesInterface = 'delete from all_messages_interface where originalSenderID = ? or originalRecieverID = ?';
      // going to need a loop to delete all the messages for the user:
    //   for(var i = 0; i < getConvoIDs[0].convoID.length; )  
      pool.query(getConvoIDs, [id, id], (getConvoIDError, convoIDs_) => {
        if(getConvoIDError){
            reject(getConvoIDError)
        }else{
            resolve(convoIDs_);
        }
      })
  });
};