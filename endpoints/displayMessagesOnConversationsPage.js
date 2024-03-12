import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const displayConversations = (token, otherUserId) => {
    return new Promise((resolve, reject) => {
        
        // select mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage where originalSenderID = id OR originalRecieverID = id

        const decodedToken = jwtDecode(token);
        console.log('the decoded token:', decodedToken);
        const requestID = decodedToken['id'];
        console.log('sender id:', requestID);

        // query to make sure it doesn't exist:
        const getConversations = 'SELECT mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage FROM all_messages_interface WHERE originalSenderID = ? OR originalRecieverID = ?';
        pool.query(getConversations, [requestID, requestID], (queryErr, resultsForConversation) => {
            if (queryErr) {
                console.error('Error executing first query: ', queryErr);
                reject(queryErr)
            } else if (resultsForConversation.length !== 0) { // it exists!
                console.log("Response:",resultsForConversation);
                resolve({success: true, conversations: resultsForConversation});

                // const getNameOfOtherUser = 'SELECT first_name from first_name where id = ?'
                // pool.query(getNameOfOtherUser, [])
            } else {
                resolve({ success: false, message: "You have no messages yet." });
            }
        });
    });
};
