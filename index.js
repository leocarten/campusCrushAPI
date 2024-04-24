import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { getUsers } from './endpoints/getAllUsers.js'
import { loginUser } from './endpoints/loginUser.js'
import { createUser } from './endpoints/createUser.js';
import { authenticateUser } from './endpoints/authenticateUser.js';
import { showItemsInFeed } from './endpoints/showUsersInFeed.js';
import { viewUserProfile } from './endpoints/viewUserProfile.js';
import { updateUserProfile } from './endpoints/updateUserProfile.js';
import { sendFirstMessage } from './endpoints/sendFirstMessage.js';
import { sendAdditionalMessages } from './endpoints/sendAdditionalMessages.js';
import { getMessages } from './endpoints/getMessages.js';
import { displayConversations } from './endpoints/displayMessagesOnConversationsPage.js';
import { socketTesting } from './endpoints/testSocket.js';
import cors from 'cors';
import { authenticateUserInSocket } from './sockets/authenticateUserInSocket.js';
import { viewPoints } from './endpoints/viewPoints.js';
import { lotterySpin } from './store/lotterySpin.js';
import { deleteConversation } from './endpoints/deleteConversation.js';
import { buyAdditionalMessage } from './store/addMessage.js';
import { deleteAcc } from './endpoints/deleteAccount.js';
import { userInfo } from './endpoints/userInfoForSettingsPage.js';
import { changePassword } from './endpoints/changePassword.js';
import { changeUsername } from './endpoints/changeUsername.js';

// ports
const WS_PORT = 5002; // WebSocket server port
const API_PORT = 5001;

const app = express();
const server = http.createServer(app); // Pass the express app to createServer

// Express setup
app.listen(API_PORT, () => console.log(`API server running on port ${API_PORT}`));
app.use(express.json());
app.use(cors());

// WebSocket server setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


// SOCKET STUFF BELOW
io.on('connection', (socket) => {
  console.log('A client connected');

  socket.on("join_conversation", (convoID) => {
      // Join the room corresponding to the conversation ID
      socket.join(convoID);
      console.log(`Socket ${socket.id} joined conversation room ${convoID}`);
  });

  socket.on("send_message", async (data) => {
      console.log("IN SEND MESSAGE")
      const jwt = data.jwt;
      const id1 = data.id1;
      const id2 = data.id2;
      const convoID = data.convoID;
      const messageContent = data.messageContent;
      const typeOfVerification = data.typeOfVerification;

      try {
          let verifyUser;
          if (typeOfVerification === 'access') {
              verifyUser = await authenticateUserInSocket(jwt, true);
          } else {
              verifyUser = await authenticateUserInSocket(jwt, false);
          }

          console.log("verify user:",verifyUser);

          if (verifyUser['success'] === true) {
              // Emit the message to clients in the conversation room
              io.to(convoID).emit('new_message', { message: messageContent });
              console.log("The user just said:",messageContent, "in room: ",convoID);
              // await sendAdditionalMessages(jwt, messageContent, id1, id2);
          } else {
              // Emit an error message to the client
              socket.emit('authentication_error', { message: "Authentication failed." });
          }
      } catch (err) {
          console.error(err.message);
          socket.emit('server_error', { message: 'Internal Server Error' });
      }
  });
});



// LISTEN FOR SOCKET CONNECTIONS
server.listen(WS_PORT, () => {
  console.log(`WebSocket server running on port ${WS_PORT}`);
});


app.post('/', async (req, res) => {
  try {
    const users = await getUsers(req);
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/login', async (req, res) => {
    try {
      const user = await loginUser(req);
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error from login route.');
    }
});


app.post('/createUser', async (req, res) => {
  try {
    const user = await createUser(req);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error createUser route.');
  }
});


app.post('/verifyUser', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    let verifyUser;
    if(typeOfVerification === 'access'){
      // don't need to do anything here
      verifyUser = await authenticateUser(req,true);
    }else{
      // we need to assign the user new JWT token
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true && typeOfVerification != 'access'){
      res.json({message:"We are now going to show the client what they want", verifyUser});
    }
    else if(verifyUser['success'] === true){
      res.json({message:"We are now going to show the client what they want and don't need to re-assign anything."});
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }
    else{
      res.json({message:"Sorry, you are not authorized to the see information you want"});
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error verifyUser route.');
  }
});


app.post('/showItemsInFeed', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      const clientRequestAmount = req.body['offset_amount'];
      // const clientRequestAmount = 0;
      const feed = await showItemsInFeed(tokenToUse, clientRequestAmount);
      res.json({success: true, results: feed})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }
    else{
      // this is where we can ask the client for their refresh token
      res.json({message: "We were unable to proceed in showItemsInFeed route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error showItemsInFeed route.');
  }
});


app.post('/viewUserProfile', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      console.log('token to use from view',tokenToUse);
      const thisUserProfile = await viewUserProfile(tokenToUse);
      res.json({success: true, results: thisUserProfile})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }
    else{
      res.json({message: "We were unable to proceed in showItemsInFeed route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error viewUserProfile route.');
  }
});


