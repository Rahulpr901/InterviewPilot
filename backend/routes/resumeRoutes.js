const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  uploadResume,
  getResumeById,
  getUserResumes,
} = require("../controllers/resumeController");

const router = express.Router();

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/", protect, getUserResumes);
router.get("/:id", protect, getResumeById);

module.exports = router;
