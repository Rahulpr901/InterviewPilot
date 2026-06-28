const express = require("express");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerValidator, registerUser);
router.post("/login", loginValidator, loginUser);

module.exports = router;
