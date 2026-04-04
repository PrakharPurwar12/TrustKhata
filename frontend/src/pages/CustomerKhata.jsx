import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { transactionService } from '../services/transactionService';

export default function CustomerKhata() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('CREDIT'); // 'CREDIT' or 'PAYMENT'
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, txRes] = await Promise.all([
          customerService.getById(id),
          transactionService.getAll()
        ]);
        setCustomer(custRes.data);
        
        // Filter transactions for this customer
        const customerTx = txRes.data.filter(tx => String(tx.customer) === String(id));
        setTransactions(customerTx);
      } catch (err) {
        console.error("Failed to fetch customer data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Calculate Net Balance
  let totalUdhaar = 0;
  let totalJama = 0;
  transactions.forEach(t => {
    if (t.type === 'CREDIT') totalUdhaar += Number(t.amount);
    if (t.type === 'PAYMENT') totalJama += Number(t.amount);
  });
  const netBalance = totalUdhaar - totalJama; // Positive means user owes shop (You'll Get). Negative means Shop owes User (Advance)

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await transactionService.create({
        customer: id,
        amount: Number(amount),
        type: transactionType,
        note: note || (transactionType === 'CREDIT' ? 'Items bought' : 'Payment received')
      });
      // Add to local state
      setTransactions([response.data, ...transactions]);
      setIsModalOpen(false);
      setAmount('');
      setNote('');
    } catch (error) {
      console.error("Failed to add transaction", error);
      alert("Error adding transaction.");
    }
  };

  const openModal = (type) => {
    setTransactionType(type);
    setIsModalOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  if (!customer) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Customer not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              <p className="text-sm text-slate-500">{customer.phone || 'No phone number'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Net Balance Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <p className="text-slate-500 font-medium mb-1">Net Balance</p>
            {netBalance === 0 ? (
              <h2 className="text-4xl font-extrabold text-slate-900">Settled</h2>
            ) : netBalance > 0 ? (
              <h2 className="text-4xl font-extrabold text-red-600">₹ {Math.abs(netBalance).toLocaleString('en-IN')} <span className="text-lg font-medium text-slate-500">You'll Get</span></h2>
            ) : (
              <h2 className="text-4xl font-extrabold text-emerald-600">₹ {Math.abs(netBalance).toLocaleString('en-IN')} <span className="text-lg font-medium text-slate-500">Advance</span></h2>
            )}
          </div>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <button onClick={() => openModal('CREDIT')} className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-6 rounded-xl border border-red-200 transition-colors shadow-sm">
              Gave (Udhaar)
            </button>
            <button onClick={() => openModal('PAYMENT')} className="flex-1 sm:flex-none bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 px-6 rounded-xl border border-emerald-200 transition-colors shadow-sm">
              Got (Jama)
            </button>
          </div>
        </div>

        {/* Ledger */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between font-semibold text-slate-600 text-sm">
            <span>Entry Details</span>
            <div className="flex gap-16 mr-4">
              <span>Gave</span>
              <span>Got</span>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No transactions recorded yet.</div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-sm text-slate-500">{tx.note || (tx.type === 'CREDIT' ? 'Credit added' : 'Payment added')}</p>
                  </div>
                  <div className="flex gap-8 text-right min-w-[120px]">
                    <div className="w-16 font-bold text-red-600">{tx.type === 'CREDIT' ? `₹${Number(tx.amount).toLocaleString('en-IN')}` : '-'}</div>
                    <div className="w-16 font-bold text-emerald-600">{tx.type === 'PAYMENT' ? `₹${Number(tx.amount).toLocaleString('en-IN')}` : '-'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className={`p-6 text-white ${transactionType === 'CREDIT' ? 'bg-red-600' : 'bg-emerald-600'}`}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{transactionType === 'CREDIT' ? 'Add Udhaar (You Gave)' : 'Add Jama (You Got)'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">₹</span>
                  </div>
                  <input required autoFocus type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" placeholder="0" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note / Details (Optional)</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Rice 5kg" />
              </div>
              
              <button 
                type="submit" 
                disabled={!amount}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-colors disabled:opacity-50 mt-4 ${transactionType === 'CREDIT' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
              >
                Save {transactionType === 'CREDIT' ? 'Udhaar' : 'Jama'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
