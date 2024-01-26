import { createPool } from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const pool = createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

export default pool;