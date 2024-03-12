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
        const getConversations = 'SELECT mostRecentMessage, IdOfPersonWhoSentLastMessage, hasOpenedMessage, originalSenderID, originalRecieverID FROM all_messages_interface WHERE originalSenderID = ? OR originalRecieverID = ?';
        pool.query(getConversations, [requestID, requestID], (queryErr, resultsForConversation) => {
            if (queryErr) {
                console.error('Error executing first query: ', queryErr);
                reject(queryErr)
            } else if (resultsForConversation.length !== 0) { // it exists!
                console.log("Response:",resultsForConversation);
                const idsOfSenders = resultsForConversation.map(result => result.originalSenderID);
                const idsOfRecievers = resultsForConversation.map(result => result.originalRecieverID);
                var namesOfPersonHavingConvoWith = []
                // var i = idsOfSenders.length;
                for(var i = 0; i < idsOfSenders.length; i++){
                    if (requestID == idsOfSenders[i]){
                        const nameQuery = 'SELECT first_name from info_to_display where id = ?';
                        pool.query(nameQuery, [requestID], (nameQueryError, nameOfUser) => {
                            if(nameQueryError){
                                console.error('Error executing second query: ', queryErr);
                                reject(queryErr);
                            }else if(nameOfUser.length == 1){
                                namesOfPersonHavingConvoWith.append(nameOfUser);
                            }else{
                                resolve({ success: false, message: "Error" });
                            }
                        } )
                    }
                    else{
                        const nameQuery = 'SELECT first_name from info_to_display where id = ?';
                        pool.query(nameQuery, [idsOfRecievers[i]], (nameQueryError, nameOfUser) => {
                            if(nameQueryError){
                                console.error('Error executing second query: ', queryErr);
                                reject(queryErr);
                            }else if(nameOfUser.length == 1){
                                namesOfPersonHavingConvoWith.append(nameOfUser);
                            }else{
                                resolve({ success: false, message: "Error" });
                            }
                        } )
                    }
                }

                // console.log(ids);
                resolve({success: true, conversations: resultsForConversation, names: namesOfPersonHavingConvoWith});


                // const getNameOfOtherUser = 'SELECT first_name from first_name where id = ?'
                // pool.query(getNameOfOtherUser, [])
            } else {
                resolve({ success: false, message: "You have no messages yet." });
            }
        });
    });
};
