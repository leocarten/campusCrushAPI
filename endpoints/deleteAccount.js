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
      const deleteMessages = 'delete from messages where convoID = ?';

      pool.query(deleteFromUsers, [id], (usersError, userResults) => { // delete from users
        if(usersError){
            reject(usersError)
        }
        else{
            pool.query(deleteFromFeed, [id], (feedError, feedResults) => { // delete from feed
                if(feedError){
                    reject(feedError)
                }
                else{
                    pool.query(getConvoIDs, [id, id], (getConvoIDError, convoIDs_) => { // get convoIDs so we can delete later
                        if(getConvoIDError){
                            reject(getConvoIDError)
                        }else{
                            console.log(convoIDs_);
                            // for(var i = 0; i < convoIDs_.length; i++){
                            //     // this is how do you it!
                            //     console.log(convoIDs_[i].convoID);
                            //     pool.query(deleteMessages, [convoIDs_[i].convoID], (deleteMessagesError, deleteMessagesResult) => { // delete users messages
                            //         if(deleteMessagesError){
                            //             reject(deleteMessagesError)
                            //         }
                            //         else{
                            //             resolve({success: true})
                            //         }
                            //     })
                            //   } 
                              pool.query(deleteFromMessagesInterface, [id], (interfaceError, interfaceResults) => {
                                if(interfaceError){
                                    reject(interfaceError)
                                }
                                else{
                                    const deletePromises = convoIDs_.map(convo => {
                                        return new Promise((resolve, reject) => {
                                            pool.query(deleteMessages, [convo.convoID], (deleteMessagesError, deleteMessagesResult) => {
                                                if (deleteMessagesError) {
                                                    reject(deleteMessagesError);
                                                } else {
                                                    resolve({ success: true });
                                                }
                                            });
                                        });
                                    });
                                    
                                    Promise.all(deletePromises)
                                        .then(() => {
                                            // All queries were successful
                                            resolve({ success: true });
                                        })
                                        .catch(error => {
                                            // At least one query failed
                                            reject(error);
                                        });
                                }
                              }) 
                        }
                      })
                }
              })
        }
      })
  });
};