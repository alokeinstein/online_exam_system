// config/db.js

import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'online_exam',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 5432,
});

export default pool;







// const { Pool } = require('pg');
// require('dotenv').config();

// // This configuration is taken directly from your working file
// const pool = new Pool({
//   user: process.env.DB_USER || "postgres",
//   host: process.env.DB_HOST || "localhost",
//   database: process.env.DB_DATABASE || "online_exam",
//   password: process.env.DB_PASSWORD || "admin",
//   port: parseInt(process.env.DB_PORT) || 5432,
// });

// // We export the pool directly to be used for querying
// module.exports = pool;
