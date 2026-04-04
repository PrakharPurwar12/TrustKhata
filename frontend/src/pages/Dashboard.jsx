import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { customerService } from '../services/customerService';
import { transactionService } from '../services/transactionService';

// Fallback to calculate simple outstanding from transactions
const calculateOutstanding = (transactions) => {
  let toGet = 0;
  let toGive = 0;
  transactions.forEach(t => {
    if (t.type === 'CREDIT') toGet += Number(t.amount);
    if (t.type === 'PAYMENT') toGive += Number(t.amount);
  });
  return { toGet, toGive };
};

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerBalance, setNewCustomerBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [customerResponse, transactionResponse] = await Promise.all([
          customerService.getAll(),
          transactionService.getAll(),
        ]);
        
        setCustomers(customerResponse.data?.length ? customerResponse.data : []);
        setTransactions(transactionResponse.data?.length ? transactionResponse.data : []);
      } catch (error) {
        // If backend isn't connected, we default to empty state to show the Onboarding flow appropriately
        console.warn('Backend not connected, showing empty state.');
        setCustomers([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const { toGet, toGive } = calculateOutstanding(transactions);

  const handleSaveCustomer = async () => {
    try {
      const response = await customerService.create({
        name: newCustomerName,
        phone: newCustomerPhone
      });
      let newTransaction = null;
      if (Number(newCustomerBalance) !== 0) {
        const type = Number(newCustomerBalance) > 0 ? 'CREDIT' : 'PAYMENT';
        const amt = Math.abs(Number(newCustomerBalance));
        const trResponse = await transactionService.create({
          customer: response.data.id,
          amount: amt,
          type: type,
          note: "Opening Balance"
        });
        newTransaction = trResponse.data;
        setTransactions(prev => [newTransaction, ...prev]);
      }
      setCustomers(prev => [response.data, ...prev]);
      setIsModalOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerBalance(0);
    } catch (error) {
      console.error("Failed to save customer", error);
      alert("Failed to save customer. Backend might be down.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 transition-transform hover:scale-105">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">TrustKhata</span>
            </Link>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-200 cursor-pointer shadow-sm">
                S
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header / Greeting */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome to your Shop!</h1>
            <p className="text-slate-500">Here is your business overview.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-slate-500 font-medium">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                You'll Give (Advance)
              </div>
              <div className="text-4xl font-extrabold text-slate-900">₹ {toGive.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-slate-500 font-medium">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                You'll Get (Udhaar)
              </div>
              <div className="text-4xl font-extrabold text-slate-900">₹ {toGet.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Empty State Main Container (Shows if no customers and loading is done) */}
        {!loading && customers.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 border-dashed p-12 text-center shadow-sm">
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
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Customers</h3>
            <div className="space-y-4">
              {customers.slice(0, 5).map(customer => (
                 <div key={customer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                       {customer.name?.charAt(0).toUpperCase() || 'C'}
                     </div>
                     <div>
                       <p className="font-semibold text-slate-900">{customer.name}</p>
                       <p className="text-sm text-slate-500">{customer.phone || 'No phone'}</p>
                     </div>
                   </div>
                   <Link to={`/customer/${customer.id}`} className="text-emerald-600 font-medium hover:text-emerald-700">View Khata &rarr;</Link>
                 </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          
          <div 
            className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-75 backdrop-blur-sm" 
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
          
          <div className="relative z-10 inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6 w-full">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-emerald-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-bold leading-6 text-slate-900">
                  Add New Customer
                </h3>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                    <input type="text" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="e.g. Ramesh Kumar" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
                    <input type="tel" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="e.g. 9876543210" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Opening Balance (Udhaar)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">₹</span>
                      </div>
                      <input type="number" value={newCustomerBalance} onChange={e => setNewCustomerBalance(e.target.value)} className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 sm:mt-8 sm:flex sm:flex-row-reverse">
              <button 
                type="button" 
                onClick={handleSaveCustomer}
                disabled={!newCustomerName.trim()}
                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save Customer
              </button>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
