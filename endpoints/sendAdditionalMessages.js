import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const sendAdditionalMessages = (token, message, id1, id2) => {
    return new Promise((resolve, reject) => {
        // get the sender ID from token
        // get the receiver ID from the body
        // get convo id (check to make sure it exists)
        // add message to message table
        // add most recent message to interface table
        let trueSender;
        const decodedToken = jwtDecode(token);
        console.log('the decoded token:', decodedToken);
        const senderID = decodedToken['id'];
        console.log('sender id:', senderID);

        // const recieverID = 69;
        // const message = "Howdy!";
        // const IdOfPersonWhoSentLastMessage = senderID;
        const hasOpenedMessage = 0;

        // query to make sure it doesn't exist:
        const getConvoID = 'SELECT convoID FROM all_messages_interface WHERE originalSenderID = ? AND originalRecieverID = ?';
        pool.query(getConvoID, [senderID, recieverID], (queryErr, queryCheckResults) => {
            if (queryErr) {
                console.error('Error executing first query: ', queryErr);
                reject(queryErr);
            } else if (queryCheckResults.length !== 0) { // it exists!
                const convoID = queryCheckResults[0].convoID;
                const insertIntoMessagesQuery = 'INSERT INTO messages (convoID, messageContent, senderID) VALUES (?, ?, ?)';
                if(id1 == senderID){
                    trueSender = senderID;
                }else{
                    trueSender = id2;
                }
                const values = [convoID, message, trueSender];
                pool.query(insertIntoMessagesQuery, values, (queryErr, result) => {
                    if (queryErr) {
                        console.error('Error executing second query:', queryErr);
                        server_error = true;
                        reject(queryErr);
                    } else {
                        const updateLastSentMessage = 'UPDATE all_messages_interface SET mostRecentMessage = ?, IdOfPersonWhoSentLastMessage = ?, hasOpenedMessage = ? WHERE convoID = ?';
                        pool.query(updateLastSentMessage, [message, senderID, hasOpenedMessage, convoID], (queryError, result) =>{
                            if(queryError){
                                console.error('Error executing third query:', queryError);
                                server_error = true;
                                reject(queryError);
                            }
                            else{
                                resolve({success: true});
                            }
                        })
                    }
                });
            } else {
                resolve({ success: false, message: "Conversation not started." });
            }
        });
    });
};
