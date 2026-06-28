const Report = require("../models/Report");

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      "interviewSession",
    );
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};
