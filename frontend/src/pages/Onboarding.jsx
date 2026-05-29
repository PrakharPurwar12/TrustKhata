import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, ArrowRight, Loader2, Target } from 'lucide-react';
import { navigateWithTransition } from '../utils/navigateWithTransition';
import { userService } from '../services/userService';
import { parseApiError } from '../utils/apiError';

export default function Onboarding() {
  const navigate = useNavigate();
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch current name as default
    const fetchCurrent = async () => {
      try {
        const res = await userService.getCurrentShop();
        setShopName(res.data.name || '');
        setCategory(res.data.category || '');
      } catch (error) {
        console.error(error);
      }
    };
    fetchCurrent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!shopName.trim()) return;
    
    setLoading(true);
    try {
      await userService.updateShop({ shop_name: shopName, category });
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
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Store size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Final Setup</h2>
          <p className="text-slate-500 mt-2 font-medium">Almost there! Tell us more about your shop.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
            <label className="block text-sm font-bold text-slate-700">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Sharma Kirana Store" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 focus:bg-white transition-all text-slate-900 font-medium"
            />
          </div>

          <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
            <label className="block text-sm font-bold text-slate-700">
              Business Category <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 focus:bg-white transition-all text-slate-700 appearance-none font-medium"
              >
                <option value="">Select a category</option>
                <option value="grocery">Grocery / Kirana Store</option>
                <option value="medical">Medical / Pharmacy</option>
                <option value="electronics">Electronics / Hardware</option>
                <option value="clothing">Clothing / Garments</option>
                <option value="other">Other Business</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Target size={20} />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !shopName.trim()}
            className="group relative w-full py-4 bg-slate-950 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:transform-none"
          >
            <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              Go to Dashboard
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-white" />
              </div>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