app.post('/updateUserProfile', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      console.log('token to use from view',tokenToUse);
      const thisUserProfile = await updateUserProfile(tokenToUse, req.body);
      res.json({success: true, results: thisUserProfile})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }
    else{
      res.json({message: "We were unable to proceed in updateUserProfile route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error showItemsInFeed route.');
  }
});


app.post('/sendFirstMessage', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    const message = req.body['message'];
    const recieverID = req.body['recieverID'];
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      const feed = await sendFirstMessage(tokenToUse, message, recieverID);
      res.json({results: feed})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }
    else{
      // this is where we can ask the client for their refresh token
      res.json({message: "We were unable to proceed in sendFirstMessage route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error sendFirstMessage route.');
  }
});


app.post('/sendAdditionalMessage', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    const message = req.body['message'];
    const id1 = req.body['id1'];
    const id2 = req.body['id2'];
    // console.log('in route, id1:',id1);
    // console.log('in route, id2:',id2);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      const feed = await sendAdditionalMessages(tokenToUse, message, id1, id2);
      res.json({results: feed})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }
    else{
      // this is where we can ask the client for their refresh token
      res.json({message: "We were unable to proceed in sendAdditionalMessages route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error sendAdditionalMessages route.');
  }
});


app.post('/getMessages', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    const senderID = req.body['id1'];
    const recieverID = req.body['id2'];
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      const feed = await getMessages(tokenToUse, senderID, recieverID);
      res.json({results: feed})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      // this is where we can ask the client for their refresh token
      res.json({message: "We were unable to proceed in getMessages route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error getMessages route.');
  }
});


app.post('/getConversations', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    let verifyUser;
    // const id1 = req.body['id1'];
    // const id2 = req.body['id2'];

    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      const feed = await displayConversations(tokenToUse);
      res.json({results: feed})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      // this is where we can ask the client for their refresh token
      res.json({message: "We were unable to proceed in getMessages route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error getMessages route.');
  }
});


app.post('/viewPoints', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      console.log('token to use from view',tokenToUse);
      const thisUserProfile = await viewPoints(tokenToUse);
      res.json({success: true, results: thisUserProfile})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      res.json({message: "We were unable to proceed in viewPoints route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error viewPoints route.');
  }
});


app.post('/lotterySpin', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      console.log('token to use from view',tokenToUse);
      const thisUserProfile = await lotterySpin(tokenToUse);
      res.json({success: true, results: thisUserProfile})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      res.json({message: "We were unable to proceed in viewPoints route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error viewPoints route.');
  }
});


app.post('/buyAdditionalMessage', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      console.log('token to use from view',tokenToUse);
      const thisUserProfile = await buyAdditionalMessage(tokenToUse);
      console.log('verify user: ',verifyUser)
      res.json({success: true, results: thisUserProfile})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      res.json({message: "We were unable to proceed in buyMessage route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error viewPoints route.');
  }
});


app.post('/deleteAccount', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      console.log('token to use from view',tokenToUse);
      const thisUserProfile = await deleteAcc(tokenToUse);
      res.json({success: true, results: thisUserProfile})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      res.json({message: "We were unable to proceed in buyMessage route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error viewPoints route.');
  }
});


app.post('/getUserInfoForSettingsPage', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      console.log('token to use from view',tokenToUse);
      const thisUserProfile = await userInfo(tokenToUse);
      res.json({success: true, results: thisUserProfile})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      res.json({message: "We were unable to proceed in userInfo route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error viewPoints route.');
  }
});


app.post('/changePassword', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      const new_password = req.body['new_password'];
      const thisUserProfile = await changePassword(tokenToUse, new_password);
      res.json({success: true, results: thisUserProfile})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      res.json({message: "We were unable to proceed in userInfo route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error viewPoints route.');
  }
});


app.post('/changeUsername', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      const new_username = req.body['new_username'];
      const thisUserProfile = await changeUsername(tokenToUse, new_username);
      res.json({success: true, results: thisUserProfile})
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      res.json({message: "We were unable to proceed in userInfo route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error viewPoints route.');
  }
});


app.post('/deleteConversation', async (req, res) => {
  try {
    const typeOfVerification = req.body['type'];
    console.log(typeOfVerification);
    let verifyUser;
    console.log("You just sent me:",typeOfVerification);
    if(typeOfVerification === 'access'){
      console.log("Reached access");
      verifyUser = await authenticateUser(req,true);
    }else{
      console.log("Else access")
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      const tokenToUse = req.body['tokenFromUser'];
      const convoID = req.body['convoID'];
      const id1 = req.body['id1'];
      const id2 = req.body['id2'];
      const id3 = req.body['id3'];
      console.log('token to use from view',tokenToUse);
      const thisUserProfile = await deleteConversation(tokenToUse, convoID, id1, id2, id3);
      res.json({success: true, results: thisUserProfile});
    }
    else if(verifyUser['success'] === -1){
      res.json({message:-1});
    }else{
      res.json({message: "We were unable to proceed in viewPoints route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error viewPoints route.');
  }
});