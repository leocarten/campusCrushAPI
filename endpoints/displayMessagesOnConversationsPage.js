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

function getImageByID(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT image_data FROM info_to_display WHERE id = ?';
        pool.query(query, [id], (queryError, imageResults) => {
            if (queryError) {
                reject(queryError);
            } else {
                if (imageResults && imageResults.length > 0 && imageResults[0].image_data !== null) {
                    try {
                        const imageData = imageResults[0].image_data;
                        resolve(imageData !== null ? imageData.toString() : null);
                    } catch (e) {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            }
        });
    });
}



function getConvoIdFromIds(senderId, recId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT convoID FROM all_messages_interface WHERE originalSenderID = ? AND originalRecieverID = ?';
        pool.query(query, [senderId, recId], (queryError, nameResults) => {
            if (queryError) {
                reject(queryError);
            } else {
                resolve(nameResults.length > 0 ? nameResults[0].convoID : "");
            }
        });
    });
}

export const displayConversations = async (token) => {
    try {
        const decodedToken = jwtDecode(token);
        const requestID = decodedToken['id'];
        const getConversations = 'SELECT mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage, originalSenderID, originalRecieverID, timestamp FROM all_messages_interface WHERE originalSenderID = ? OR originalRecieverID = ? ORDER BY timestamp DESC';

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
                conversation.image_data = await getImageByID(conversation.originalRecieverID);
                conversation.convoID = await getConvoIdFromIds(requestID, conversation.originalRecieverID);
                conversation.requesterID = requestID;
            }
            if (conversation.originalRecieverID === requestID) {
                conversation.receiver_name = await getNameByID(conversation.originalSenderID);
                conversation.image_data = await getImageByID(conversation.originalSenderID);
                conversation.convoID = await getConvoIdFromIds(conversation.originalSenderID, requestID);
                conversation.requesterID = requestID;
            }
            return conversation;
        }));

        return { success: true, conversations: conversationsWithNames };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
