// routes/feedbackRoutes.js
// Defines all /api/feedback endpoints and wires validation + controllers.

const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const feedbackController = require('../controllers/feedbackController');
const {
  feedbackValidationRules,
  handleValidationErrors,
} = require('../middleware/validation');

// Validates that :id route params are positive integers.
const idParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Feedback id must be a positive integer.'),
  handleValidationErrors,
];

// POST /api/feedback — create a new feedback entry
router.post(
  '/',
  feedbackValidationRules,
  handleValidationErrors,
  feedbackController.submitFeedback
);

// GET /api/feedback — list all feedback entries
router.get('/', feedbackController.getAllFeedback);

// GET /api/feedback/:id — get a single feedback entry
router.get('/:id', idParamValidation, feedbackController.getFeedbackById);

// DELETE /api/feedback/:id — delete a feedback entry
router.delete('/:id', idParamValidation, feedbackController.deleteFeedback);

module.exports = router;
