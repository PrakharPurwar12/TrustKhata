import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithTransition } from '../utils/navigateWithTransition';

const Register = () => {
  const navigate = useNavigate();
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    setShowPage(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 [view-transition-name:auth-page]">
      <div
        className={`mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl transition-all duration-500 md:grid-cols-2 ${
          showPage ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-center px-6 py-10 md:px-10">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Register
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Create your TrustKhata account
            </h1>

            <form className="mt-8 space-y-5" onSubmit={(e) => { e.preventDefault(); navigateWithTransition(navigate, '/onboarding'); }}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  placeholder="Prakhar Sharma"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create password"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-slate-950"
              >
                Create account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigateWithTransition(navigate, '/login')}
                className="font-semibold text-emerald-600 transition hover:text-emerald-500"
              >
                Login here
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-8 text-white md:p-12">
          <div className="max-w-md">
            <p className="inline-flex rounded-full border border-white/15 px-4 py-1 text-sm text-white/70">
              TrustKhata
            </p>
            <h2 className="mt-5 text-4xl font-bold leading-tight">
              Register once. Start tracking your udhar flow instantly.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
