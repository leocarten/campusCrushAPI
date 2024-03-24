import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const getMessages = (token, senderID, recID) => {
    return new Promise((resolve, reject) => {
        
        // get requesters id
        // get the convo id in all_messages_interface table
        // select messages and senderID from messages table with that convo id

        const decodedToken = jwtDecode(token);
        // console.log('the decoded token:', decodedToken);
        const requestID = decodedToken['id'];
        console.log('true sender id from JWT:', requestID);
        console.log("senderID:",senderID);
        console.log("rec id:",recID);
        
    
        // query to make sure it doesn't exist:
        const getConvoID = 'SELECT convoID FROM all_messages_interface WHERE originalSenderID = ? and originalRecieverID = ? OR originalSenderID = ? and originalRecieverID = ?';
        pool.query(getConvoID, [senderID, recID, recID, senderID], (queryErr, queryCheckResults) => {
            if (queryErr) {
                console.error('Error executing first query: ', queryErr);
                reject(queryErr)
            } else if (queryCheckResults.length !== 0) { // it exists!
                // this is where we should mark is as read!
                const convoID = queryCheckResults[0].convoID;
                const updateQuery = 'UPDATE all_messages_interface SET hasOpenedMessage = 1 WHERE convoID = ?';
                pool.query(updateQuery, [convoID], (updateQueryError, success) => {
                    if(updateQueryError){
                        console.error('Error executing update query: ', updateQueryError);
                        reject(updateQueryError)
                    }else{
                        const getMessagesQuery = 'SELECT messageID,messageContent,senderID,timestamp FROM messages WHERE convoID = ? ORDER BY timestamp DESC'
                        pool.query(getMessagesQuery, [convoID], (queryError, results) => {
                            if(queryError){
                                console.error('Error executing second query: ', queryError);
                                reject(queryError)
                            }
                            else{
                                resolve({success: true, messages: results, requestersID: requestID, convoID: convoID});
                            }
                        })
                    }
                })
            } else {
                resolve({ success: false, message: "Conversation not started." });
            }
        });
    });
};
