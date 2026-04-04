import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithTransition } from '../utils/navigateWithTransition';

const Login = () => {
  const navigate = useNavigate();
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    setShowPage(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white [view-transition-name:auth-page]">
      <div
        className={`mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur transition-all duration-500 md:grid-cols-2 ${
          showPage ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-center bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-900 p-8 md:p-12">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/20 px-4 py-1 text-sm text-white/80">
              TrustKhata
            </p>
            <h1 className="max-w-md text-4xl font-bold leading-tight md:text-5xl">
              Welcome back to your smart khata dashboard
            </h1>
            <p className="mt-5 max-w-md text-base text-white/75 md:text-lg">
              Manage customers, balances, and daily ledger activity in one place.
            </p>
          </div>
        </div>

        <div className="flex items-center bg-white px-6 py-10 text-slate-900 md:px-10">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Login
            </p>
            <h2 className="mt-3 text-3xl font-bold">Sign in to continue</h2>

            <form className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <button type="button" className="text-sm font-medium text-emerald-600">
                    Forgot?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                Login
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => navigateWithTransition(navigate, '/register')}
                className="font-semibold text-emerald-600 transition hover:text-emerald-500"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
