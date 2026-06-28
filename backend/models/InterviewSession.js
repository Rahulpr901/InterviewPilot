const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    type: { type: String, default: "resume", enum: ["resume"] },
    questions: { type: [Object], default: [] },
    responses: { type: [Object], default: [] },
    scores: {
      overall: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    report: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
