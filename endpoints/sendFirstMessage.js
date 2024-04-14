import pool from '../db/connectionPool.js';
import { authenticateUsersJWT } from '../jwt/verifyJwt.js';
import { jwtDecode } from "jwt-decode";
import { sendAdditionalMessages } from './sendAdditionalMessages.js';

export const sendFirstMessage = async (token, message, recieverID) => {
    return new Promise(async (resolve, reject) => {
        const decodedToken = jwtDecode(token);
        console.log('the decoded token:',decodedToken);
        const senderID = decodedToken['id'];
        console.log('sender id:',senderID);

        // const recieverID = 69;
        // const message = "Howdy!";
        const IdOfPersonWhoSentLastMessage = senderID;
        const hasOpenedMessage = 0;


        // query to make sure it doesn't exist:
        const queryCheck = 'SELECT convoID FROM all_messages_interface WHERE originalSenderID = ? AND originalRecieverID = ? or originalSenderID = ? AND originalRecieverID = ?';
        pool.query(queryCheck, [senderID, recieverID, recieverID, senderID], async (queryErr, queryCheckResults) => {
            if (queryErr) {
              console.error('Error executing query: ', queryErr);
              return;
            }
            else if(queryCheckResults.length === 0){ // it doesn't exist!!

                // check to make sure that the user has enough messages available!!
                const available_messages_query = "Select start_time, end_time, messages_sent from users where id = ?";
                pool.query(available_messages_query, [senderID], (availableMessageError, times_and_messages) => {
                    if(availableMessageError){
                        reject(availableMessageError)
                    }
                    else{
                        // check to see if we can send the message
                        // we should check:
                            // if ((now() is between start and end) && (messages >= 0)) || (now() >= end time)
                                // figure out which condition, and send message!!

                        const start_time = times_and_messages[0].start_time;
                        const end_time = times_and_messages[0].end_time;
                        const messages_sent = times_and_messages[0].messages_sent;
                        const current_time = new Date();

                        if( (current_time >= new Date(start_time) && current_time <= new Date(end_time) && messages_sent > 0 ) || (current_time >= new Date(end_time))){
                            if(current_time >= new Date(end_time)){
                                // set start to now()
                                // end = now + 24hrs
                                // messages = 2 (should be 3, but we update to 3 and then subtract one for the message they are currently sending)

                                const date = new Date();
                                const nextDay = new Date(date);
                                nextDay.setHours(date.getHours() + 24);
                                const end_time = nextDay.toISOString().slice(0, 19).replace('T', ' ');
                                const new_amount_messages = 2;
                                const update_query = "Update users set start_time = ?, end_time = ?, messages_sent = ? where id = ?";
                                pool.query(update_query, [date, end_time, new_amount_messages, senderID], (updateError, result1_) => {
                                    if(updateError){
                                        reject(updateError)
                                    }
                                    else{
                                        // send message logic
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

                                                                    // update ELO score

                                                                    // get ELO score of other person
                                                                    const elo_score_other_query = 'SELECT elo_score from info_to_display where id = ?';
                                                                    pool.query(elo_score_other_query, [recieverID], (elo_other_error, elo_score_other) => {
                                                                        if(elo_other_error){
                                                                            reject(elo_other_error)
                                                                        }else{
                                                                            const other_elo_score = elo_score_other[0].elo_score;
                                                                            const elo_score_sender_query = 'SELECT elo_score from info_to_display where id = ?';
                                                                            pool.query(elo_score_sender_query, [senderID], (sender_elo_error, elo_score_sender) => {
                                                                                if(sender_elo_error){
                                                                                    reject(sender_elo_error)
                                                                                }else{
                                                                                    const sender_elo_score = elo_score_sender[0].elo_score;
                                                                                    var difference = Math.abs(other_elo_score - sender_elo_score);
                                                                                    const elo_score_counter_sender_query = 'SELECT elo_score_counter from info_to_display where id = ?';
                                                                                    pool.query(elo_score_counter_sender_query, [senderID], (elo_counter_error, elo_counter) => {
                                                                                        if(elo_counter_error){
                                                                                            reject(elo_counter_error)
                                                                                        }else{
                                                                                            const elo_divider = elo_counter[0].elo_score_counter;
                                                                                            const update_elo_score_query = 'Update info_to_display set elo_score = ? where id = ?';
                                                                                            var new_sender_elo = 0;
                                                                                            var new_rec_elo = 0;
                                                                                            if(other_elo_score >= sender_elo_score){
                                                                                                if(other_elo_score - (difference / elo_divider) >= 0){
                                                                                                    new_rec_elo = other_elo_score - (difference / elo_divider);
                                                                                                }else{
                                                                                                    new_rec_elo = other_elo_score;
                                                                                                }
                                                                                                if(sender_elo_score + (difference / elo_divider) <= 1){
                                                                                                    new_sender_elo = sender_elo_score + (difference / elo_divider);
                                                                                                }else{
                                                                                                    new_sender_elo = sender_elo_score
                                                                                                }
                                                                                            }else{
                                                                                                if(sender_elo_score - (difference / elo_divider) >= 0){
                                                                                                    new_sender_elo -= (difference / elo_divider);
                                                                                                }else{
                                                                                                    new_sender_elo = sender_elo_score;
                                                                                                }
                                                                                                if(other_elo_score + (difference / elo_divider) <= 1){
                                                                                                    new_rec_elo = other_elo_score + (difference / elo_divider);
                                                                                                }else{
                                                                                                    new_rec_elo = other_elo_score;
                                                                                                }
                                                                                            }
                                                                                            pool.query(update_elo_score_query, [new_sender_elo, senderID], (updateSenderError, result_5) => {
                                                                                                if(updateSenderError){
                                                                                                    reject(updateSenderError)
                                                                                                }else{
                                                                                                    pool.query(update_elo_score_query, [new_rec_elo, recieverID], (updateSenderError_, result_6) => {
                                                                                                        if(updateSenderError_){
                                                                                                            reject(updateSenderError_)
                                                                                                        }else{

                                                                                                            console.log(`${senderID}: ${new_sender_elo}`);
                                                                                                            console.log(`${recieverID}: ${new_rec_elo}`);
                                                                                                                                                                                                                                                                            // update points
                                                                                                            const firstMessagePointUpdate = 'UPDATE users set points = points + 10 where id = ?';
                                                                                                            pool.query(firstMessagePointUpdate, [senderID], (pointsQueryError, pointsSuccess) => {
                                                                                                                if(pointsQueryError){
                                                                                                                    reject(pointsQueryError);
                                                                                                                }
                                                                                                                else{

                                                                                                                    // update the total_first_message_sent elo score
                                                                                                                    const update_elo_score_counter_query = 'Update info_to_display set elo_score_counter = elo_score_counter + 1 where id = ?';

                                                                                                                    pool.query(update_elo_score_counter_query, [senderID], (update_counter_error, update_result) => {
                                                                                                                        if(update_counter_error){
                                                                                                                            reject(update_counter_error)
                                                                                                                        }else{
                                                                                                                            const getTracker = 'SELECT tracker_message_timestamp_column from users where id = ?';
                                                                                                                            const currentTime = new Date();
                                                                                                                            pool.query(getTracker, [senderID], (error, results) => {
                                                                                                                                if (error) {
                                                                                                                                    console.error('Error fetching tracker timestamp:', error);
                                                                                                                                    reject(error)
                                                                                                                                }
                                                                                                                            
                                                                                                                                else{
                                                                                                                                    const trackerTimestamp = new Date(results[0].tracker_message_timestamp_column);
                                                                                                                                    const timeDifference = currentTime.getTime() - trackerTimestamp.getTime();
                                                                                                                                    const hoursDifference = timeDifference / (1000 * 60 * 60);
                                                                                                                            
                                                                                                                                    if (hoursDifference >= 24) {
                                                                                                                                        console.log("Current time is at least 24 hours after the timestamp from the query.");
                                                                                                                                        const updateMessagesStreak = `
                                                                                                                                        UPDATE users
                                                                                                                                        SET messaging_streak = CASE 
                                                                                                                                                WHEN NOW() BETWEEN DATE_ADD(messaging_timestamp_column, INTERVAL 24 HOUR) AND DATE_ADD(messaging_timestamp_column, INTERVAL 48 HOUR) THEN messaging_streak + 1 
                                                                                                                                                
                                                                                                                                                ELSE 1
                                                                                                                                            END,
                                                                                                                                            tracker_message_timestamp_column = CASE
                                                                                                                                                WHEN NOW() BETWEEN DATE_ADD(tracker_message_timestamp_column, INTERVAL 24 HOUR) AND DATE_ADD(tracker_message_timestamp_column, INTERVAL 48 HOUR) THEN NOW()
                                                                                                                                                WHEN NOW() > DATE_ADD(tracker_message_timestamp_column, INTERVAL 48 HOUR) THEN NOW()
                                                                                                                                                ELSE tracker_message_timestamp_column
                                                                                                                                            END,
                                                                                                                                            messaging_timestamp_column = CASE
                                                                                                                                                WHEN NOW() BETWEEN DATE_ADD(messaging_timestamp_column, INTERVAL 24 HOUR) AND DATE_ADD(messaging_timestamp_column, INTERVAL 48 HOUR) THEN NOW()
                                                                                                                                                WHEN NOW() > DATE_ADD(messaging_timestamp_column, INTERVAL 48 HOUR) THEN NOW()
                                                                                                                                                ELSE messaging_timestamp_column
                                                                                                                                            END
                                                                                                                                        WHERE id = ?;
                                                                                                                                        `;
                                                                                                                                        pool.query(updateMessagesStreak, [senderID], (updateError, result) => {
                                                                                                                                            if(updateError){
                                                                                                                                                reject(updateError);
                                                                                                                                            }else{
                                                                                                                                                resolve({success: true});
                                                                                                                                            }
                                                                                                                                        });
                                                                                                                                    }else{
                                                                                                                                        console.log("Wasnt 24 hours after.")
                                                                                                                                    }
                                                                                                                                    resolve({success: true});
                                                                                                                                }
                                                                                                                            });
                                                                                                                        }
                                                                                                                    })

                                                                                                                    // need to update streak
                                                                                                                        // get time stamp of last message sent, assign it to x
                                                                                                                        // if x is between 24 and 48 hours after the new message is sent, update x to now, increase counter
                                                                                                                        // else: update x to now, make counter = 1
                                                                                                                

                                                                                                                }
                                                                                                            });
                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    });
                                                                                }
                                                                            })
                                                                        }
                                                                    })


                                                                
                                                                    
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
                                })

                            }
                            else{ // need to decrease messages by 1 and then send message
                                const update_messages_query = "Update users set messages_sent = messages_sent - 1 where id = ?";
                                pool.query(update_messages_query, [senderID], (update_message_query, result2_) => {
                                    if(update_message_query){
                                        reject(update_message_query)
                                    }
                                    else{ 
                                        // send message!!
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

                                                                    // update ELO score
                                                                    const elo_score_other_query = 'SELECT elo_score from info_to_display where id = ?';
                                                                    pool.query(elo_score_other_query, [recieverID], (elo_other_error, elo_score_other) => {
                                                                        if(elo_other_error){
                                                                            reject(elo_other_error)
                                                                        }else{
                                                                            const other_elo_score = elo_score_other[0].elo_score;
                                                                            const elo_score_sender_query = 'SELECT elo_score from info_to_display where id = ?';
                                                                            pool.query(elo_score_sender_query, [senderID], (sender_elo_error, elo_score_sender) => {
                                                                                if(sender_elo_error){
                                                                                    reject(sender_elo_error)
                                                                                }else{
                                                                                    const sender_elo_score = elo_score_sender[0].elo_score;
                                                                                    var difference = Math.abs(other_elo_score - sender_elo_score);
                                                                                    const elo_score_counter_sender_query = 'SELECT elo_score_counter from info_to_display where id = ?';
                                                                                    pool.query(elo_score_counter_sender_query, [senderID], (elo_counter_error, elo_counter) => {
                                                                                        if(elo_counter_error){
                                                                                            reject(elo_counter_error)
                                                                                        }else{
                                                                                            const elo_divider = elo_counter[0].elo_score_counter;
                                                                                            var id_to_update = 0;
                                                                                            const update_elo_score_query = 'Update info_to_display set elo_score = ? where id = ?';
                                                                                            var new_sender_elo = 0;
                                                                                            var new_rec_elo = 0;
                                                                                            if(other_elo_score >= sender_elo_score){
                                                                                                if(other_elo_score - (difference / elo_divider) >= 0){
                                                                                                    new_rec_elo = other_elo_score - (difference / elo_divider);
                                                                                                }else{
                                                                                                    new_rec_elo = other_elo_score;
                                                                                                }
                                                                                                if(sender_elo_score + (difference / elo_divider) <= 1){
                                                                                                    new_sender_elo = sender_elo_score + (difference / elo_divider);
                                                                                                }else{
                                                                                                    new_sender_elo = sender_elo_score
                                                                                                }
                                                                                            }else{
                                                                                                if(sender_elo_score - (difference / elo_divider) >= 0){
                                                                                                    new_sender_elo -= (difference / elo_divider);
                                                                                                }else{
                                                                                                    new_sender_elo = sender_elo_score;
                                                                                                }
                                                                                                if(other_elo_score + (difference / elo_divider) <= 1){
                                                                                                    new_rec_elo = other_elo_score + (difference / elo_divider);
                                                                                                }else{
                                                                                                    new_rec_elo = other_elo_score;
                                                                                                }
                                                                                            }
                                                                                            pool.query(update_elo_score_query, [new_sender_elo, senderID], (updateSenderError, result_5) => {
                                                                                                if(updateSenderError){
                                                                                                    reject(updateSenderError)
                                                                                                }else{
                                                                                                    pool.query(update_elo_score_query, [new_rec_elo, recieverID], (updateSenderError_, result_6) => {
                                                                                                        if(updateSenderError_){
                                                                                                            reject(updateSenderError_)
                                                                                                        }else{
                                                                                                            // rest of code
                                                                                                                                                                                                                                                                            // update points
                                                                                                            const firstMessagePointUpdate = 'UPDATE users set points = points + 10 where id = ?';
                                                                                                            pool.query(firstMessagePointUpdate, [senderID], (pointsQueryError, pointsSuccess) => {
                                                                                                                if(pointsQueryError){
                                                                                                                    reject(pointsQueryError);
                                                                                                                }
                                                                                                                else{
                                                                                                                    // need to update streak
                                                                                                                        // get time stamp of last message sent, assign it to x
                                                                                                                        // if x is between 24 and 48 hours after the new message is sent, update x to now, increase counter
                                                                                                                        // else: update x to now, make counter = 1

                                                                                                                        console.log(`${senderID}: ${new_sender_elo}`);
                                                                                                                        console.log(`${recieverID}: ${new_rec_elo}`);

                                                                                                                        const update_elo_score_counter_query = 'Update info_to_display set elo_score_counter = elo_score_counter + 1 where id = ?';

                                                                                                                        pool.query(update_elo_score_counter_query, [senderID], (update_counter_error, update_result) => {
                                                                                                                            if(update_counter_error){
                                                                                                                                reject(update_counter_error)
                                                                                                                            }else{
                                                                                                                                const getTracker = 'SELECT tracker_message_timestamp_column from users where id = ?';
                                                                                                                                const currentTime = new Date();
                                                                                                                                pool.query(getTracker, [senderID], (error, results) => {
                                                                                                                                    if (error) {
                                                                                                                                        console.error('Error fetching tracker timestamp:', error);
                                                                                                                                        reject(error)
                                                                                                                                    }
                                                                                                                                
                                                                                                                                    else{
                                                                                                                                        const trackerTimestamp = new Date(results[0].tracker_message_timestamp_column);
                                                                                                                                        const timeDifference = currentTime.getTime() - trackerTimestamp.getTime();
                                                                                                                                        const hoursDifference = timeDifference / (1000 * 60 * 60);
                                                                                                                                
                                                                                                                                        if (hoursDifference >= 24) {
                                                                                                                                            console.log("Current time is at least 24 hours after the timestamp from the query.");
                                                                                                                                            const updateMessagesStreak = `
                                                                                                                                            UPDATE users
                                                                                                                                            SET messaging_streak = CASE 
                                                                                                                                                    WHEN NOW() BETWEEN DATE_ADD(messaging_timestamp_column, INTERVAL 24 HOUR) AND DATE_ADD(messaging_timestamp_column, INTERVAL 48 HOUR) THEN messaging_streak + 1 
                                                                                                                                                    
                                                                                                                                                    ELSE 1
                                                                                                                                                END,
                                                                                                                                                tracker_message_timestamp_column = CASE
                                                                                                                                                    WHEN NOW() BETWEEN DATE_ADD(tracker_message_timestamp_column, INTERVAL 24 HOUR) AND DATE_ADD(tracker_message_timestamp_column, INTERVAL 48 HOUR) THEN NOW()
                                                                                                                                                    WHEN NOW() > DATE_ADD(tracker_message_timestamp_column, INTERVAL 48 HOUR) THEN NOW()
                                                                                                                                                    ELSE tracker_message_timestamp_column
                                                                                                                                                END,
                                                                                                                                                messaging_timestamp_column = CASE
                                                                                                                                                    WHEN NOW() BETWEEN DATE_ADD(messaging_timestamp_column, INTERVAL 24 HOUR) AND DATE_ADD(messaging_timestamp_column, INTERVAL 48 HOUR) THEN NOW()
                                                                                                                                                    WHEN NOW() > DATE_ADD(messaging_timestamp_column, INTERVAL 48 HOUR) THEN NOW()
                                                                                                                                                    ELSE messaging_timestamp_column
                                                                                                                                                END
                                                                                                                                            WHERE id = ?;
                                                                                                                                            `;
                                                                                                                                            pool.query(updateMessagesStreak, [senderID], (updateError, result) => {
                                                                                                                                                if(updateError){
                                                                                                                                                    reject(updateError);
                                                                                                                                                }else{
                                                                                                                                                    resolve({success: true});
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                        }else{
                                                                                                                                            console.log("Wasnt 24 hours after.")
                                                                                                                                        }
                                                                                                                                        resolve({success: true});
                                                                                                                                    }
                                                                                                                                });
                                                                                                                            }
                                                                                                                        })
                                                                                                                    

                                                                                                                }
                                                                                                            });
                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    });
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                    
                                                                
                                                                    
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
                                })
                            }

                        }
                        else{
                            resolve({success: false, message: "User has exceeded maximum of 3 messages per day."});
                        }

                    }
                })

            }
            else{
                try{
                    const feed = await sendAdditionalMessages(token, message, senderID, recieverID);
                    res.json({results: feed})
                }catch(error){
                    resolve({success: false, message: "Error in sending new message"});
                }

            }
          });
          
    });
};