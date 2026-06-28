const express = require("express");
const authRoutes = require("./authRoutes");
const resumeRoutes = require("./resumeRoutes");
const interviewRoutes = require("./interviewRoutes");
const reportRoutes = require("./reportRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/resume", resumeRoutes);
router.use("/interview", interviewRoutes);
router.use("/reports", reportRoutes);

module.exports = router;
