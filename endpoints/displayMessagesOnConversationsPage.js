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


export const displayConversations = (token) => {
    return new Promise((resolve, reject) => {
        
        // select mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage where originalSenderID = id OR originalRecieverID = id

        const decodedToken = jwtDecode(token);
        console.log('the decoded token:', decodedToken);
        const requestID = decodedToken['id'];
        console.log('sender id:', requestID);

        const getConversations = 'SELECT mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage, originalSenderID, originalRecieverID FROM all_messages_interface WHERE originalSenderID = ? OR originalRecieverID = ?';
        pool.query(getConversations, [requestID, requestID], (queryErr, resultsForConversation) => {
            if (queryErr) {
                console.error('Error executing first query: ', queryErr);
                reject(queryErr)
            } else if (resultsForConversation.length !== 0) { // it exists!
                // resolve({success: true, conversations: resultsForConversation});
                resultsForConversation.forEach(conversation => {
                    // Check if either originalSenderID or originalReceiverID equals 127
                    if (conversation.originalSenderID === requestID) {
                        conversation.receiver_name = getNameByID(conversation.originalRecieverID);
                    }
                    if (conversation.originalRecieverID === requestID) {
                        conversation.receiver_name = getNameByID(conversation.originalSenderID);
                    }
                });
            } else {
                resolve({ success: false, message: "You have no messages yet." });
            }
        });
    });
};

// export const displayConversations = (token, id1, id2) => {
//     return new Promise((resolve, reject) => {
        
//         const decodedToken = jwtDecode(token);
//         const requestID = decodedToken['id'];

//         let otherName;

//         const nameQuery = 'SELECT first_name FROM info_to_display WHERE id = ?';
//         const otherUserID = (requestID == id1) ? id2 : id1;

//         pool.query(nameQuery, [otherUserID], (nameQueryError, resultsForName) => {
//             if (nameQueryError) {
//                 console.error('Error executing name query: ', nameQueryError);
//                 reject(nameQueryError);
//             }

//             if (resultsForName.length === 1) {
//                 otherName = resultsForName[0].first_name;
//                 console.log('name:',otherName);

//                 const getConversationsQuery = 'SELECT mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage, originalSenderID, originalRecieverID FROM all_messages_interface WHERE originalSenderID = ? OR originalRecieverID = ?';

//                 pool.query(getConversationsQuery, [requestID, requestID], (queryErr, resultsForConversation) => {
//                     if (queryErr) {
//                         console.error('Error executing first query: ', queryErr);
//                         reject(queryErr);
//                     } else if (resultsForConversation.length !== 0) {
//                         resolve({ success: true, conversations: resultsForConversation, nameOfUser: otherName });
//                     } else {
//                         resolve({ success: false, message: "You have no messages yet." });
//                     }
//                 });
//             } else {
//                 reject("Error: User not found.");
//             }
//         });
//     });
// };

// export const displayConversations = (token) => {
//     return new Promise((resolve, reject) => {

//         // console.log('id1:',id1);
//         // console.log('id2:',id2);

        
//         const decodedToken = jwtDecode(token);
//         const requestID = decodedToken['id'];

//         const getConversationsQuery = `
//             SELECT 
//                 m.mostRecentMessage, 
//                 m.IdOfPersonWhoSentLastMessage, 
//                 m.hasOpenedMessage, 
//                 m.originalSenderID, 
//                 m.originalRecieverID,
//                 sender.first_name AS sender_name,
//                 receiver.first_name AS receiver_name,
//                 other_user.first_name AS other_user_name
//             FROM 
//                 all_messages_interface AS m
//             JOIN 
//                 info_to_display AS sender ON m.originalSenderID = sender.id
//             JOIN 
//                 info_to_display AS receiver ON m.originalRecieverID = receiver.id
//             JOIN
//                 info_to_display AS other_user ON other_user.id = ?
//             WHERE 
//                 (m.originalSenderID = ? OR m.originalRecieverID = ?)
//                 AND (sender.id = other_user.id OR receiver.id = other_user.id);
//         `;

//         pool.query(getConversationsQuery, [id_of_name_i_want_to_show, requestID, requestID], (queryErr, resultsForConversation) => {
//             if (queryErr) {
//                 console.error('Error executing query: ', queryErr);
//                 reject(queryErr);
//                 return;
//             }

//             if (resultsForConversation.length !== 0) {
//                 resolve({ success: true, conversations: resultsForConversation });
//             } else {
//                 resolve({ success: false, message: "You have no messages yet." });
//             }
//         });
//     });
// };
