import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosClient from '../api/axiosClient';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ totalReports: 0, averageScore: 0, recentReports: [] });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axiosClient.get('/reports');
        const reports = response.data.reports || [];
        const averageScore = reports.length ? reports.reduce((sum, report) => sum + report.overallScore, 0) / reports.length : 0;
        setSummary({ totalReports: reports.length, averageScore, recentReports: reports.slice(0, 3) });
      } catch (err) {
        console.error(err);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen px-6 py-8 lg:px-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Welcome back, {user?.name}</h1>
          <p className="mt-2 text-slate-400">Upload your resume and start a personalized resume-driven interview.</p>
        </div>
        <button onClick={() => logout() || navigate('/login')} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
          Logout
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Resume Upload</h2>
          <p className="mt-2 text-slate-400">Upload your latest resume to generate tailored questions and a full report.</p>
          <Link to="/upload" className="mt-6 inline-flex rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            Upload Resume
          </Link>
        </div>
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Interview History</h2>
          <p className="mt-2 text-slate-400">Track your progress and revisit prior reports in one place.</p>
          <div className="mt-5 text-3xl font-semibold text-sky-400">{summary.totalReports}</div>
        </div>
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Average Score</h2>
          <p className="mt-2 text-slate-400">Strengthen your weak areas with every interview.</p>
          <div className="mt-5 text-3xl font-semibold text-sky-400">{summary.averageScore.toFixed(1)}</div>
        </div>
      </div>

      <section className="mt-10 rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Reports</h2>
          <Link to="/reports" className="text-sky-400 hover:text-sky-300">View all</Link>
        </div>
        {summary.recentReports.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {summary.recentReports.map((report) => (
              <div key={report._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between text-slate-300">
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">{report.recommendation}</span>
                </div>
                <p className="mt-4 text-white">Overall score: <span className="font-semibold text-sky-400">{report.overallScore}</span></p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-slate-400">No reports yet. Upload a resume and start your first interview.</p>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
