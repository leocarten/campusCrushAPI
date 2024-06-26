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
        var trueSender = 0;
        var trueReciever = 0;
        const decodedToken = jwtDecode(token);
        // console.log('the decoded token:', decodedToken);
        const senderID = decodedToken['id'];
        console.log('sender id:', senderID);

        // const recieverID = 69;
        // const message = "Howdy!";
        // const IdOfPersonWhoSentLastMessage = senderID;
        const hasOpenedMessage = 0;

        if (id1 == senderID) {
            trueSender = senderID;
            trueReciever = id2;
        } else if (id2 == senderID) {
            trueSender = id2;
            trueReciever = id1;
        } else {
            resolve({ success: false, message: "Error with IDs." });
        }

        console.log("The sender of this request was id:",senderID);
        
        const getConvoID = 'SELECT convoID FROM all_messages_interface WHERE originalSenderID = ? AND originalRecieverID = ?';
        pool.query(getConvoID, [trueSender, trueReciever], (queryErr, queryCheckResults) => {
            if (queryErr) {
                console.error('Error executing first query: ', queryErr);
                reject(queryErr);
            } else if (queryCheckResults.length == 1) { // it exists for 1 conversation
                console.log("IT EXISTS HERE!");
                console.log("the results for the query:", queryCheckResults)
                const convoID = queryCheckResults[0].convoID;
                const insertIntoMessagesQuery = 'INSERT INTO messages (convoID, messageContent, senderID) VALUES (?, ?, ?)';
                console.log('true sender:', trueSender);
                const values = [convoID, message, senderID];
                pool.query(insertIntoMessagesQuery, values, (queryErr, result) => {
                    if (queryErr) {
                        console.error('Error executing second query:', queryErr);
                        server_error = true;
                        reject(queryErr);
                    } else {
                        const currentTime = new Date();
                        const updateLastSentMessage = 'UPDATE all_messages_interface SET mostRecentMessage = ?, IdOfPersonWhoSentLastMessage = ?, hasOpenedMessage = ?, timestamp = ? WHERE convoID = ?';
                        pool.query(updateLastSentMessage, [message, senderID, hasOpenedMessage, currentTime, convoID], (queryError, result) => {
                            if (queryError) {
                                console.error('Error executing third query:', queryError);
                                server_error = true;
                                reject(queryError);
                            } else {
                                resolve({ success: true });
                            }
                        })
                    }
                });
            } else {
                const getConvoIDv2 = 'SELECT convoID FROM all_messages_interface WHERE originalSenderID = ? AND originalRecieverID = ?';
                pool.query(getConvoIDv2, [trueReciever, trueSender], (queryErr, queryCheckResults) => {
                    if (queryErr) {
                        console.error('Error executing first query: ', queryErr);
                        reject(queryErr);
                    } else if (queryCheckResults.length == 1) { // it exists for 1 conversation
                        console.log("IT EXISTS HERE!");
                        console.log("the results for the query:", queryCheckResults)
                        const convoID = queryCheckResults[0].convoID;
                        const insertIntoMessagesQuery = 'INSERT INTO messages (convoID, messageContent, senderID) VALUES (?, ?, ?)';
                        console.log('true sender:', trueSender);
                        const values = [convoID, message, senderID];
                        pool.query(insertIntoMessagesQuery, values, (queryErr, result) => {
                            if (queryErr) {
                                console.error('Error executing second query:', queryErr);
                                server_error = true;
                                reject(queryErr);
                            } else {
                                const currentTime = new Date();
                                const updateLastSentMessage = 'UPDATE all_messages_interface SET mostRecentMessage = ?, IdOfPersonWhoSentLastMessage = ?, hasOpenedMessage = ?, timestamp = ? WHERE convoID = ?';
                                pool.query(updateLastSentMessage, [message, senderID, hasOpenedMessage, currentTime, convoID], (queryError, result) => {
                                    if (queryError) {
                                        console.error('Error executing third query:', queryError);
                                        server_error = true;
                                        reject(queryError);
                                    } else {
                                        resolve({ success: true });
                                    }
                                })
                            }
                        });
                    } 
                });
            }
        });
    })
}
        