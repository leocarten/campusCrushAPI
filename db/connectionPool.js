import { createPool } from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const pool = createPool({
  host: process.env.HOST_id,
  user: process.env.USER_id,
  password: process.env.PASSWORD_id,
  database: process.env.DATABASE_id
});

export default pool;
