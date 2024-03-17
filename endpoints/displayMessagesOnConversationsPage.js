import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";


function getNameByID(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT first_name FROM info_to_display WHERE id = ?';
        pool.query(query, [id], (queryError, nameResults) => {
            if (queryError) {
                reject(queryError);
            } else {
                resolve(nameResults.length > 0 ? nameResults[0].first_name : "");
            }
        });
    });
}

export const displayConversations = async (token) => {
    try {
        const decodedToken = jwtDecode(token);
        const requestID = decodedToken['id'];
        const getConversations = 'SELECT mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage, originalSenderID, originalRecieverID FROM all_messages_interface WHERE originalSenderID = ? OR originalRecieverID = ?';

        const resultsForConversation = await new Promise((resolve, reject) => {
            pool.query(getConversations, [requestID, requestID], (queryErr, results) => {
                if (queryErr) {
                    reject(queryErr);
                } else {
                    resolve(results);
                }
            });
        });

        // Fetch names for each conversation
        const conversationsWithNames = await Promise.all(resultsForConversation.map(async conversation => {
            if (conversation.originalSenderID === requestID) {
                conversation.receiver_name = await getNameByID(conversation.originalRecieverID);
                conversation.requesterID = requestID;
            }
            if (conversation.originalRecieverID === requestID) {
                conversation.receiver_name = await getNameByID(conversation.originalSenderID);
                conversation.requesterID = requestID;
            }
            return conversation;
        }));

        return { success: true, conversations: conversationsWithNames };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
