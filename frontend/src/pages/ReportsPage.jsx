import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { getReports } from '../api/reportApi';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await getReports();
        setReports(response.data.reports);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Unable to load reports');
      }
    };
    loadReports();
  }, []);

  const downloadReportPdf = (report) => {
    const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
    pdf.setFontSize(18);
    pdf.text('InterviewPilot Report', 40, 50);
    pdf.setFontSize(12);
    pdf.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, 40, 80);
    pdf.text(`Overall Score: ${report.overallScore}`, 40, 100);
    pdf.text(`Recommendation: ${report.recommendation}`, 40, 120);
    pdf.text(`Communication: ${report.communicationScore}`, 40, 140);
    pdf.text(`Technical: ${report.technicalScore}`, 40, 160);
    pdf.text(`Resume Confidence: ${report.resumeConfidence}`, 40, 180);
    pdf.text('Strengths:', 40, 210);
    pdf.text(report.strengths.join(', ') || 'None', 60, 230, { maxWidth: 500 });
    pdf.text('Weaknesses:', 40, 260);
    pdf.text(report.weaknesses.join(', ') || 'None', 60, 280, { maxWidth: 500 });
    pdf.text('Recommended Topics:', 40, 310);
    pdf.text(report.recommendedTopics.join(', ') || 'None', 60, 330, { maxWidth: 500 });
    pdf.text('Feedback:', 40, 360);
    pdf.text(report.feedback || 'No additional feedback', 60, 380, { maxWidth: 500 });
    pdf.save(`interview-report-${report._id}.pdf`);
  };

  return (
    <div className="min-h-screen px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-5xl rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
        <h1 className="text-3xl font-semibold">Interview Reports</h1>
        <p className="mt-2 text-slate-400">Review past resume interview results and learn what to improve next.</p>
        <div className="mt-8 grid gap-6">
          {reports.length ? reports.map((report) => (
            <div key={report._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{new Date(report.createdAt).toLocaleDateString()}</h2>
                  <p className="text-slate-400">Recommendation: {report.recommendation}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-3xl bg-slate-800 px-4 py-2 text-slate-200">Score: {report.overallScore}</div>
                  <button onClick={() => downloadReportPdf(report)} className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">Download PDF</button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">Communication</p>
                  <p className="mt-2 text-lg font-semibold text-sky-400">{report.communicationScore}</p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">Technical</p>
                  <p className="mt-2 text-lg font-semibold text-sky-400">{report.technicalScore}</p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">Resume confidence</p>
                  <p className="mt-2 text-lg font-semibold text-sky-400">{report.resumeConfidence}</p>
                </div>
              </div>
            </div>
          )) : (
            <p className="mt-8 text-slate-400">No reports available yet. Complete an interview to generate your first report.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
