const fs = require("fs");
const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");
const aiProvider = require("../services/ai/aiProvider");

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Resume file is required" });
    }
    const dataBuffer = fs.readFileSync(req.file.path);
    const parsed = await pdfParse(dataBuffer);
    const extractedText = parsed.text || "";

    const analysis = await aiProvider.analyzeResume(extractedText);
    const parsedData = analysis || {};
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.filename,
      filePath: req.file.path,
      extractedText,
      parsedData,
      score: parsedData.resumeScore || 0,
      strengths: parsedData.strengths || [],
      weaknesses: parsedData.weaknesses || [],
      missingSkills: parsedData.missingSkills || [],
      suggestions: parsedData.suggestedImprovements || [],
    });

    res.status(201).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

exports.getUserResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, resumes });
  } catch (err) {
    next(err);
  }
};

exports.getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }
    if (resume.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};
