import express from 'express';
import { getUsers } from './endpoints/getAllUsers.js'
import { loginUser } from './endpoints/loginUser.js'
import { createUser } from './endpoints/createUser.js';
import { authenticateUser } from './endpoints/authenticateUser.js';
import { showItemsInFeed } from './endpoints/showUsersInFeed.js';

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
    if(typeOfVerification === 'access'){
      verifyUser = await authenticateUser(req,true);
    }else{
      verifyUser = await authenticateUser(req,false);
    }
    if(verifyUser['success'] === true){
      // show the person their feed !!
      const feed = await showItemsInFeed(req);
      res.json({success: true, results: feed})

    }else{
      res.json({message: "We were unable to proceed in showItemsInFeed route."})
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error showItemsInFeed route.');
  }
});
