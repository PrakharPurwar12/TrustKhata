import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  MoreVertical, 
  Plus, 
  Minus, 
  Search, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt,
  Loader2,
  X,
  CreditCard,
  Banknote,
  Trash2,
  Edit3,
  Settings,
  PieChart,
  User,
  Phone,
  History,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { customerService, deleteCustomer } from '../services/customerService';
import { transactionService } from '../services/transactionService';
import { parseApiError } from '../utils/apiError';
import { isValidPhone, normalizePhone } from '../utils/phoneValidation';

export default function CustomerKhata() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data States
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal & Menu States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  const [transactionType, setTransactionType] = useState('CREDIT');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editErrors, setEditErrors] = useState({ name: '', phone: '' });

  // 1. Fetch Customer Details (Metadata + Balances)
  const loadCustomer = async () => {
    try {
      const data = await customerService.getById(id);
      setCustomer(data);
    } catch (err) {
      toast.error(parseApiError(err, 'Failed to load customer profile'));
      if (err.status === 404) navigate('/dashboard');
    }
  };

  // 2. Fetch Transactions (Paginated)
  const loadTransactions = async (page = 1) => {
    try {
      setTxLoading(true);
      const data = await transactionService.getByCustomer(id, page);
      setTransactions(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 20));
      setCurrentPage(page);
    } catch (err) {
      toast.error(parseApiError(err, 'Failed to load transactions'));
    } finally {
      setTxLoading(false);
    }
  };

  const initialLoad = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadCustomer(), loadTransactions(1)]);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setSaving(true);
    try {
      await transactionService.create({
        customer: id,
        amount: Number(amount),
        type: transactionType,
        note: note || (transactionType === 'CREDIT' ? 'Items sold' : 'Payment received')
      });
      
      setIsModalOpen(false);
      setAmount('');
      setNote('');
      toast.success('Transaction recorded');
      // Refresh both to update balances
      await Promise.all([loadCustomer(), loadTransactions(1)]);
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    const trimmedName = editName.trim();
    const normalizedPhone = normalizePhone(editPhone);

    const nameValid = trimmedName.length > 0;
    const phoneValid = isValidPhone(editPhone);

    if (!nameValid || !phoneValid) {
      setEditErrors({
        name: nameValid ? '' : 'Name is required',
        phone: phoneValid ? '' : 'Enter a valid 10-digit mobile number'
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await customerService.update(id, {
        name: trimmedName,
        phone: normalizedPhone
      });
      setCustomer(updated);
      setIsEditModalOpen(false);
      setEditErrors({ name: '', phone: '' });
      toast.success('Customer profile updated');
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (deleteConfirm !== 'DELETE') return;
    
    try {
      setIsDeleting(true);
      await deleteCustomer(id);
      toast.success("Customer deleted successfully");
      navigate("/dashboard"); 
    } catch (error) {
      toast.error(parseApiError(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <Loader2 size={48} className="animate-spin text-emerald-600 mb-4" />
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Building Profile View...</p>
      </div>
    );
  }

  const netBalance = Number(customer?.balance || 0);

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-slate-50 font-sans pb-20"
    >
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link to="/dashboard" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 border border-slate-200 transition-all hover:-translate-x-1">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-10 w-px bg-slate-100 hidden sm:block" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                {customer?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">{customer?.name}</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                  <Phone size={10} className="text-emerald-500" />
                  {customer?.phone || 'No Contact'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all ${isMenuOpen ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-900 hover:border-slate-300'}`}
                >
                  <Settings size={20} className={isMenuOpen ? 'rotate-90 transition-transform duration-500' : ''} />
                </button>
                
                <AnimatePresence>
                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-20"
                      >
                        <button 
                          onClick={() => {
                            setEditName(customer?.name || '');
                            setEditPhone(customer?.phone || '');
                            setIsEditModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-2xl transition-all"
                        >
                          <Edit3 size={18} />
                          Edit Details
                        </button>
                        <hr className="my-2 border-slate-50" />
                        <button 
                          onClick={() => { setIsMenuOpen(false); setIsDeleteModalOpen(true); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                        >
                          <Trash2 size={18} />
                          Delete Customer
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        
        {/* User Card (Mobile Only) */}
        <div className="sm:hidden bg-white p-6 rounded-3xl border border-slate-200 mb-8 flex items-center gap-4">
           <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
              {customer?.name?.charAt(0).toUpperCase()}
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{customer?.name}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{customer?.phone || 'No Phone'}</p>
           </div>
        </div>

        {/* 3-Card Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           {/* Summary: Total Credit (Gave) */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-rose-50 opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <ArrowUpRight size={48} strokeWidth={3} />
              </div>
              <div className="flex items-center gap-3 text-rose-600 mb-4 bg-rose-50 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Plus size={14} strokeWidth={3} />
                Total Given
              </div>
              <h4 className="text-3xl font-black text-slate-900 tracking-tighter shadow-sm">₹ {customer?.total_credit?.toLocaleString('en-IN')}</h4>
              <p className="text-slate-400 text-xs font-bold mt-2">Aggregate credit sales</p>
           </div>

           {/* Summary: Total Payment (Got) */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-emerald-50 opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <ArrowDownLeft size={48} strokeWidth={3} />
              </div>
              <div className="flex items-center gap-3 text-emerald-600 mb-4 bg-emerald-50 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Minus size={14} strokeWidth={3} />
                Total Received
              </div>
              <h4 className="text-3xl font-black text-slate-900 tracking-tighter">₹ {customer?.total_payment?.toLocaleString('en-IN')}</h4>
              <p className="text-slate-400 text-xs font-bold mt-2">Total settlements made</p>
           </div>

           {/* Summary: Net Balance */}
           <div className={`p-8 rounded-[2.5rem] border shadow-lg shadow-slate-200/5 relative overflow-hidden group ${netBalance > 0 ? 'bg-rose-600 border-rose-600 text-white' : netBalance < 0 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-900 border-slate-900 text-white'}`}>
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <PieChart size={48} strokeWidth={2} />
              </div>
              <div className="flex items-center gap-3 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {netBalance > 0 ? 'You Receive' : netBalance < 0 ? 'You Owe' : 'Fully Settled'}
              </div>
              <h4 className="text-3xl font-black tracking-tighter">₹ {Math.abs(netBalance).toLocaleString('en-IN')}</h4>
              <p className="text-white/60 text-xs font-bold mt-2">Current Ledger Balance</p>
           </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
           <button 
             onClick={() => { setTransactionType('CREDIT'); setIsModalOpen(true); }}
             className="flex-1 bg-white border-2 border-rose-100 hover:border-rose-200 p-5 rounded-3xl flex items-center justify-between group transition-all hover:shadow-xl hover:shadow-rose-600/5 active:scale-95"
           >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <Plus size={24} strokeWidth={3} />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-black text-slate-900 tracking-tight">Give Credit</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sell on udhaar</p>
                 </div>
              </div>
              <ArrowUpRight className="text-rose-200 group-hover:text-rose-500 transition-colors" />
           </button>

           <button 
             onClick={() => { setTransactionType('PAYMENT'); setIsModalOpen(true); }}
             className="flex-1 bg-white border-2 border-emerald-100 hover:border-emerald-200 p-5 rounded-3xl flex items-center justify-between group transition-all hover:shadow-xl hover:shadow-emerald-600/5 active:scale-95"
           >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Minus size={24} strokeWidth={3} />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-black text-slate-900 tracking-tight">Accept Payment</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receive cash/jama</p>
                 </div>
              </div>
              <ArrowDownLeft className="text-emerald-200 group-hover:text-emerald-500 transition-colors" />
           </button>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm/5 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
              <History size={20} className="text-emerald-600" />
              Digital Ledger
              <span className="bg-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded-md">{totalCount} Entries</span>
            </h3>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sort: Newest First</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
               <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-10 py-4 text-left text-[10px] font-black uppercase tracking-widest">Date & Context</th>
                    <th className="px-10 py-4 text-right text-[10px] font-black uppercase tracking-widest">Gave (₹)</th>
                    <th className="px-10 py-4 text-right text-[10px] font-black uppercase tracking-widest">Got (₹)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 relative">
                  {txLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                       <Loader2 className="animate-spin text-emerald-600" size={32} />
                    </div>
                  )}

                  {transactions.length === 0 ? (
                    <tr>
                       <td colSpan="3" className="py-24 text-center">
                          <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                             <Receipt size={32} />
                          </div>
                          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No transactions recorded yet.</p>
                       </td>
                    </tr>
                  ) : (
                    transactions.map((tx, idx) => (
                      <tr key={tx.id} className={`group hover:bg-slate-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                  <Calendar size={16} />
                               </div>
                               <div>
                                  <p className="font-black text-slate-900 tracking-tight leading-none">
                                    {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                  <p className="text-[11px] font-bold text-slate-400 mt-1.5 group-hover:text-slate-600 transition-colors">{tx.note}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-6 text-right">
                            {tx.type === 'CREDIT' ? (
                               <span className="font-black text-lg text-rose-600">₹ {Number(tx.amount).toLocaleString('en-IN')}</span>
                            ) : <span className="text-slate-200">--</span>}
                         </td>
                         <td className="px-10 py-6 text-right">
                            {tx.type === 'PAYMENT' ? (
                               <span className="font-black text-lg text-emerald-600">₹ {Number(tx.amount).toLocaleString('en-IN')}</span>
                            ) : <span className="text-slate-200">--</span>}
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="px-10 py-8 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100">
               <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pt-0.5">
                    Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
                  </p>
               </div>
               
               <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1 || txLoading}
                    onClick={() => loadTransactions(currentPage - 1)}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 transition-all shadow-sm active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    disabled={currentPage === totalPages || txLoading}
                    onClick={() => loadTransactions(currentPage + 1)}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 transition-all shadow-sm active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Modern Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
               onClick={() => !saving && setIsModalOpen(false)} 
            />
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden z-10"
            >
              <div className={`p-10 text-white relative overflow-hidden ${transactionType === 'CREDIT' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/20 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                       {transactionType === 'CREDIT' ? <Plus size={28} strokeWidth={3} /> : <Minus size={28} strokeWidth={3} />}
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">{transactionType === 'CREDIT' ? 'Give Credit' : 'Get Payment'}</h3>
                    <p className="text-white/70 font-medium text-sm mt-1">Transaction for <span className="font-bold underline">{customer?.name}</span></p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white p-2">
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSaveTransaction} className="p-10 space-y-8">
                <div className="space-y-2">
                   <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${transactionType === 'CREDIT' ? 'text-rose-400' : 'text-emerald-400'}`}>Amount (₹)</label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 font-black">₹</div>
                      <input 
                        required 
                        autoFocus
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 transition-all font-black text-2xl text-slate-900 placeholder:text-slate-200 ${transactionType === 'CREDIT' ? 'focus:ring-rose-600/5 focus:border-rose-600' : 'focus:ring-emerald-600/5 focus:border-emerald-600'}`}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Notes / Items</label>
                   <textarea 
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     placeholder="e.g. 5kg Sugar, 2L Milk..."
                     rows={3}
                     className={`w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 placeholder:text-slate-300 ${transactionType === 'CREDIT' ? 'focus:ring-rose-600/5 focus:border-rose-600' : 'focus:ring-emerald-600/5 focus:border-emerald-600'}`}
                   />
                </div>

                <button 
                  type="submit" 
                  disabled={saving || !amount}
                  className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] ${transactionType === 'CREDIT' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
                >
                  {saving ? <Loader2 className="animate-spin" /> : 'Confirm Digital Entry'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secure Delete Modal */}
      <AnimatePresence>
         {isDeleteModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
              />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 z-10"
              >
                 <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                    <AlertTriangle size={40} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 text-center tracking-tight">Dangerous Action</h3>
                 <p className="text-slate-500 text-center text-sm font-medium mt-2 leading-relaxed">
                    This will permanently delete <span className="text-slate-900 font-bold">{customer?.name}'s</span> profile and all <span className="text-slate-900 font-bold">{totalCount}</span> transactions. This cannot be undone.
                 </p>

                 <div className="mt-10 space-y-4">
                    <div className="space-y-1.5 focus-within:text-rose-600 transition-colors">
                       <label className="block text-[10px] font-black uppercase text-center text-slate-400 tracking-widest">Type <span className="text-rose-600">DELETE</span> to confirm</label>
                       <input 
                         type="text" 
                         value={deleteConfirm} 
                         onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
                         placeholder="DELETE" 
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-600/5 focus:border-rose-600 focus:bg-white text-center font-black tracking-[0.5em] transition-all"
                       />
                    </div>
                    
                    <button 
                      disabled={deleteConfirm !== 'DELETE' || isDeleting}
                      onClick={handleDeleteCustomer}
                      className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-600/20 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3"
                    >
                      {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 size={24} />}
                      Destroy Record Permanently
                    </button>
                    
                    <button 
                      disabled={isDeleting}
                      onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirm(''); }}
                      className="w-full py-5 bg-slate-50 text-slate-500 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all"
                    >
                      Cancel & Keep Data
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
               onClick={() => !saving && setIsEditModalOpen(false)} 
            />
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden z-10"
            >
              <div className="p-10 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
                       <User size={28} />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">Edit Profile</h3>
                    <p className="text-slate-400 font-medium text-sm mt-1">Update primary record for <span className="text-white underline">{customer?.name}</span></p>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white p-2 transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleUpdateCustomer} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                        <User size={18} />
                      </div>
                      <input 
                        required 
                        autoFocus
                        type="text" 
                        value={editName}
                        onChange={(e) => {
                          setEditName(e.target.value);
                          if (editErrors.name) setEditErrors(p => ({ ...p, name: '' }));
                        }}
                        placeholder="e.g. John Doe"
                        className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all font-bold text-slate-900 ${editErrors.name ? 'border-rose-500 focus:ring-rose-500/5 focus:border-rose-500' : 'border-slate-200 focus:ring-emerald-600/5 focus:border-emerald-600'}`}
                      />
                   </div>
                   {editErrors.name && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest px-14">{editErrors.name}</p>}
                </div>

                <div className="space-y-2">
                   <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Phone Number (Required)</label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                        <Phone size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={editPhone}
                        onChange={(e) => {
                          setEditPhone(e.target.value);
                          if (editErrors.phone) setEditErrors(p => ({ ...p, phone: '' }));
                        }}
                        placeholder="e.g. 9876543210"
                        className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all font-bold text-slate-900 ${editErrors.phone ? 'border-rose-500 focus:ring-rose-500/5 focus:border-rose-500' : 'border-slate-200 focus:ring-emerald-600/5 focus:border-emerald-600'}`}
                      />
                   </div>
                   {editErrors.phone && (
                     <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest px-14">{editErrors.phone}</p>
                   )}
                </div>

                <div className="pt-4 flex flex-col gap-3">
                   <button 
                     type="submit" 
                     disabled={saving || !editName.trim() || !isValidPhone(editPhone)}
                     className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xl shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                   >
                     {saving ? <Loader2 className="animate-spin" /> : 'Save Profile Changes'}
                   </button>
                   <button 
                     type="button"
                     onClick={() => setIsEditModalOpen(false)}
                     className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                   >
                     Cancel
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
