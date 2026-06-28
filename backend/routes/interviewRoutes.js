const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  startInterview,
  submitAnswer,
  endInterview,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/start", protect, startInterview);
router.post("/answer", protect, submitAnswer);
router.post("/end", protect, endInterview);

module.exports = router;
