// controllers/feedbackController.js
// Request handlers for feedback endpoints. Talks to the model layer and
// shapes HTTP responses; contains no raw SQL.

const feedbackModel = require('../models/feedbackModel');

// Maps the star-rating category labels sent by the frontend (e.g. "Food
// Quality") to their snake_case database column names (e.g. "food_quality").
function toSnakeCase(label) {
  return label.toLowerCase().trim().replace(/\s+/g, '_');
}

/**
 * POST /api/feedback
 * Save a new feedback submission.
 */
async function submitFeedback(req, res) {
  try {
    const {
      fullName,
      phone,
      email,
      overall,
      ratings = {},
      emojiReaction,
      visitAgain,
      recommend,
      menuItems = [],
      experience,
      suggestions,
    } = req.body;

    // Flatten the `ratings` object (keyed by category label) into the
    // individual columns expected by the model/table.
    const ratingByColumn = {};
    Object.entries(ratings).forEach(([label, value]) => {
      ratingByColumn[toSnakeCase(label)] = value;
    });

    const feedback = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      overall,
      foodQuality: ratingByColumn.food_quality || 0,
      taste: ratingByColumn.taste || 0,
      service: ratingByColumn.service || 0,
      staffBehaviour: ratingByColumn.staff_behaviour || 0,
      cleanliness: ratingByColumn.cleanliness || 0,
      ambience: ratingByColumn.ambience || 0,
      waitingTime: ratingByColumn.waiting_time || 0,
      valueForMoney: ratingByColumn.value_for_money || 0,
      emojiReaction: emojiReaction || null,
      visitAgain,
      recommend,
      menuItems,
      experience,
      suggestions,
    };

    await feedbackModel.createFeedback(feedback);

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
    });
  } catch (error) {
    console.error('Error in submitFeedback:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit feedback. Please try again.',
    });
  }
}

/**
 * GET /api/feedback
 * Return all feedback records.
 */
async function getAllFeedback(req, res) {
  try {
    const feedbacks = await feedbackModel.getAllFeedback();
    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    console.error('Error in getAllFeedback:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch feedback records.',
    });
  }
}

/**
 * GET /api/feedback/:id
 * Return a single feedback record.
 */
async function getFeedbackById(req, res) {
  try {
    const { id } = req.params;
    const feedback = await feedbackModel.getFeedbackById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: `Feedback record with id ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Error in getFeedbackById:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch the feedback record.',
    });
  }
}

/**
 * DELETE /api/feedback/:id
 * Delete a feedback record.
 */
async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;
    const deleted = await feedbackModel.deleteFeedbackById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Feedback record with id ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteFeedback:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete the feedback record.',
    });
  }
}

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
};
