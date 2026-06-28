const Resume = require("../models/Resume");
const InterviewSession = require("../models/InterviewSession");
const Report = require("../models/Report");
const aiProvider = require("../services/ai/aiProvider");

exports.startInterview = async (req, res, next) => {
  try {
    const { resumeId } = req.body;
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const questionsResponse = await aiProvider.generateInterviewQuestions(
      resume.extractedText,
    );
    const questions = questionsResponse.questions || [];

    const session = await InterviewSession.create({
      user: req.user._id,
      resume: resume._id,
      questions: questions.map((question, index) => ({
        id: index + 1,
        text: question,
      })),
      status: "in_progress",
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, questionId, answer } = req.body;
    const numericQuestionId = Number(questionId);
    const session =
      await InterviewSession.findById(sessionId).populate("resume");
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (session.status !== "in_progress") {
      return res
        .status(400)
        .json({ success: false, message: "Interview not active" });
    }

    if (!Number.isInteger(numericQuestionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid questionId is required" });
    }

    if (!answer || !answer.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Answer is required" });
    }

    const question = session.questions.find(
      (q) => Number(q.id) === numericQuestionId,
    );
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    const evaluation = await aiProvider.evaluateAnswer({
      resumeText: session.resume.extractedText,
      question: question.text,
      answer: answer.trim(),
    });

    session.responses.push({
      questionId: numericQuestionId,
      question: question.text,
      answer: answer.trim(),
      evaluation,
    });
    await session.save();

    res.json({ success: true, evaluation });
  } catch (err) {
    next(err);
  }
};

exports.endInterview = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const session =
      await InterviewSession.findById(sessionId).populate("resume");
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (session.status !== "in_progress") {
      return res
        .status(400)
        .json({ success: false, message: "Interview already completed" });
    }

    const summary = await aiProvider.summarizeInterview({
      resumeText: session.resume.extractedText,
      session,
    });

    const report = await Report.create({
      user: req.user._id,
      interviewSession: session._id,
      overallScore: summary.overallScore || 0,
      communicationScore: summary.communicationScore || 0,
      technicalScore: summary.technicalScore || 0,
      resumeConfidence: summary.resumeConfidence || 0,
      strengths: summary.topStrengths || [],
      weaknesses: summary.topWeaknesses || [],
      recommendedTopics: summary.recommendedTopics || [],
      recommendation: summary.hiringRecommendation || "Needs improvement",
      feedback: summary.detailedFeedback || "",
      questionFeedback: summary.questionFeedback || [],
    });

    session.status = "completed";
    session.report = report._id;
    await session.save();

    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};
