import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  BarChart3, 
  Wallet, 
  CheckCircle2, 
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Store
} from 'lucide-react';

// --- Animated Wrapper ---
const FadeIn = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => domRef.current && observer.unobserve(domRef.current);
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Navbar ---
const Navbar = () => (
  <nav className="flex items-center justify-between py-8 px-8 max-w-7xl mx-auto backdrop-blur-sm fixed top-0 w-full z-50 left-1/2 -translate-x-1/2">
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
        <LayoutDashboard size={20} />
      </div>
      <span className="font-black text-2xl text-slate-900 tracking-tight">TrustKhata</span>
    </div>
    <div className="hidden md:flex items-center space-x-10 text-slate-500 font-bold text-sm uppercase tracking-widest">
      <a href="#features" className="hover:text-emerald-600 transition-colors">Solutions</a>
      <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it works</a>
    </div>
    <div className="flex items-center gap-4">
      <Link to="/login" className="hidden sm:block text-slate-600 hover:text-emerald-600 font-black text-xs uppercase tracking-widest transition-colors mr-4">
        Sign In
      </Link>
      <Link to="/register" className="bg-slate-900 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200 hover:shadow-emerald-100 active:scale-95">
        Get Started
      </Link>
    </div>
  </nav>
);

// --- Mock Dashboard UI (for Hero) ---
const MockDashboard = () => (
  <div className="relative w-full max-w-2xl mx-auto lg:mx-0">
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col p-6 animate-pulse-slow">
       {/* Sidebar/Top Nav Mock */}
       <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-xl bg-slate-100" />
             <div className="space-y-1.5 pt-1">
                <div className="h-3 w-24 bg-slate-100 rounded-full" />
                <div className="h-2 w-16 bg-slate-50 rounded-full" />
             </div>
          </div>
          <div className="flex gap-2">
             <div className="w-8 h-8 rounded-full bg-slate-100" />
          </div>
       </div>

       {/* Cards Mock */}
       <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-50 h-32 rounded-3xl p-4 flex flex-col justify-between border border-emerald-100">
             <ArrowUpRight size={16} className="text-emerald-600" />
             <div className="h-6 w-1/2 bg-emerald-200/50 rounded-md" />
          </div>
          <div className="bg-rose-50 h-32 rounded-3xl p-4 flex flex-col justify-between border border-rose-100">
             <ArrowDownLeft size={16} className="text-rose-600" />
             <div className="h-6 w-1/2 bg-rose-200/50 rounded-md" />
          </div>
       </div>

       {/* List Mock */}
       <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
               <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200" />
                  <div className="space-y-1.5 pt-1.5">
                     <div className="h-2.5 w-20 bg-slate-200 rounded-full" />
                     <div className="h-2 w-12 bg-slate-100 rounded-full" />
                  </div>
               </div>
               <div className="h-6 w-16 bg-white border border-slate-200 rounded-lg" />
            </div>
          ))}
       </div>
    </div>
    
    {/* Floaters */}
    <div className="absolute -bottom-8 -right-8 bg-emerald-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-bounce-gentle">
       <CheckCircle2 size={32} />
       <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-70">Payment Secured</p>
          <p className="font-bold text-lg leading-tight">₹ 1,500.00</p>
       </div>
    </div>
    
    {/* Background Glow */}
    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-100/50 blur-[100px] rounded-full" />
  </div>
);

