import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  User, 
  Store, 
  Mail, 
  Calendar, 
  ArrowLeft, 
  Save, 
  Edit2, 
  X, 
  Loader2,
  ChevronRight,
  ShieldCheck,
  Building2,
  Tag
} from 'lucide-react';
import { userService } from '../services/userService';
import { parseApiError } from '../utils/apiError';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    category: '',
    email: '',
    created_at: ''
  });
  const [fomData, setFormData] = useState({
    name: '',
    category: ''
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        category: data.category || ''
      });
    } catch (error) {
      toast.error(parseApiError(error));
      if (error.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await userService.updateProfile({
        name: fomData.name,
        category: fomData.category
      });
      setProfile(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(parseApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-slate-50 pb-20"
    >
      {/* Simple Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold text-sm">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <User size={16} />
            </div>
            <span className="font-bold text-slate-900">Merchant Settings</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Side: Summary Card */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm ring-1 ring-slate-200">
                <Store size={40} className="text-slate-400" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{profile.name}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{profile.category || 'General Store'}</p>
              
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Email</p>
                    <p className="text-sm font-bold text-slate-600 truncate">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant Since</p>
                    <p className="text-sm font-bold text-slate-600">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={80} strokeWidth={1.5} />
              </div>
              <h3 className="font-black text-lg mb-2">Verified Account</h3>
              <p className="text-emerald-100 text-sm font-medium leading-relaxed">
                Your TrustKhata account is fully verified. All transactions are securely backed up.
              </p>
            </div>
          </div>

          {/* Right Side: Account Details Form */}
          <div className="flex-1">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Account Information</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Manage your business profile and contact info</p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-200 hover:border-emerald-100 text-sm"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="p-8 sm:p-10">
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    {/* Business Name */}
                    <div className="space-y-2 group">
                      <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-700 group-focus-within:text-emerald-600 transition-colors">
                        <Building2 size={14} className="text-slate-400 group-focus-within:text-emerald-600" />
                        Shop Name
                      </label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          required
                          value={fomData.name}
                          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 focus:bg-white transition-all font-bold text-slate-900"
                        />
                      ) : (
                        <div className="px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-600 flex items-center justify-between">
                          {profile.name}
                          <ShieldCheck size={16} className="text-emerald-500" />
                        </div>
                      )}
                    </div>

                    {/* Business Category */}
                    <div className="space-y-2 group">
                      <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-700 group-focus-within:text-emerald-600 transition-colors">
                        <Tag size={14} className="text-slate-400 group-focus-within:text-emerald-600" />
                        Business Category
                      </label>
                      {isEditing ? (
                        <select 
                          value={fomData.category}
                          onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 focus:bg-white transition-all font-bold text-slate-900"
                        >
                          <option value="">Select Category</option>
                          <option value="General Store">General Store</option>
                          <option value="Medical & Healthcare">Medical & Healthcare</option>
                          <option value="Clothing & Apparel">Clothing & Apparel</option>
                          <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                          <option value="Furniture & Decor">Furniture & Decor</option>
                          <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                          <option value="Wholesale">Wholesale</option>
                          <option value="Other Business">Other Business</option>
                        </select>
                      ) : (
                        <div className="px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-600">
                          {profile.category || 'Not Specified'}
                        </div>
                      )}
                    </div>

                    {/* Login Email (Read Only always) */}
                    <div className="space-y-2 opacity-60">
                      <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                        <Mail size={14} />
                        Identity Email (Unique)
                      </label>
                      <div className="px-5 py-4 bg-slate-100 rounded-2xl border border-slate-200 font-bold text-slate-400 cursor-not-allowed">
                        {profile.email}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">Email address is your primary account identifier and cannot be changed.</p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button 
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                        Save Changes
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ name: profile.name, category: profile.category });
                        }}
                        className="px-8 py-4 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-2xl font-black transition-all flex items-center justify-center gap-3"
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </div>
                  )}
                </form>

                <div className="mt-20 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight">Security & Privacy</h4>
                      <p className="text-slate-500 text-xs font-medium mt-1">Your data is encrypted and private to your account.</p>
                    </div>
                    <ChevronRight size={24} className="text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
