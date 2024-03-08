import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";

export const sendFirstMessage = (token, message, recieverID) => {
    return new Promise((resolve, reject) => {
        // get the sender ID from token

        // get the client ID from the body

        // Check that there is NO pre-existing row such that the original sender is senderID, and original reciever is recieverID

        // If there is no row:
            // Insert into conversation table: 
                // create new convoID (database will do this)
                // originalSenderID = ID from JWT
                // originalRecieverID = ID from body
                // mostRecentMessage = first message sent
                // IdOfPersonWhoLastSentMessage = id from jwt
                // has been opened = 0
                // INSERT into the messaging table:
                    // convoID from previous query
                    // message content
                    // sender of the message ID
                    // update the message ID 


        const decodedToken = jwtDecode(token);
        console.log('the decoded token:',decodedToken);
        const senderID = decodedToken['id'];
        console.log('sender id:',senderID);

        // const recieverID = 69;
        // const message = "Howdy!";
        const IdOfPersonWhoSentLastMessage = senderID;
        const hasOpenedMessage = 0;


        // query to make sure it doesn't exist:
        const queryCheck = 'SELECT convoID FROM all_messages_interface WHERE originalSenderID = ? AND originalRecieverID = ?';
        pool.query(queryCheck, [senderID, recieverID], (queryErr, queryCheckResults) => {
            if (queryErr) {
              console.error('Error executing query: ', queryErr);
              return;
            }
            else if(queryCheckResults.length === 0){ // it doesn't exist!!
                const sql = 'INSERT INTO all_messages_interface (originalSenderID,mostRecentMessage,IdOfPersonWhoSentLastMessage,hasOpenedMessage,originalRecieverID) VALUES (?, ?, ?, ?, ?)';
                const values = [senderID,message,IdOfPersonWhoSentLastMessage,hasOpenedMessage,recieverID];
        
                pool.query(sql, values, (queryErr, result) => {
                    if (queryErr) {
                        console.error('Error executing query:', queryErr);
                        server_error = true;
                        reject(queryErr);
                    } else {
                        pool.query('SELECT MAX(convoID) as max_id FROM all_messages_interface;', (error, results, fields) => {
                            if (error) {
                                console.error('Error executing second query:', error);
                                server_error = true;
                                reject(error);
                            } else {
                                console.log("results:",results);
                                if (results && results.length > 0 && results[0].max_id !== null) {
                                    const convoID = results[0].max_id;
                                    const new_query = 'INSERT INTO messages (convoID,messageContent,senderID) VALUES (?,?,?)';
                                    const new_values = [convoID,message,senderID];
                                    pool.query(new_query, new_values, (queryErr, result) => {
                                        if (queryErr) {
                                            console.error('Error executing third query:', queryErr);
                                            server_error = true;
                                            reject(queryErr);
                                        } else {
                                            // Create a JWT from the user and assign it to them!
                                            // const accessAge = getRandomNumber(50,80);
                                            // const accessAgeToMinutes = accessAge * 60;
                                            // const refreshAge = getRandomNumber(7,11);
                                            // const refreshAgeToDays = refreshAge * 24 * 60 * 60;
                                            // const proximity = 50;
                                            // const accessToken = generateAccessAndRefreshToken(user_id, process.env.ACCESS_SECRET_KEY, 'access', accessAgeToMinutes, wants_to_be_shown, 'filter...', lat, long_, proximity);
                                            // const refreshToken = generateAccessAndRefreshToken(user_id, process.env.REFRESH_SECRET_KEY, 'refresh', refreshAgeToDays, wants_to_be_shown, 'filter...', lat, long_, proximity);
                                            resolve({success: true});
                                            // resolve({ success: true, message: "User created successfully." });
                                        }
                                    });
                                } else {
                                    console.log("No results found or max_id is null.");
                                    server_error = true;
                                    reject(new Error("No results found or max_id is null."));
                                }
                            }
                        });
                    }
                });
            }
            else{
                resolve({success: false, message: "Conversation already started."});
            }
          });
          



        


    });
};