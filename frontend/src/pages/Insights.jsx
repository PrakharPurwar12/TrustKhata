import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, TrendingUp, TrendingDown, 
  Users, Activity, AlertTriangle, ChevronRight, 
  PieChart as PieChartIcon, CheckCircle2,
  Receipt, ArrowUpRight, ArrowDownLeft, ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { insightsService } from '../services/insightsService';
import { parseApiError } from '../utils/apiError';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { CustomerCardSkeleton } from '../components/Skeleton';

// Define a custom tooltip for the charts to match our theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-600">
        <p className="font-bold mb-2 text-slate-300">
          {new Date(label).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm font-bold mt-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400 uppercase tracking-widest text-[10px]">{entry.name}:</span>
            <span>₹ {entry.value.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Insights() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [range, setRange] = useState(30); // 7, 30, 90

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await insightsService.getInsights(range);
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        if (isMounted) {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            navigate('/login');
          } else {
            toast.error(parseApiError(err, 'Failed to load insights'));
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInsights();
    return () => { isMounted = false; };
  }, [range, navigate]);

  // Calculate Health Score (0-100)
  const healthScore = useMemo(() => {
    if (!data) return 0;
    const { recovery_rate, active_customers, total_outstanding, period_recovery, settled_customers } = data.totals;
    
    // If business has no active debtors, but has settled customers, they are perfectly healthy!
    if (active_customers === 0) {
      return settled_customers > 0 ? 100 : 50; 
    }

    let score = 50; // Base score
    
    // Add points for recovery rate (max 30)
    score += Math.min(30, (recovery_rate / 100) * 30);
    
    // Add points for recent activity (max 20)
    if (period_recovery > 0) score += 20;
    else if (period_recovery === 0 && total_outstanding > 0) {
      // Small penalty if they have outstanding but no recent activity
      score -= 10;
    }
    
    // Penalize massive outstanding balances without activity
    if (total_outstanding > 20000 && recovery_rate < 20) score -= 20;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [data]);

  // Handle Recharts single-point bug by padding the data if it only has 1 point
  const chartData = useMemo(() => {
    if (!data?.trend || data.trend.length === 0) return [];
    if (data.trend.length === 1) {
      const point = data.trend[0];
      const prevDate = new Date(point.date);
      prevDate.setDate(prevDate.getDate() - 1);
      return [
        { date: prevDate.toISOString().split('T')[0], credit: 0, payment: 0 },
        point
      ];
    }
    return data.trend;
  }, [data]);

  const getHealthStatus = (score) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
    if (score >= 60) return { text: 'Healthy', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' };
    if (score >= 40) return { text: 'Needs Attention', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
    return { text: 'High Risk', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' };
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col p-4 sm:p-8 space-y-6">
        <div className="flex gap-4 mb-4"><CustomerCardSkeleton /><CustomerCardSkeleton /></div>
        <div className="h-64 bg-white dark:bg-slate-800 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white dark:bg-slate-800 rounded-3xl animate-pulse"></div>
          <div className="h-64 bg-white dark:bg-slate-800 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const chartColors = {
    credit: isDark ? '#fb7185' : '#e11d48', // rose-400 : rose-600
    payment: isDark ? '#34d399' : '#059669', // emerald-400 : emerald-600
    grid: isDark ? '#334155' : '#f1f5f9', // slate-700 : slate-100
    text: isDark ? '#94a3b8' : '#64748b', // slate-400 : slate-500
  };

  const status = getHealthStatus(healthScore);

  return (
    <motion.div 
      initial="initial" animate="animate" exit="exit" variants={pageVariants}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300"
    >
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all hover:-translate-x-1">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Business Insights</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analytics Center</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setRange(days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === days ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Health Score & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          <div className={`col-span-1 md:col-span-1 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex flex-col justify-center relative overflow-hidden transition-colors ${status.bg}`}>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Health Score</p>
             <div className="flex items-end gap-2">
                <span className={`text-5xl font-black tracking-tighter ${status.color}`}>{healthScore}</span>
                <span className="text-slate-400 font-bold mb-1">/100</span>
             </div>
             <div className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-bold w-fit ${status.color} bg-white/50 dark:bg-black/20 backdrop-blur-sm`}>
                {status.text}
             </div>
          </div>

          <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm/5 hover:shadow-xl hover:shadow-rose-600/5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 mb-4 flex items-center justify-center"><ArrowUpRight size={20} strokeWidth={3} /></div>
              <p className="text-2xl font-black tracking-tight">₹ {data?.totals.total_outstanding.toLocaleString('en-IN')}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Pending</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm/5 hover:shadow-xl hover:shadow-emerald-600/5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 mb-4 flex items-center justify-center"><ArrowDownLeft size={20} strokeWidth={3} /></div>
              <p className="text-2xl font-black tracking-tight">₹ {data?.totals.period_recovery.toLocaleString('en-IN')}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{range}D Recovery</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm/5 hover:shadow-xl hover:shadow-blue-600/5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 mb-4 flex items-center justify-center"><Activity size={20} strokeWidth={3} /></div>
              <p className="text-2xl font-black tracking-tight">{data?.totals.recovery_rate}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recovery Rate</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm/5 hover:shadow-xl hover:shadow-indigo-600/5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 mb-4 flex items-center justify-center"><Users size={20} strokeWidth={3} /></div>
              <p className="text-2xl font-black tracking-tight">{data?.totals.active_customers}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Debtors</p>
            </div>
          </div>
        </div>

        {/* Hero Chart: Trend */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm/5 relative">
          {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 rounded-[2.5rem]" />}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={20} /> Flow Trend
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Credit Given vs Payment Received</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
               <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Got Payment</div>
               <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500" /> Gave Credit</div>
            </div>
          </div>

          <div className="h-[300px] w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.credit} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartColors.credit} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPayment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.payment} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartColors.payment} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: chartColors.text, fontSize: 10, fontWeight: 'bold' }} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: chartColors.text, fontSize: 10, fontWeight: 'bold' }}
                    tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" name="Credit Given" dataKey="credit" stroke={chartColors.credit} strokeWidth={3} fillOpacity={1} fill="url(#colorCredit)" />
                  <Area type="monotone" name="Payment Got" dataKey="payment" stroke={chartColors.payment} strokeWidth={3} fillOpacity={1} fill="url(#colorPayment)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <Receipt size={48} className="mb-4 opacity-20" />
                {data?.totals.total_outstanding > 0 ? (
                  <>
                    <p className="font-bold text-sm text-slate-500 dark:text-slate-300">Not enough activity yet to generate trend insights.</p>
                    <p className="text-xs font-bold mt-2 opacity-70">You still have ₹{data.totals.total_outstanding.toLocaleString('en-IN')} pending in the market.</p>
                  </>
                ) : (
                  <p className="font-bold text-sm">No transaction data for this period.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Insights & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Top Debtors Distribution */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm/5 flex flex-col">
            <h3 className="text-xl font-black tracking-tight mb-1 flex items-center gap-2">
              <PieChartIcon className="text-rose-500" size={20} /> Where Money Is Stuck
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Top accounts with pending balances</p>
            
            {data?.top_debtors && data.top_debtors.length > 0 ? (
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {data.top_debtors.map((debtor, idx) => (
                  <Link 
                    to={`/customer/${debtor.id}`}
                    key={debtor.id} 
                    className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-rose-500 shadow-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{debtor.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{debtor.phone}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="font-black text-rose-600 dark:text-rose-400">₹ {debtor.balance.toLocaleString('en-IN')}</p>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                <CheckCircle2 size={48} className="mb-4 text-emerald-500 opacity-50" />
                <p className="font-bold text-sm">Amazing! No pending collections.</p>
              </div>
            )}
          </div>

          {/* Action Alerts & Timeline */}
          <div className="flex flex-col gap-6 sm:gap-8">
            
            {/* Smart Alerts */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-2">Action Insights</h3>
              
              {data?.totals.total_outstanding > 20000 && (
                <div className="bg-rose-50 dark:bg-rose-500/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-500/20 flex gap-4">
                  <div className="mt-1"><ShieldAlert className="text-rose-600" size={24} /></div>
                  <div>
                    <h4 className="font-black text-rose-900 dark:text-rose-400 mb-1">High Capital Locked</h4>
                    <p className="text-xs font-bold text-rose-700/70 dark:text-rose-300/70 leading-relaxed">
                      You have over ₹20,000 pending in the market. Consider sending payment reminders to your top {data.top_debtors.length} debtors to improve cash flow.
                    </p>
                  </div>
                </div>
              )}

              {data?.totals.recovery_rate < 30 && data?.totals.total_given > 1000 && (
                <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-500/20 flex gap-4">
                  <div className="mt-1"><AlertTriangle className="text-amber-600" size={24} /></div>
                  <div>
                    <h4 className="font-black text-amber-900 dark:text-amber-400 mb-1">Low Recovery Rate</h4>
                    <p className="text-xs font-bold text-amber-700/70 dark:text-amber-300/70 leading-relaxed">
                      Your historical recovery rate is only {data.totals.recovery_rate}%. Review credit policies and avoid giving large udhaar to new customers.
                    </p>
                  </div>
                </div>
              )}

              {healthScore > 80 && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 flex gap-4">
                  <div className="mt-1"><CheckCircle2 className="text-emerald-600" size={24} /></div>
                  <div>
                    <h4 className="font-black text-emerald-900 dark:text-emerald-400 mb-1">Healthy Cash Flow</h4>
                    <p className="text-xs font-bold text-emerald-700/70 dark:text-emerald-300/70 leading-relaxed">
                      Your business is maintaining excellent recovery cycles. Keep up the good relationship with your customers.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm/5 flex-1">
              <h3 className="text-xl font-black tracking-tight mb-6">Recent Activity</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                {data?.recent_transactions && data.recent_transactions.length > 0 ? (
                  data.recent_transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors">
                        {tx.type === 'CREDIT' ? <ArrowUpRight size={16} className="text-rose-500" /> : <ArrowDownLeft size={16} className="text-emerald-500" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                           <Link to={`/customer/${tx.customer_id}`} className="font-bold text-sm hover:text-emerald-600 transition-colors">{tx.customer_name}</Link>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <p className={`font-black ${tx.type === 'CREDIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                           {tx.type === 'CREDIT' ? 'Gave' : 'Got'} ₹ {tx.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 font-bold py-4">No recent activity</div>
                )}
              </div>
              {data?.recent_transactions && data.recent_transactions.length > 5 && (
                <div className="mt-6 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full">End of recent history</span>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
    </motion.div>
  );
}
