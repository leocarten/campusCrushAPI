// import pool from '../db/connectionPool.js';
// import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
// import { jwtDecode } from "jwt-decode";

// export const displayConversations = (token, id1, id2) => {
//     return new Promise((resolve, reject) => {
        
//         // select mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage where originalSenderID = id OR originalRecieverID = id

//         const decodedToken = jwtDecode(token);
//         console.log('the decoded token:', decodedToken);
//         const requestID = decodedToken['id'];
//         console.log('sender id:', requestID);

//         var otherName;
//         if(requestID == id1){
//             // get name of id2
//             const nameQuery = 'SELECT first_name from info_to_display where id = ?';
//             pool.query(nameQuery, [id2], (nameQueryError, resultsForName) => {
//                 if(nameQuery){
//                     console.error('Error executing name query: ', nameQueryError);
//                     reject(nameQueryError);
//                 }else if(resultsForName.length == 1){
//                     otherName = resultsForName.first_name;
//                 }else{
//                     reject("Error.")
//                 }
//             });
//         }else{
//             const nameQuery = 'SELECT first_name from info_to_display where id = ?';
//             pool.query(nameQuery, [requestID], (nameQueryError, resultsForName) => {
//                 if(nameQuery){
//                     console.error('Error executing name query: ', nameQueryError);
//                     reject(nameQueryError);
//                 }else if(resultsForName.length == 1){
//                     otherName = resultsForName.first_name;
//                 }else{
//                     reject("Error.")
//                 }
//             });
//         }

//         // query to make sure it doesn't exist:
//         const getConversations = 'SELECT mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage, originalSenderID, originalRecieverID FROM all_messages_interface WHERE originalSenderID = ? OR originalRecieverID = ?';
//         pool.query(getConversations, [requestID, requestID], (queryErr, resultsForConversation) => {
//             if (queryErr) {
//                 console.error('Error executing first query: ', queryErr);
//                 reject(queryErr)
//             } else if (resultsForConversation.length !== 0) { // it exists!
//                 resolve({success: true, conversations: resultsForConversation, nameOfUser: otherName});
//             } else {
//                 resolve({ success: false, message: "You have no messages yet." });
//             }
//         });
//     });
// };

export const displayConversations = (token, id1, id2) => {
    return new Promise((resolve, reject) => {
        
        const decodedToken = jwtDecode(token);
        const requestID = decodedToken['id'];

        let otherName;

        const nameQuery = 'SELECT first_name FROM info_to_display WHERE id = ?';
        const otherUserID = (requestID == id1) ? id2 : id1;

        pool.query(nameQuery, [otherUserID], (nameQueryError, resultsForName) => {
            if (nameQueryError) {
                console.error('Error executing name query: ', nameQueryError);
                reject(nameQueryError);
                return;
            }

            if (resultsForName.length === 1) {
                otherName = resultsForName[0].first_name;

                const getConversationsQuery = 'SELECT mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage, originalSenderID, originalRecieverID FROM all_messages_interface WHERE originalSenderID = ? OR originalRecieverID = ?';

                pool.query(getConversationsQuery, [requestID, requestID], (queryErr, resultsForConversation) => {
                    if (queryErr) {
                        console.error('Error executing first query: ', queryErr);
                        reject(queryErr);
                    } else if (resultsForConversation.length !== 0) {
                        resolve({ success: true, conversations: resultsForConversation, nameOfUser: otherName });
                    } else {
                        resolve({ success: false, message: "You have no messages yet." });
                    }
                });
            } else {
                reject("Error: User not found.");
            }
        });
    });
};