// --- Hero ---
const Hero = () => (
  <header className="relative pt-44 pb-32 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-24">
    {/* Muted background gradient */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full overflow-hidden opacity-30">
       <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-100/30 blur-[120px] rounded-full" />
       <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-slate-200/40 blur-[120px] rounded-full" />
    </div>

    <div className="flex-1 space-y-10 text-center lg:text-left">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-emerald-100">
         <Wallet size={14} />
         The Smart Digital Ledger
      </div>
      <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter">
        Manage Your <br />
        <span className="text-emerald-600 block mt-2">Udhaar Smarter.</span>
      </h1>
      <p className="text-xl text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
        Replace your paper khata with a secure, professional SaaS dashboard. Track credits, payments, and balances with ease.
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-6">
        <Link to="/register" className="group bg-slate-900 hover:bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl shadow-slate-200 hover:shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95">
          Get Started
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <a href="#how-it-works" className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 px-10 py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 border border-slate-200 bg-white hover:bg-slate-50">
          How it works
        </a>
      </div>
    </div>
    <div className="flex-1 w-full flex justify-center lg:justify-end">
       <MockDashboard />
    </div>
  </header>
);

// --- Feature Section ---
const FeatureCard = ({ title, description, icon: Icon, colorClass }) => (
  <div className="group bg-white p-10 rounded-[2.5rem] shadow-sm/5 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-emerald-100 transition-all hover:-translate-y-2">
    <div className={`w-14 h-14 ${colorClass} flex items-center justify-center rounded-2xl mb-8 shadow-lg shadow-opacity-10 group-hover:scale-110 transition-transform`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
  </div>
);

const Features = () => (
  <section id="features" className="py-32 bg-slate-50">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
        <p className="text-xs font-black uppercase text-emerald-600 tracking-widest">Solutions</p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Everything you need</h2>
        <p className="text-lg text-slate-500 font-medium leading-relaxed">Tools designed specifically for the unorganized retail sector in India.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <FeatureCard 
          icon={Users}
          colorClass="bg-emerald-50 text-emerald-600"
          title="Customer CRM" 
          description="Maintain high-quality digital profiles for all your customers. Never lose a contact again." 
        />
        <FeatureCard 
          icon={BarChart3}
          colorClass="bg-blue-50 text-blue-600"
          title="Smart Ledger" 
          description="Add 'Gave' or 'Got' entries with one tap. The system intelligently handles the math for you." 
        />
        <FeatureCard 
          icon={ShieldCheck}
          colorClass="bg-violet-50 text-violet-600"
          title="Cloud Backup" 
          description="Your data is encrypted and saved in the cloud. Access your business from any device, anytime." 
        />
      </div>
    </div>
  </section>
);

// --- Steps Section ---
const HowItWorks = () => (
  <section id="how-it-works" className="py-40 bg-white">
    <div className="max-w-7xl mx-auto px-8">
      <div className="flex flex-col lg:flex-row items-center gap-24">
         <div className="flex-1 space-y-10">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Simple steps to <br/> <span className="text-emerald-600">Upgrade your shop.</span></h2>
            <div className="space-y-8">
               {[
                 { t: "Register your Merchant Shop", d: "Sign up with your business name and details in under 60 seconds." },
                 { t: "Add your Customers", d: "Onboard your regular customers to track their pending balances." },
                 { t: "Record Daily Entries", d: "Instantly record ogni udhaar or payment with clear digital notes." }
               ].map((s, i) => (
                 <div key={i} className="flex gap-6 items-start group">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-xl shadow-lg group-hover:bg-emerald-600 transition-colors">
                       {i+1}
                    </div>
                    <div>
                       <h4 className="text-xl font-bold text-slate-900 mb-1">{s.t}</h4>
                       <p className="text-slate-500 font-medium">{s.d}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="flex-1 bg-slate-50 rounded-[3rem] p-12 lg:p-20 border border-slate-100 flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-600/10 blur-[80px] rounded-full" />
            <div className="relative text-center space-y-6">
               <Store size={120} strokeWidth={1} className="text-emerald-600 mx-auto" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Merchant Ready</p>
            </div>
         </div>
      </div>
    </div>
  </section>
);

// --- CTA Section ---
const CTA = () => (
  <section className="pb-32 px-8 max-w-7xl mx-auto">
    <div className="bg-slate-950 rounded-[4rem] px-8 py-24 text-center text-white relative overflow-hidden shadow-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-2xl mx-auto space-y-10">
        <h2 className="text-5xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight">
          Join the Digital <br /> Revolution Today
        </h2>
        <p className="text-slate-400 text-lg font-medium">
          Ditch the old books. Join 10,000+ smart merchants who trust TrustKhata for their daily ledger needs.
        </p>
        <Link to="/register" className="group bg-white text-slate-950 px-12 py-5 rounded-[2.5rem] font-black text-xl transition-all shadow-xl hover:shadow-white/10 hover:-translate-y-1 inline-flex items-center gap-3">
          Launch Your Ledger
          <ChevronRight size={24} strokeWidth={3} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  </section>
);

// --- Main Page Component ---
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <footer className="bg-white py-16 border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2 group cursor-pointer opacity-50 grayscale hover:grayscale-0 transition-all">
               <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
               <span className="font-bold text-lg text-slate-900 tracking-tight">TrustKhata</span>
            </div>
            <div className="flex gap-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
               <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-emerald-600 transition-colors">Merchant Terms</a>
               <a href="#" className="hover:text-emerald-600 transition-colors">SLA</a>
            </div>
            <div className="text-slate-400 text-xs font-medium tracking-widest uppercase">
               BUILD 1.2.0-STABLE • © {new Date().getFullYear()} TRUSTKHATA
            </div>
         </div>
      </footer>
    </div>
  );
}
