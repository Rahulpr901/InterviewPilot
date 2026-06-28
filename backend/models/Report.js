const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    interviewSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
    },
    overallScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    technicalScore: { type: Number, default: 0 },
    resumeConfidence: { type: Number, default: 0 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendedTopics: { type: [String], default: [] },
    recommendation: { type: String, default: "Needs improvement" },
    feedback: { type: String, default: "" },
    questionFeedback: { type: [Object], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
