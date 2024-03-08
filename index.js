import express from 'express';
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

const app = express();
app.listen(5001,() => console.log("Api is running on port 5001"));


app.use(express.json());


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
      const feed = await showItemsInFeed(tokenToUse);
      res.json({success: true, results: feed})
    }else{
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
    }else{
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
    }else{
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
    }else{
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
      const feed = await sendAdditionalMessages(tokenToUse, message, recieverID);
      res.json({results: feed})
    }else{
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
      const feed = await getMessages(tokenToUse, recieverID);
      res.json({results: feed})
    }else{
      // this is where we can ask the client for their refresh token
      res.json({message: "We were unable to proceed in getMessages route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error getMessages route.');
  }
});