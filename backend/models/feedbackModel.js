// models/feedbackModel.js
// Data-access layer for the `feedbacks` table. All raw SQL lives here so
// controllers stay free of query strings (MVC separation of concerns).

const pool = require('../config/db');

/**
 * Insert a new feedback record.
 * @param {object} feedback - Sanitized feedback fields (see controller).
 * @returns {Promise<number>} The inserted row's id.
 */
async function createFeedback(feedback) {
  const {
    fullName,
    phone,
    email,
    overall,
    foodQuality,
    taste,
    service,
    staffBehaviour,
    cleanliness,
    ambience,
    waitingTime,
    valueForMoney,
    emojiReaction,
    visitAgain,
    recommend,
    menuItems,
    experience,
    suggestions,
  } = feedback;

  const sql = `
    INSERT INTO feedbacks (
      full_name, phone, email, overall_rating,
      food_quality, taste, service, staff_behaviour,
      cleanliness, ambience, waiting_time, value_for_money,
      emoji_reaction, visit_again, recommend, menu_items,
      experience, suggestions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    fullName,
    phone,
    email,
    overall,
    foodQuality,
    taste,
    service,
    staffBehaviour,
    cleanliness,
    ambience,
    waitingTime,
    valueForMoney,
    emojiReaction,
    visitAgain,
    recommend,
    JSON.stringify(menuItems || []),
    experience || null,
    suggestions || null,
  ];

  const [result] = await pool.execute(sql, values);
  return result.insertId;
}

/**
 * Fetch all feedback records, most recent first.
 * @returns {Promise<Array<object>>}
 */
async function getAllFeedback() {
  const [rows] = await pool.query(
    'SELECT * FROM feedbacks ORDER BY created_at DESC'
  );
  return rows;
}

/**
 * Fetch a single feedback record by id.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function getFeedbackById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM feedbacks WHERE id = ?',
    [id]
  );
  return rows.length ? rows[0] : null;
}

/**
 * Delete a feedback record by id.
 * @param {number} id
 * @returns {Promise<boolean>} true if a row was deleted.
 */
async function deleteFeedbackById(id) {
  const [result] = await pool.execute(
    'DELETE FROM feedbacks WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedbackById,
};
