import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const sendAdditionalMessages = (token, message, id1, id2) => {
    return new Promise((resolve, reject) => {
        var trueSender = 0;
        var trueReciever = 0;
        const decodedToken = jwtDecode(token);
        console.log('the decoded token:', decodedToken);
        const senderID = decodedToken['id'];
        console.log('sender id:', senderID);
        const hasOpenedMessage = 0;

        if(id1 == senderID){
            trueSender = senderID;
            trueReciever = id2;
        }else if(id2 == senderID){
            trueSender = id2;
            trueReciever = id1;
            const getConvoID = 'SELECT convoID FROM all_messages_interface WHERE originalSenderID = ? AND originalRecieverID = ? or originalSenderID = ? AND originalRecieverID';
            pool.query(getConvoID, [trueSender, trueReciever, trueReciever, trueSender], (queryErr, queryCheckResults) => {
                if (queryErr) {
                    console.error('Error executing first query: ', queryErr);
                    reject(queryErr);
                } else if (queryCheckResults.length !== 0) { // it exists!
                    const convoID = queryCheckResults[0].convoID;
                    const insertIntoMessagesQuery = 'INSERT INTO messages (convoID, messageContent, senderID) VALUES (?, ?, ?)';
                    console.log('true sender:',trueSender);
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
                    
                }
            });
        }else{
            resolve({ success: false, message: "Error with IDs." });
        }

    });
};
