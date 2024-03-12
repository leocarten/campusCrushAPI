import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const getMessages = (token, senderID, recID) => {
    return new Promise((resolve, reject) => {
        
        // get requesters id
        // get the convo id in all_messages_interface table
        // select messages and senderID from messages table with that convo id

        const decodedToken = jwtDecode(token);
        console.log('the decoded token:', decodedToken);
        const requestID = decodedToken['id'];
        console.log('sender id:', requestID);

    
        // query to make sure it doesn't exist:
        const getConvoID = 'SELECT convoID FROM all_messages_interface WHERE originalSenderID = ? and originalRecieverID = ? OR originalSenderID = ? and originalRecieverID = ?';
        pool.query(getConvoID, [senderID, recID, recID, senderID], (queryErr, queryCheckResults) => {
            if (queryErr) {
                console.error('Error executing first query: ', queryErr);
                reject(queryErr)
            } else if (queryCheckResults.length !== 0) { // it exists!
                const convoID = queryCheckResults[0].convoID;
                const getMessagesQuery = 'SELECT messageID,messageContent,senderID FROM messages WHERE convoID = ?'
                pool.query(getMessagesQuery, [convoID], (queryError, results) => {
                    if(queryError){
                        console.error('Error executing second query: ', queryError);
                        reject(queryError)
                    }
                    else{
                        resolve({success: true, messages: results, requestersID: requestID});
                    }
                })
            } else {
                resolve({ success: false, message: "Conversation not started." });
            }
        });
    });
};
