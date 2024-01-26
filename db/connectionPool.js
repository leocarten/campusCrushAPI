import { createPool } from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.HOST_id);
console.log(process.env.USER_id);
console.log(process.env.PASSWORD_id);
console.log(process.env.DATABASE_id);

const pool = createPool({
  host: process.env.HOST_id,
  user: process.env.USER_id,
  password: process.env.PASSWORD_id,
  database: process.env.DATABASE_id
});

export default pool;
