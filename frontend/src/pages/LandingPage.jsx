import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// --- Small Components --- //

// Animated fade-in wrapper using tailwind classes
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
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    
    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};


const Navbar = () => (
  <nav className="flex items-center justify-between py-6 px-8 max-w-7xl mx-auto">
    <div className="text-2xl font-bold text-slate-900 tracking-tight">TrustKhata</div>
    <div className="hidden md:flex space-x-8 text-slate-600 font-medium">
      <a href="#home" className="hover:text-green-600 transition-colors">Home</a>
      <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
      <a href="#contact" className="hover:text-green-600 transition-colors">Contact</a>
    </div>
    <div className="flex items-center gap-4">
      <Link to="/login" className="hidden md:block text-slate-600 hover:text-green-600 font-medium transition-colors">
        Login
      </Link>
      <Link to="/register" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm">
        Get Started
      </Link>
    </div>
  </nav>
);

const Hero = () => (
  <header id="home" className="pt-20 pb-32 px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
    <div className="flex-1 space-y-8">
      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
        Manage Udhaar <span className="text-green-600">Digitally</span>
      </h1>
      <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
        Track credit, payments and balances easily. The perfect digital ledger for your shop.
      </p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link to="/register" className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg shadow-green-200 inline-block">
          Get Started
        </Link>
        <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-semibold text-lg transition-colors shadow-sm">
          View Demo
        </button>
      </div>
    </div>
    <div className="flex-1 w-full max-w-md md:max-w-none">
      {/* Simple placeholder box */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl h-96 w-full shadow-2xl flex items-center justify-center relative overflow-hidden">
        {/* Soft background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col items-center text-slate-400 space-y-4">
          <svg className="w-16 h-16 text-green-500/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-slate-500">Dashboard Preview</span>
        </div>
      </div>
    </div>
  </header>
);

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-green-50 text-green-600 flex items-center justify-center rounded-2xl mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const Features = () => {
  const checkIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
  
  const userIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const shieldIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need</h2>
          <p className="text-lg text-slate-600">Simple tools to manage your unorganized credit system efficiently.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={userIcon}
            title="Customer Profiles" 
            description="Create profiles for your customers and maintain a clean record of their contact details." 
          />
          <FeatureCard 
            icon={checkIcon}
            title="Easy Accounting" 
            description="Add gave or got entries instantly. Automatically updates the overall balance for you." 
          />
          <FeatureCard 
            icon={shieldIcon}
            title="Secure & Private" 
            description="Your data is safely backed up and private. Only you have access to your ledger." 
          />
        </div>
      </div>
    </section>
  );
};

const Step = ({ number, title }) => (
  <div className="flex flex-col items-center text-center relative z-10">
    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-green-200 mb-6 border-4 border-white">
      {number}
    </div>
    <h4 className="text-xl font-bold text-slate-900">{title}</h4>
  </div>
);

const HowItWorks = () => (
  <section className="py-32 bg-white relative">
    <div className="max-w-5xl mx-auto px-8">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How it works</h2>
        <p className="text-lg text-slate-600">Three simple steps to start digitalizing your Udhaar</p>
      </div>
      
      <div className="relative">
        {/* Connecting Line */}
        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-slate-100 z-0"></div>
        
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-4 relative">
          <Step number="1" title="Add Customer" />
          <Step number="2" title="Add Transaction" />
          <Step number="3" title="Track Balance" />
        </div>
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="py-24 px-8 max-w-5xl mx-auto">
    <div className="bg-slate-900 rounded-[3rem] px-8 py-20 text-center text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-10 blur-3xl rounded-[3rem]"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
          Start Managing Udhaar Today
        </h2>
        <p className="text-slate-300 text-lg mb-10">
          Join thousands of smart shopkeepers who trust TrustKhata for their daily ledger needs.
        </p>
        <Link to="/register" className="bg-green-500 hover:bg-green-400 text-slate-900 px-10 py-4 rounded-full font-bold text-lg transition-colors shadow-lg shadow-green-900/50 inline-block">
          Get Started For Free
        </Link>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer id="contact" className="bg-white py-12 border-t border-slate-100">
    <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-xl font-bold text-slate-900 tracking-tight">TrustKhata</div>
      <div className="flex gap-6 text-slate-500 font-medium">
        <a href="#home" className="hover:text-green-600 transition-colors">Privacy</a>
        <a href="#home" className="hover:text-green-600 transition-colors">Terms</a>
        <a href="#contact" className="hover:text-green-600 transition-colors">Support</a>
      </div>
      <div className="text-slate-400 text-sm">
        © {new Date().getFullYear()} TrustKhata. All rights reserved.
      </div>
    </div>
  </footer>
);

// --- Main Page Component --- //

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100 selection:text-green-900 scroll-smooth">
      <Navbar />
      <main>
        <FadeIn>
          <Hero />
        </FadeIn>
        <FadeIn delay={150}>
          <Features />
        </FadeIn>
        <FadeIn delay={150}>
          <HowItWorks />
        </FadeIn>
        <FadeIn delay={150}>
          <CTA />
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
