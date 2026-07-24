// config/db.js
// Sets up and exports a reusable MySQL connection pool using mysql2/promise.
// A pool is used (instead of a single connection) so multiple requests can
// be handled concurrently without manually opening/closing connections.

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Quick sanity check on startup so connection issues surface immediately
// in the server logs instead of failing silently on the first request.
(async function verifyConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id                 INT AUTO_INCREMENT PRIMARY KEY,
        full_name          VARCHAR(150)      NOT NULL,
        phone              VARCHAR(10)       NOT NULL,
        email              VARCHAR(150)      NOT NULL,
        overall_rating     TINYINT UNSIGNED  NOT NULL,
        food_quality       TINYINT UNSIGNED  DEFAULT 0,
        taste              TINYINT UNSIGNED  DEFAULT 0,
        service            TINYINT UNSIGNED  DEFAULT 0,
        staff_behaviour    TINYINT UNSIGNED  DEFAULT 0,
        cleanliness        TINYINT UNSIGNED  DEFAULT 0,
        ambience           TINYINT UNSIGNED  DEFAULT 0,
        waiting_time       TINYINT UNSIGNED  DEFAULT 0,
        value_for_money    TINYINT UNSIGNED  DEFAULT 0,
        emoji_reaction     VARCHAR(20)       DEFAULT NULL,
        visit_again        VARCHAR(10)       NOT NULL,
        recommend          VARCHAR(15)       NOT NULL,
        menu_items         JSON              DEFAULT NULL,
        experience         TEXT              DEFAULT NULL,
        suggestions        TEXT              DEFAULT NULL,
        created_at         TIMESTAMP         DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Table "feedbacks" verified/created successfully.');
    connection.release();
  } catch (error) {
    console.error('❌ Failed to connect or initialize MySQL database:', error.message);
  }
})();

module.exports = pool;
