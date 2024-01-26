import express from 'express';
import { getUsers } from './endpoints/getAllUsers.js'
import { loginUser } from './endpoints/loginUser.js'
import { createUser } from './endpoints/createUser.js';

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
      res.status(500).send('Internal Server Error boi');
    }
});

app.post('/createUser', async (req, res) => {
  try {
    const user = await createUser(req);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error boi');
  }
});
