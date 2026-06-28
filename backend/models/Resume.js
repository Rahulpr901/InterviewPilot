const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    extractedText: { type: String, required: true },
    parsedData: { type: Object, default: {} },
    score: { type: Number, default: 0 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Resume", resumeSchema);
