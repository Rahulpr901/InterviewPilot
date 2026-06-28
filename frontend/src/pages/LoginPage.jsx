import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
        <h1 className="text-3xl font-semibold text-white">Welcome Back</h1>
        <p className="mt-2 text-slate-400">Login to continue your interview journey.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <label className="block text-sm text-slate-300">Email</label>
          <input {...register('email', { required: true })} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" type="email" />
          <label className="block text-sm text-slate-300">Password</label>
          <input {...register('password', { required: true })} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" type="password" />
          <button type="submit" className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400">
            {formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          New here? <Link className="text-sky-400 hover:text-sky-300" to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
