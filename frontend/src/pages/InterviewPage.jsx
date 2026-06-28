import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { startInterview, submitAnswer, endInterview } from '../api/interviewApi';

const InterviewPage = () => {
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [report, setReport] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const { listening, transcript, error, start, stop, setTranscript } = useSpeechRecognition();
  const navigate = useNavigate();

  useEffect(() => {
    const resume = localStorage.getItem('interviewpilot_resume');
    if (!resume) {
      navigate('/upload');
      return;
    }
    setResumeId(JSON.parse(resume)._id);
  }, [navigate]);

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (!session || interviewComplete) return;
    setTimeLeft(120);
  }, [session, currentQuestionIndex, interviewComplete]);

  useEffect(() => {
    if (!session || interviewComplete) return;
    const interval = setInterval(() => {
      setTimeLeft((time) => Math.max(0, time - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [session, currentQuestionIndex, interviewComplete]);

  const canContinue = useMemo(
    () => answer.trim().length > 0 && timeLeft > 0,
    [answer, timeLeft],
  );

  const handleStart = async () => {
    if (!resumeId) {
      toast.error('No resume selected for this interview');
      return;
    }
    setLoading(true);
    try {
      const response = await startInterview({ resumeId });
      setSession(response.data.session);
      toast.success('Interview session started');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session) return;
    const question = session.questions[currentQuestionIndex];
    setLoading(true);
    try {
      const response = await submitAnswer({
        sessionId: session._id,
        questionId: question.id,
        answer,
      });
      setEvaluation(response.data.evaluation);
      setAnswer('');
      setTranscript('');

      if (currentQuestionIndex + 1 < session.questions.length) {
        setCurrentQuestionIndex((index) => index + 1);
      } else {
        setInterviewComplete(true);
        toast.success('You finished all questions. Finish the interview to generate your report.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const response = await endInterview({ sessionId: session._id });
      setReport(response.data.report);
      toast.success('Interview completed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to finish interview');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen px-6 py-10 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold">Resume Interview</h1>
          <p className="mt-3 text-slate-400">Your interview will be generated from your resume analysis and personalized questions.</p>
          <button onClick={handleStart} disabled={loading} className="mt-8 rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            {loading ? 'Preparing interview...' : 'Start Interview'}
          </button>
        </div>
      </div>
    );
  }

  const question = session.questions[currentQuestionIndex] || {};
  const isFinalQuestion = currentQuestionIndex === session.questions.length - 1;

  return (
    <div className="min-h-screen px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-5xl rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Interview in progress</h1>
            <p className="mt-2 text-slate-400">Answer questions one by one. You can use voice to dictate your response.</p>
          </div>
          <button onClick={handleEnd} disabled={loading} className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400">
            End Interview
          </button>
        </div>

        <div className="mt-8 rounded-3xl bg-slate-950 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-slate-400">Question {currentQuestionIndex + 1} of {session.questions.length}</p>
              <h2 className="mt-2 text-2xl font-semibold">{question?.text}</h2>
            </div>
            <div className="rounded-3xl bg-slate-900 px-4 py-3 text-slate-200">
              Timer: {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
              className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-4 text-slate-100 focus:border-sky-500"
              placeholder="Type or speak your answer here..."
            />
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={listening ? stop : start} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                {listening ? 'Stop Recording' : 'Start Voice Answer'}
              </button>
              <button onClick={() => setAnswer(transcript)} className="rounded-2xl bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600">
                Use Transcript
              </button>
              {error && <p className="text-sm text-rose-400">{error}</p>}
            </div>
            <div className="flex justify-between gap-3">
              <button onClick={handleSubmitAnswer} disabled={!canContinue || loading} className="rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">
                {isFinalQuestion ? 'Submit Final Answer' : 'Submit Answer'}
              </button>
              <button onClick={handleEnd} disabled={loading} className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                Finish Interview
              </button>
            </div>
          </div>

          {timeLeft === 0 && (
            <div className="mt-8 rounded-3xl bg-amber-900 p-6 text-amber-100">
              <p className="font-semibold">Time expired for this question.</p>
              <p>Please submit your current answer or finish the interview.</p>
            </div>
          )}
          {evaluation && (
            <div className="mt-8 rounded-3xl bg-slate-800 p-6">
              <h3 className="text-xl font-semibold">Previous Answer Evaluation</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Score</p>
                  <p className="mt-2 text-2xl font-semibold text-sky-400">{evaluation.score}</p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Communication</p>
                  <p className="mt-2 text-2xl font-semibold text-sky-400">{evaluation.communication}</p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Technical Accuracy</p>
                  <p className="mt-2 text-2xl font-semibold text-sky-400">{evaluation.technicalAccuracy}</p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Confidence</p>
                  <p className="mt-2 text-2xl font-semibold text-sky-400">{evaluation.confidence}</p>
                </div>
              </div>
              {evaluation.suggestedBetterAnswer && (
                <div className="mt-4 rounded-3xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Suggested Better Answer</p>
                  <p className="mt-2 text-slate-200">{evaluation.suggestedBetterAnswer}</p>
                </div>
              )}
              {evaluation.followUpQuestion && (
                <div className="mt-4 rounded-3xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Follow-up Question</p>
                  <p className="mt-2 text-slate-200">{evaluation.followUpQuestion}</p>
                </div>
              )}
            </div>
          )}

          {report && (
            <div className="mt-8 rounded-3xl bg-slate-950 p-6">
              <h3 className="text-xl font-semibold">Interview Report</h3>
              <p className="mt-2 text-slate-400">Overall score: {report.overallScore}</p>
              <p className="mt-3 text-slate-300">Recommendation: {report.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
