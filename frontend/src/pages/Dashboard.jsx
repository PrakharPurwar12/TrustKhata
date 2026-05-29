import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  LogOut, 
  Search, 
  X, 
  ChevronRight, 
  Loader2, 
  LayoutDashboard,
  UserPlus,
  User,
  Sun,
  Moon,
  BarChart3
} from 'lucide-react';
import { customerService } from '../services/customerService';
import { transactionService } from '../services/transactionService';
import { userService } from '../services/userService';
import { parseApiError } from '../utils/apiError';
import { toNumber } from '../utils/normalizers';
import { isValidPhone, normalizePhone } from '../utils/phoneValidation';
import { useTheme } from '../context/ThemeContext';
import { CustomerCardSkeleton } from '../components/Skeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dashboard Data States
  const [shopName, setShopName] = useState('Your Shop');
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({ toGet: 0, toGive: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Add Customer Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    opening_balance: '',
  });

  // Validation Errors
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
  });

  const [sortOrder, setSortOrder] = useState('newest');

  // Debounce search effect (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadDashboard = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const [meRes, customerRes, summaryRes] = await Promise.all([
        userService.getCurrentShop(),
        customerService.getAll(page),
        userService.getSummary(),
      ]);

      setShopName(meRes.name || 'Your Shop');
      
      setCustomers(customerRes.results || []);
      setTotalCount(customerRes.count || 0);
      setHasNext(!!customerRes.next);
      setHasPrevious(!!customerRes.previous);
      setCurrentPage(page);

      setSummary({
        toGet: toNumber(summaryRes.to_get),
        toGive: toNumber(summaryRes.to_give),
      });
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate('/login');
      } else {
        toast.error(parseApiError(error));
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = async () => {
    try {
      await userService.logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleSaveCustomer = async () => {
    // Final Validation
    const nameValid = formData.name.trim().length > 0;
    const phoneValid = isValidPhone(formData.phone);

    if (!nameValid || !phoneValid) {
      setErrors({
        name: nameValid ? '' : 'Name is required',
        phone: phoneValid ? '' : 'Enter a valid 10-digit mobile number'
      });
      return;
    }

    setSaving(true);
    const creationPromise = (async () => {
      const payload = {
        name: formData.name.trim(),
        phone: normalizePhone(formData.phone),
      };

      const response = await customerService.create(payload);
      
      const openingBal = Number(formData.opening_balance);
      if (openingBal !== 0 && !isNaN(openingBal)) {
        const type = openingBal > 0 ? 'CREDIT' : 'PAYMENT';
        await transactionService.create({
          customer: response.id,
          amount: Math.abs(openingBal),
          type,
          note: 'Opening Balance',
        });
      }
      
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', opening_balance: '' });
      setErrors({ name: '', phone: '' });
      loadDashboard(1);
      return response.name;
    })();

    toast.promise(creationPromise, {
      loading: 'Adding customer...',
      success: (name) => `${name} added successfully`,
      error: (err) => parseApiError(err),
    });

    try {
      await creationPromise;
    } finally {
      setSaving(false);
    }
  };

  // Local filtering and sorting logic within the current fetched page
  const filteredCustomers = useMemo(() => {
    let result = customers.filter(c => 
      c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      c.phone?.includes(debouncedSearch)
    );
    
    if (sortOrder === 'amount_owed') {
      result = [...result].sort((a, b) => Number(a.balance || 0) - Number(b.balance || 0));
    } else if (sortOrder === 'az') {
      result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    return result;
  }, [customers, debouncedSearch, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 transition-opacity hover:opacity-80 cursor-pointer">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <LayoutDashboard size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">TrustKhata</span>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{shopName}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Merchant Account</span>
              </div>
              <Link 
                to="/profile"
                className="group flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-100 dark:hover:border-emerald-800"
              >
                <User size={18} />
                <span className="hidden md:inline">Profile</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="group flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-100 dark:hover:border-rose-800"
              >
                <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors duration-300">Merchant Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring business khata for <span className="text-emerald-600 dark:text-emerald-400 font-bold">{shopName}</span></p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/insights"
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-2xl font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <BarChart3 size={20} strokeWidth={2.5} />
              Insights
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={20} strokeWidth={3} />
              Add Customer
            </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card: You'll Receive (Inflow) */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-emerald-100 dark:border-emerald-900 shadow-sm shadow-emerald-600/5 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-600/5 transition-all">
             <div className="absolute top-0 right-0 p-8 text-emerald-100 dark:text-emerald-900/40 group-hover:text-emerald-200 dark:group-hover:text-emerald-800 transition-colors">
                <ArrowUpRight size={120} strokeWidth={1} />
             </div>
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                   <ArrowUpRight size={14} />
                   You'll Receive
                </div>
                <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter shadow-emerald-100">
                   ₹ {Math.abs(summary.toGet || 0).toLocaleString('en-IN')}
                </div>
                <p className="mt-4 text-emerald-600/60 font-medium text-sm italic">Total pending collections from customers</p>
             </div>
          </div>

          {/* Card: You Owe (Outflow) */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-rose-100 dark:border-rose-900 shadow-sm shadow-rose-600/5 relative overflow-hidden group hover:shadow-xl hover:shadow-rose-600/5 transition-all">
             <div className="absolute top-0 right-0 p-8 text-rose-100 dark:text-rose-900/40 group-hover:text-rose-200 dark:group-hover:text-rose-800 transition-colors text-right">
                <ArrowDownLeft size={120} strokeWidth={1} />
             </div>
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                   <ArrowDownLeft size={14} />
                   You Owe
                </div>
                <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                   ₹ {Math.abs(summary.toGive || 0).toLocaleString('en-IN')}
                </div>
                <p className="mt-4 text-rose-600/60 font-medium text-sm italic">Advances paid by customers to you</p>
             </div>
          </div>
        </div>

        {/* Search & Directory Section */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm transition-colors duration-300">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                Customers Directory
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 py-1 px-4 rounded-full text-xs font-black tracking-widest">{totalCount}</span>
              </h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Manage and track individual member accounts</p>
            </div>
            
            <div className="relative w-full lg:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone..." 
                className="w-full pl-11 pr-11 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium placeholder:text-slate-400 dark:text-slate-100"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 dark:focus:border-emerald-500 transition-all w-full lg:w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="amount_owed">Highest Owed</option>
                <option value="az">A-Z Name</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="space-y-4">
               {[1, 2, 3].map(i => <CustomerCardSkeleton key={i} />)}
            </div>
          )}

          {!loading && customers.length === 0 && searchQuery === '' && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 p-20 text-center">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-slate-300 dark:text-slate-600">
                <Users size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Your Digital Khata is Fresh!</h3>
              <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                Transform your paper records into a powerful digital ledger. Start by adding your first regular customer.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-emerald-600/20 transition-all hover:-translate-y-1"
              >
                <UserPlus size={22} />
                Onboard First Customer
              </button>
            </div>
          )}

          {!loading && filteredCustomers.length === 0 && searchQuery !== '' && (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100">
               <div className="inline-flex p-5 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <Search size={32} />
               </div>
               <p className="text-slate-500 font-bold">No results found for "<span className="text-slate-900">{searchQuery}</span>"</p>
               <button onClick={() => setSearchQuery('')} className="mt-4 text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">Clear Search</button>
            </div>
          )}

          {!loading && customers.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {filteredCustomers.map(customer => {
                  const bal = Number(customer.balance || 0);
                  const isOwe = bal < 0;
                  const isSettled = bal === 0;

                  return (
                    <Link 
                      to={`/customer/${customer.id}`}
                      key={customer.id} 
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-700/30 rounded-3xl hover:bg-white dark:hover:bg-slate-700 transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/50 hover:shadow-xl hover:shadow-emerald-600/5 gap-6"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-2xl shadow-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                          {customer.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{customer.name}</p>
                          <p className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase mt-1">
                             <span className="w-1 h-1 bg-slate-300 rounded-full" />
                             {customer.phone || 'Contact not set'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end sm:gap-12 w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-5 sm:pt-0">
                        <div className="text-left sm:text-right space-y-1">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Position</p>
                          {isSettled ? (
                            <div className="flex items-center gap-2 font-bold text-slate-500">
                               <div className="w-2 h-2 rounded-full bg-slate-300 shadow-sm shadow-slate-100" />
                               ₹ 0.00 <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Settled</span>
                            </div>
                          ) : isOwe ? (
                            <div className="flex items-center gap-2 font-black text-rose-600 text-lg">
                               <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200 animate-pulse" />
                               ₹ {Math.abs(bal).toLocaleString('en-IN')} 
                               <span className="text-[10px] uppercase font-black tracking-widest bg-rose-50 px-2 py-0.5 rounded-md">You Owe</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-black text-emerald-600 text-lg">
                               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 animate-pulse" />
                               ₹ {Math.abs(bal).toLocaleString('en-IN')} 
                               <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">Receive</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
                           <ChevronRight size={20} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalCount > 0 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-slate-900">{filteredCustomers.length}</span> records of <span className="text-slate-900">{totalCount}</span>
                  </p>
                  <div className="flex gap-3">
                    <button 
                      disabled={!hasPrevious || loading}
                      onClick={() => loadDashboard(currentPage - 1)}
                      className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 transition-all shadow-sm active:scale-95"
                    >
                      Previous
                    </button>
                    <button 
                      disabled={!hasNext || loading}
                      onClick={() => loadDashboard(currentPage + 1)}
                      className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 transition-all shadow-sm active:scale-95"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modern Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500" 
            onClick={() => !saving && setIsModalOpen(false)}
          ></div>
          
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 dark:bg-slate-950 p-10 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl opacity-50" />
               <div className="relative z-10">
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-600/20">
                     <UserPlus size={28} />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">Onboard Member</h3>
                  <p className="text-slate-400 font-medium mt-2">Initialize new customer account</p>
               </div>
               <button 
                  disabled={saving} 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={24} />
               </button>
            </div>
             
             <form className="p-10 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveCustomer(); }}>
              <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
                <label className="block text-sm font-black uppercase tracking-widest text-slate-700">Display Name <span className="text-rose-500">*</span></label>
                <input 
                  required 
                  autoFocus
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => {
                    setFormData(p => ({ ...p, name: e.target.value }));
                    if (errors.name) setErrors(p => ({ ...p, name: '' }));
                  }} 
                  placeholder="e.g. Rahul Mehta" 
                  className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium ${errors.name ? 'border-rose-500 focus:ring-rose-500/5 focus:border-rose-500' : 'border-slate-200 focus:ring-emerald-600/5 focus:border-emerald-600'}`} 
                />
                {errors.name && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest px-2">{errors.name}</p>}
              </div>
              <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
                <label className="block text-sm font-black uppercase tracking-widest text-slate-700">Phone Number <span className="text-rose-500">*</span></label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => {
                    setFormData(p => ({ ...p, phone: e.target.value }));
                    if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
                  }} 
                  placeholder="e.g. 9876543210" 
                  className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium ${errors.phone ? 'border-rose-500 focus:ring-rose-500/5 focus:border-rose-500' : 'border-slate-200 focus:ring-emerald-600/5 focus:border-emerald-600'}`} 
                />
                {errors.phone && (
                  <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest px-2">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
                <label className="block text-sm font-black uppercase tracking-widest text-slate-700">Opening Balance (₹)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors font-bold">₹</div>
                  <input 
                    type="number" 
                    value={formData.opening_balance} 
                    onChange={(e) => setFormData(p => ({ ...p, opening_balance: e.target.value }))} 
                    placeholder="0.00"
                    className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 focus:bg-white transition-all font-black text-slate-900 text-lg placeholder:text-slate-300" 
                  />
                </div>
                <div className="flex gap-4 mt-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <ArrowUpRight size={10} strokeWidth={4} />
                      Positive = Receive
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      <ArrowDownLeft size={10} strokeWidth={4} />
                      Negative = Owe
                   </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={saving || !formData.name.trim() || !isValidPhone(formData.phone)}
                className="relative w-full py-5 mt-6 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:transform-none overflow-hidden"
              >
                <span className={`relative z-10 flex items-center justify-center gap-3 ${saving ? 'opacity-0' : 'opacity-100'}`}>
                   Secure Account 
                   <ChevronRight size={24} strokeWidth={3} />
                </span>
                {saving && (
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={32} className="animate-spin" />
                   </div>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-600/30 active:scale-95 transition-all z-30"
        aria-label="Add Customer"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
}
