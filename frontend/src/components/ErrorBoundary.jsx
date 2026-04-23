import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center">
          <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-200">
             <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
             </div>
             <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Something went wrong.</h2>
             <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                The application encountered an unexpected error. Don't worry, your data is safe.
             </p>
             <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-5 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
             >
                Return to Home
             </button>
             <p className="mt-8 text-[10px] uppercase font-black tracking-widest text-slate-300">
                Error Code: RUNTIME_CRASH_PROTECTED
             </p>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
