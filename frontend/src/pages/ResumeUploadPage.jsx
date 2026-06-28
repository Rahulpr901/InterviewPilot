import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getResumes, uploadResume } from '../api/resumeApi';

const ResumeUploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(null);
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  const handleDrop = (event) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const response = await getResumes();
        setResumes(response.data.resumes || []);
        const storedResume = localStorage.getItem('interviewpilot_resume');
        if (storedResume) {
          setResume(JSON.parse(storedResume));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadResumes();
  }, []);

  const selectResume = (item) => {
    localStorage.setItem('interviewpilot_resume', JSON.stringify(item));
    setResume(item);
    toast.success('Resume selected for interview');
  };

  const handleUpload = async () => {
    if (!file) {
      return toast.error('Please select a PDF resume');
    }
    if (file.type !== 'application/pdf') {
      return toast.error('Only PDF files are accepted');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size must be under 5MB');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await uploadResume(formData);
      const uploadedResume = response.data.resume;
      setResume(uploadedResume);
      localStorage.setItem('interviewpilot_resume', JSON.stringify(uploadedResume));
      setResumes((current) => [uploadedResume, ...current]);
      toast.success('Resume uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Upload your resume</h1>
            <p className="mt-2 text-slate-400">Upload a PDF resume and generate a personalized interview based on your experience.</p>
          </div>
          <button onClick={() => navigate('/')} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
            Back to dashboard
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="mt-8 flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center transition hover:border-slate-500"
        >
          <div>
            <p className="text-slate-400">Drag & drop your PDF resume here, or</p>
            <input type="file" accept="application/pdf" onChange={handleFileChange} className="mt-4 text-slate-200" />
            {file && <p className="mt-3 text-sky-400">Selected file: {file.name}</p>}
          </div>
        </div>
        <button onClick={handleUpload} disabled={loading} className="mt-8 rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? 'Uploading...' : 'Upload & Analyze'}
        </button>

        {resume && (
          <div className="mt-10 rounded-3xl bg-slate-950 p-6">
            <h2 className="text-xl font-semibold">Resume analysis complete</h2>
            <p className="mt-3 text-slate-300">Score: <span className="font-semibold text-sky-400">{resume.score}</span></p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900 p-4">
                <h3 className="font-semibold text-white">Strengths</h3>
                <ul className="mt-3 space-y-2 text-slate-300">
                  {(resume.strengths || []).map((item, index) => (<li key={index}>• {item}</li>))}
                </ul>
              </div>
              <div className="rounded-3xl bg-slate-900 p-4">
                <h3 className="font-semibold text-white">Weaknesses</h3>
                <ul className="mt-3 space-y-2 text-slate-300">
                  {(resume.weaknesses || []).map((item, index) => (<li key={index}>• {item}</li>))}
                </ul>
              </div>
            </div>
            <button onClick={() => navigate('/interview')} className="mt-8 rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
              Start Interview
            </button>
          </div>
        )}
        {resumes.length > 0 && (
          <div className="mt-10 rounded-3xl bg-slate-950 p-6">
            <h2 className="text-xl font-semibold">Your Uploaded Resumes</h2>
            <p className="mt-2 text-slate-400">Select any resume for your next interview.</p>
            <div className="mt-6 grid gap-4">
              {resumes.map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-3xl bg-slate-900 p-4">
                  <div>
                    <p className="font-semibold text-white">{item.fileName}</p>
                    <p className="text-sm text-slate-400">Score: {item.score || 'N/A'}</p>
                  </div>
                  <button onClick={() => selectResume(item)} className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadPage;
