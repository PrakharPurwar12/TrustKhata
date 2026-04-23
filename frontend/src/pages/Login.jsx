import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { navigateWithTransition } from '../utils/navigateWithTransition';
import { userService } from '../services/userService';
import { parseApiError } from '../utils/apiError';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await userService.login({ email, password });
      navigateWithTransition(navigate, '/dashboard');
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
    >
      <div
        className="w-full max-w-5xl grid overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-slate-200 md:grid-cols-2"
      >
        {/* Left Side: Brand Visual */}
        <div className="relative hidden md:flex flex-col justify-between bg-emerald-600 p-12 text-white overflow-hidden">
          {/* Subtle Background pattern/glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl"></div>
          
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-bold text-2xl">T</div>
            <span className="font-bold text-2xl tracking-tight">TrustKhata</span>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Manage your shop's <br /> 
              <span className="text-emerald-100">Udhaar</span> with ease.
            </h1>
            <p className="mt-6 text-emerald-50/80 text-lg max-w-sm">
              The professional digital ledger for smart shopkeepers. Secure, private, and always backed up.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-emerald-100/60 text-sm font-medium">
            © {new Date().getFullYear()} TrustKhata Inc.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex items-center p-8 md:p-16">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
              <p className="mt-2 text-slate-500 font-medium">Sign in to your account to continue</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
                <label className="block text-sm font-bold text-slate-700">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-all focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-all focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-emerald-600 hover:shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:transform-none"
              >
                <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  Sign In 
                  <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500 font-medium">
                New to TrustKhata?{' '}
                <button
                  type="button"
                  onClick={() => navigateWithTransition(navigate, '/register')}
                  className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-4"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
