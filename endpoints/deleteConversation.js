import pool from '../db/connectionPool.js';
import { jwtDecode } from "jwt-decode";

export const deleteConversation = (token, convoID, id1, id2, id3) => {
  return new Promise((resolve, reject) => {
      const decodedToken = jwtDecode(token);
      console.log('the decoded token:',decodedToken);
      const id = decodedToken['id'];
      console.log('id:',id);
      const firstQuery = 'Select convoID from all_messages_interface where originalSenderID = ? and originalRecieverID = ? or originalSenderID = ? and originalRecieverID = ?';
      pool.query(firstQuery, [id, id1, id1, id], (firstQueryError, result) => {
        if(firstQueryError){
            reject(firstQueryError);
        }
        else if(result.length == 1){
            // delete if convo id = this id we queried
            const convoID_from_db = result[0].convoID;
            if(convoID_from_db == convoID){
                console.log("We should delete this.");
                const deleteQuery = 'Delete from all_messages_interface where convoID=?';
                const otherDeleteQuery = 'Delete from messages where convoID=?';
                pool.query(deleteQuery, [convoID_from_db], (deleteQueryError, deleteResult) => {
                    if(deleteQueryError){
                        reject(deleteQueryError)
                    }else{
                        pool.query(otherDeleteQuery, [convoID_from_db], (otherDeleteQueryError, deleteResult) => {
                            if(otherDeleteQueryError){
                                reject(otherDeleteQueryError)
                            }else{
                                resolve({success: true});
                            }
                        })
                    }
                })
            }
            else{
                resolve({success: false, message: "Could not verify conversation correctly"});
            }
        }else{
            // try id2
            const secondQuery = 'Select convoID from all_messages_interface where originalSenderID = ? and originalRecieverID = ? or originalSenderID = ? and originalRecieverID = ?';
            pool.query(secondQuery, [id, id2, id2, id], (secondQueryError, result1) => {
                if(secondQueryError){
                    reject(secondQueryError);
                }else if(result1.length == 1){
                    const convoID_from_db = result1[0].convoID;
                    if(convoID_from_db == convoID){
                        console.log("We should delete this.")
                        const deleteQuery = 'Delete from all_messages_interface where convoID=?';
                        const otherDeleteQuery = 'Delete from messages where convoID=?';
                        pool.query(deleteQuery, [convoID_from_db], (deleteQueryError, deleteResult) => {
                            if(deleteQueryError){
                                reject(deleteQueryError)
                            }else{
                                pool.query(otherDeleteQuery, [convoID_from_db], (otherDeleteQueryError, deleteResult) => {
                                    if(otherDeleteQueryError){
                                        reject(otherDeleteQueryError)
                                    }else{
                                        resolve({success: true});
                                    }
                                })
                            }
                        })
                    }
                    else{
                        resolve({success: false, message: "Could not verify conversation correctly"});
                    }
                }else{
                    // try id 3
                    const thirdQuery = 'Select convoID from all_messages_interface where originalSenderID = ? and originalRecieverID = ? or originalSenderID = ? and originalRecieverID = ?';
                    pool.query(thirdQuery, [id, id3, id3, id], (thirdQueryError, result2) => {
                        if(thirdQueryError){
                            reject(thirdQueryError);
                        }else if(result2.length == 1){
                            const convoID_from_db = result2[0].convoID;
                            if(convoID_from_db == convoID){
                                const deleteQuery = 'Delete from all_messages_interface where convoID=?';
                                const otherDeleteQuery = 'Delete from messages where convoID=?';
                                pool.query(deleteQuery, [convoID_from_db], (deleteQueryError, deleteResult) => {
                                    if(deleteQueryError){
                                        reject(deleteQueryError)
                                    }else{
                                        pool.query(otherDeleteQuery, [convoID_from_db], (otherDeleteQueryError, deleteResult) => {
                                            if(otherDeleteQueryError){
                                                reject(otherDeleteQueryError)
                                            }else{
                                                resolve({success: true});
                                            }
                                        })
                                    }
                                })
                            }
                            else{
                                resolve({success: false, message: "Could not verify conversation correctly"});
                            }
                        }else{
                            resolve({success: false, message: "Could not find conversation"});
                        }
                    })
                }
            })
        }
      })
  });
};