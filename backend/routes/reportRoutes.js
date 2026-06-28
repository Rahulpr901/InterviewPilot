const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getReports,
  getReportById,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/", protect, getReports);
router.get("/:id", protect, getReportById);

module.exports = router;
