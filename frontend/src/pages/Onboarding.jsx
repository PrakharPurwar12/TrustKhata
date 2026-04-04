
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithTransition } from '../utils/navigateWithTransition';

import api from '../services/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const [showPage, setShowPage] = useState(false);
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setShowPage(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (shopName.trim()) {
      try {
        await api.post('users/update_shop/', { shop_name: shopName, category: category });
        navigateWithTransition(navigate, '/dashboard');
      } catch (err) {
        console.error("Failed to update shop", err);
        alert("Failed to save shop details.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 [view-transition-name:auth-page]">
      <div 
        className={`w-full max-w-lg bg-white rounded-[2rem] shadow-xl border border-slate-100 p-10 transition-all duration-700 ${
          showPage ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Setup Your Shop</h2>
          <p className="text-slate-500">What should we call your business?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Shop Name
            </label>
            <input 
              type="text" 
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Sharma Kirana Store" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Business Category <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-700 appearance-none"
            >
              <option value="">Select a category</option>
              <option value="grocery">Grocery / Kirana</option>
              <option value="medical">Medical / Pharmacy</option>
              <option value="electronics">Electronics / Hardware</option>
              <option value="clothing">Clothing / Garments</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all mt-4"
          >
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
