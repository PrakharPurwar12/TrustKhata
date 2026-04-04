import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { customerService } from '../services/customerService';
import { transactionService } from '../services/transactionService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // States mapping to backend endpoints
  const [shopName, setShopName] = useState('Your Shop');
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({ toGet: 0, toGive: 0 });
  const [loading, setLoading] = useState(true);
  
  // Search Bar state
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer forms  
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerBalance, setNewCustomerBalance] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Fetch Auth Identity, Customers with annotated balance, and Shop Aggregate sums concurrently
        const [meRes, customerRes, summaryRes] = await Promise.all([
          api.get('users/me/'),
          customerService.getAll(),
          api.get('users/summary/')
        ]);
        
        setShopName(meRes.data.name || 'Your Shop');
        setCustomers(customerRes.data?.length ? customerRes.data : []);
        setSummary({
          toGet: summaryRes.data.to_get || 0,
          toGive: summaryRes.data.to_give || 0
        });
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          navigate('/login');
        } else {
          console.warn('Backend not connected or failing, relying on empty state.', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('users/logout/');
      navigate('/login');
    } catch (e) {
      console.error(e);
      navigate('/login'); // Force navigate anyway
    }
  };

  const handleSaveCustomer = async () => {
    try {
      const response = await customerService.create({
        name: newCustomerName,
        phone: newCustomerPhone
      });
      // If balance exists, post a transaction
      if (Number(newCustomerBalance) !== 0) {
        const type = Number(newCustomerBalance) > 0 ? 'CREDIT' : 'PAYMENT';
        const amt = Math.abs(Number(newCustomerBalance));
        await transactionService.create({
          customer: response.data.id,
          amount: amt,
          type: type,
          note: "Opening Balance"
        });
        
        // Update summary locally to keep UI fast
        if (type === 'CREDIT') {
          setSummary(prev => ({ ...prev, toGet: prev.toGet + amt }));
        } else {
          setSummary(prev => ({ ...prev, toGive: prev.toGive + amt }));
        }
        response.data.balance = Number(newCustomerBalance);
      } else {
        response.data.balance = 0;
      }
      
      setCustomers(prev => [response.data, ...prev]);
      setIsModalOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerBalance(0);
    } catch (error) {
      console.error("Failed to save customer", error);
      alert("Failed to save customer.");
    }
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.phone?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 transition-transform hover:scale-105">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">TrustKhata</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-slate-600 font-medium">Hello, {shopName}</span>
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition-colors border border-rose-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header / Greeting */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome to {shopName}!</h1>
            <p className="text-slate-500">Here is your business overview.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1 (Advance - You'll Give) */}
          <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm shadow-red-50 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-slate-500 font-medium">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                You'll Give (Advance)
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-slate-900">₹ {Math.abs(summary.toGive).toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Card 2 (Udhaar - You'll Get) */}
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm shadow-emerald-50 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-slate-500 font-medium">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                You'll Get (Udhaar)
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-slate-900">₹ {Math.abs(summary.toGet).toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Empty State Main Container (Shows if no customers and loading is done) */}
        {!loading && customers.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Your Khata is Empty!</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              It looks like you haven't added any customers yet. Add your first customer to start tracking your daily udhaar and collections.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-emerald-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Your First Customer
            </button>
          </div>
        )}

        {/* Populated State (Shows if there are customers) */}
        {!loading && customers.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Customers Directory
                <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-sm font-semibold">{customers.length}</span>
              </h3>
              
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or phone..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  No customers found matching "{searchQuery}"
                </div>
              ) : (
                filteredCustomers.map(customer => {
                  const bal = Number(customer.balance || 0);
                  const isAdvance = bal < 0;
                  const isSettled = bal === 0;

                  return (
                    <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 gap-4">
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                          {customer.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{customer.name}</p>
                          <p className="text-sm font-medium text-slate-500">{customer.phone || 'No phone'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end sm:gap-8 w-full sm:w-auto ml-16 sm:ml-0 border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-0.5">Net Balance</p>
                          {isSettled ? (
                            <p className="font-bold text-slate-600">₹ 0 <span className="font-normal text-sm">(Settled)</span></p>
                          ) : isAdvance ? (
                            <p className="font-bold text-emerald-600">₹ {Math.abs(bal).toLocaleString('en-IN')} <span className="font-normal text-sm bg-emerald-100 text-emerald-700 px-2 rounded-full ml-1">Advance</span></p>
                          ) : (
                            <p className="font-bold text-rose-600">₹ {Math.abs(bal).toLocaleString('en-IN')} <span className="font-normal text-sm bg-rose-100 text-rose-700 px-2 rounded-full ml-1">Udhaar</span></p>
                          )}
                        </div>
                        
                        <Link to={`/customer/${customer.id}`} className="bg-white border border-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl hover:text-emerald-600 hover:border-emerald-200 hover:shadow-sm transition-all text-sm">
                          View Khata &rarr;
                        </Link>
                      </div>
                      
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="relative z-10 w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 transform transition-all">
            <div className="absolute top-6 right-6">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Add Customer</h3>
              <p className="text-slate-500 text-sm mt-1">Start tracking their khata instantly</p>
            </div>
            
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSaveCustomer(); }}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Customer Name <span className="text-rose-500">*</span></label>
                <input required type="text" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="e.g. Ramesh Kumar" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input type="tel" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="e.g. 9876543210" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Opening Balance <span className="text-slate-400 font-normal">(Udhaar)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">₹</span>
                  </div>
                  <input type="number" value={newCustomerBalance} onChange={e => setNewCustomerBalance(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={!newCustomerName.trim()}
                className="w-full py-3.5 mt-6 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
              >
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
