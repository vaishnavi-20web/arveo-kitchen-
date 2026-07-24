// middleware/validation.js
// Validation rules and the error-handling middleware for feedback submissions.
// Uses express-validator to declaratively check incoming request bodies.

const { body, validationResult } = require('express-validator');

// Validation chain for POST /api/feedback
const feedbackValidationRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long.'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^\d{10}$/)
    .withMessage('Phone number must contain exactly 10 digits.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.'),

  body('overall')
    .notEmpty()
    .withMessage('Overall rating is required.')
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall rating must be a number between 1 and 5.'),

  body('visitAgain')
    .trim()
    .notEmpty()
    .withMessage('Please select whether you would visit again.')
    .isIn(['Yes', 'Maybe', 'No'])
    .withMessage('Visit again must be one of: Yes, Maybe, No.'),

  body('recommend')
    .trim()
    .notEmpty()
    .withMessage('Please select whether you would recommend us.')
    .isIn(['Definitely', 'Maybe', 'No'])
    .withMessage('Recommend must be one of: Definitely, Maybe, No.'),

  // Optional fields — validated only if present, never block submission
  body('ratings').optional().isObject().withMessage('Ratings must be an object.'),
  body('emojiReaction').optional().isString(),
  body('menuItems').optional().isArray().withMessage('Menu items must be an array.'),
  body('experience').optional().isString().isLength({ max: 500 }),
  body('suggestions').optional().isString(),
];

// Middleware that inspects the validation results and responds with a
// standardized 422 error if any rule failed. Placed after the rules array
// in the route definition.
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check the highlighted fields.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
}

module.exports = {
  feedbackValidationRules,
  handleValidationErrors,
};
