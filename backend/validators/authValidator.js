const { body, validationResult } = require("express-validator");

exports.registerValidator = async (req, res, next) => {
  await body("name").notEmpty().withMessage("Name is required").run(req);
  await body("email").isEmail().withMessage("Valid email is required").run(req);
  await body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

exports.loginValidator = async (req, res, next) => {
  await body("email").isEmail().withMessage("Valid email is required").run(req);
  await body("password")
    .notEmpty()
    .withMessage("Password is required")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};
