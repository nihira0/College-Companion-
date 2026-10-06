import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  CreditCard,
  Receipt,
  Award,
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  FileText,
  Sparkles,
  Download,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const StudentFees = () => {
  const { token, user } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('breakdown');
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Queries state
  const [queries, setQueries] = useState([]);
  const [querySubject, setQuerySubject] = useState('');
  const [queryDesc, setQueryDesc] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchFeeSummary = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/academic/fees/summary', { headers });
      if (res.ok) {
        const data = await res.json();
        setFeeData(data);
      }
    } catch (err) {
      addToast('Error loading fee details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueries = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/academic/fees/queries', { headers });
      if (res.ok) {
        setQueries(await res.json());
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchFeeSummary();
    fetchQueries();
  }, [token]);

  const handleCreateQuery = async (e) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryDesc.trim()) {
      return addToast('Please enter both subject and details for your discrepancy ticket', 'warning');
    }

    setSubmittingQuery(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch('/api/academic/fees/queries', {
        method: 'POST',
        headers,
        body: JSON.stringify({ subject: querySubject, description: queryDesc })
      });

      if (res.ok) {
        const item = await res.json();
        setQueries(prev => [item, ...prev]);
        addToast('Fee discrepancy ticket submitted successfully! 🎟️', 'success', '💬');
        setQuerySubject('');
        setQueryDesc('');
      } else {
        addToast('Failed to submit fee query', 'error');
      }
    } catch (err) {
      addToast('Failed to submit fee query', 'error');
    } finally {
      setSubmittingQuery(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-poppins text-xs font-semibold">
          <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading Fee Records...
        </div>
      </div>
    );
  }

  const {
    program,
    academicYear,
    status,
    dueDate,
    totalPayable,
    scholarshipConcession,
    netPayable,
    amountPaid,
    outstandingBalance,
    itemizedBreakdown,
    installments,
    paymentHistory
  } = feeData || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Header */}
      <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30 shrink-0">
              💳
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100">
                  Student Fee Portal
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-poppins font-bold uppercase tracking-wide border ${
                  status === 'Paid'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                }`}>
                  {status === 'Paid' ? 'Paid in Full ✨' : 'Partial Payment'}
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-poppins mt-1">
                {program || 'B.Tech Information Technology'} • Academic Year {academicYear || '2025-2026'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Summary Cards */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-poppins">Total Payable</span>
              <span className="font-poppins font-extrabold text-base text-slate-800 dark:text-slate-100">
                ₹{netPayable ? netPayable.toLocaleString() : '80,000'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-poppins">Amount Paid</span>
              <span className="font-poppins font-extrabold text-base text-emerald-700 dark:text-emerald-300">
                ₹{amountPaid ? amountPaid.toLocaleString() : '60,000'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block font-poppins">Balance Due</span>
              <span className="font-poppins font-extrabold text-base text-rose-700 dark:text-rose-300">
                ₹{outstandingBalance ? outstandingBalance.toLocaleString() : '20,000'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/50 pb-3 overflow-x-auto">
        {[
          { id: 'breakdown', label: 'Fee Breakdown & Concessions', icon: Layers },
          { id: 'installments', label: 'Installment Schedule', icon: Calendar },
          { id: 'history', label: 'Payment History & Receipts', icon: Receipt },
          { id: 'helpdesk', label: 'Discrepancy Tickets', icon: HelpCircle }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-poppins text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Itemized Fee Breakdown & Scholarships */}
      {activeTab === 'breakdown' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Itemized Fee breakdown */}
          <div className="md:col-span-2 glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100 flex items-center justify-between">
              <span>Itemized Fee Structure</span>
              <span className="text-xs font-normal text-slate-400 font-poppins">Year 2025-2026</span>
            </h3>

            <div className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
              {itemizedBreakdown?.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between text-xs font-poppins">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    {item.feeHead}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-poppins text-slate-500">
                <span>Gross Total Academic Fees:</span>
                <span className="font-mono font-semibold">₹{totalPayable?.toLocaleString()}</span>
              </div>

              {scholarshipConcession && (
                <div className="flex items-center justify-between text-xs font-poppins text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Less: Approved Scholarship ({scholarshipConcession.name}):</span>
                  <span className="font-mono font-bold">- ₹{scholarshipConcession.amount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm font-poppins font-extrabold text-slate-800 dark:text-slate-100 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                <span>Net Payable Fee Amount:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-lg">
                  ₹{netPayable?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right Col: Approved Scholarship / Concession Card */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl space-y-3 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-xl">
                  🏆
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                    Scholarship & Concession
                  </h4>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Approved & Verified by Accounts
                  </p>
                </div>
              </div>

              {scholarshipConcession ? (
                <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-emerald-500/20 space-y-2">
                  <p className="font-poppins font-bold text-xs text-slate-800 dark:text-slate-200">
                    {scholarshipConcession.name}
                  </p>
                  <div className="flex items-center justify-between text-xs font-poppins">
                    <span className="text-slate-500">Concession Amount:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{scholarshipConcession.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-poppins text-slate-400 pt-1 border-t border-slate-200/40">
                    <span>Approved On:</span>
                    <span>{scholarshipConcession.approvedDate}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-poppins">No active fee concessions applied.</p>
              )}
            </div>

            {/* Account Helpline Info */}
            <div className="glass-card rounded-3xl p-5 border border-slate-200/40 dark:border-slate-800/40 text-xs font-poppins space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Need Fee Financial Assistance?
              </h5>
              <p className="text-slate-500 leading-relaxed">
                Students eligible for EBC, TFWS, or Post-Matric Freeship schemes can submit documents directly to the Central Accounts Desk.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Installment Schedule */}
      {activeTab === 'installments' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100">
                Academic Year Installment Schedule
              </h3>
              <p className="text-xs text-slate-500 font-poppins mt-0.5">
                3-stage payment plan for Semester 5 & 6 tuition fees
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {installments?.map((inst, i) => {
              const isPaid = inst.status === 'Paid';
              return (
                <div
                  key={i}
                  className={`p-5 rounded-3xl border transition-all ${
                    isPaid
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white/40 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-800/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-poppins font-bold text-xs text-slate-400 uppercase tracking-wider">
                      Installment #{inst.installmentNo}
                    </span>
                    {isPaid ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Paid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        <Clock className="w-3 h-3 text-amber-500" /> Due: {inst.dueDate}
                      </span>
                    )}
                  </div>

                  <div className="font-poppins font-extrabold text-xl text-slate-800 dark:text-slate-100 mb-2 font-mono">
                    ₹{inst.amount.toLocaleString()}
                  </div>

                  {isPaid ? (
                    <div className="text-[11px] font-poppins text-slate-500 space-y-1 pt-2 border-t border-emerald-500/20">
                      <div>Paid Date: <span className="font-medium text-slate-700 dark:text-slate-300">{inst.paidDate}</span></div>
                      <div>Receipt: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{inst.receiptNo}</span></div>
                    </div>
                  ) : (
                    <div className="text-[11px] font-poppins text-slate-500 pt-2 border-t border-slate-200/40">
                      Payment deadline: <span className="font-semibold text-rose-500">{inst.dueDate}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Payment History & Receipts */}
      {activeTab === 'history' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
          <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100">
            Payment History & Electronic Receipts
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-poppins">
              <thead>
                <tr className="border-b border-slate-200/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-4">Transaction Ref</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Payment Mode</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30">
                {paymentHistory?.map((p, idx) => (
                  <tr key={idx} className="hover:bg-white/30 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-100">
                      {p.transactionRef}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{p.date}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{p.mode}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors font-semibold text-[11px] flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Discrepancy Tickets & Queries */}
      {activeTab === 'helpdesk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submit Query Form */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" /> Raise Fee Discrepancy Query
            </h3>

            <form onSubmit={handleCreateQuery} className="space-y-4 font-poppins text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Query Subject
                </label>
                <input
                  type="text"
                  value={querySubject}
                  onChange={(e) => setQuerySubject(e.target.value)}
                  placeholder="e.g. Scholarship concession not reflected in Installment 3"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Detailed Explanation / Receipt Reference
                </label>
                <textarea
                  rows={4}
                  value={queryDesc}
                  onChange={(e) => setQueryDesc(e.target.value)}
                  placeholder="Provide transaction numbers, payment date, or query context..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingQuery}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-poppins font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Send className="w-4 h-4" />
                {submittingQuery ? 'Submitting...' : 'Submit Discrepancy Ticket'}
              </button>
            </form>
          </div>

          {/* Ticket History */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100">
              Submitted Tickets History ({queries.length})
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {queries.length === 0 ? (
                <p className="text-xs text-slate-400 font-poppins">No fee queries submitted.</p>
              ) : (
                queries.map(q => (
                  <div key={q.id || q._id} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 space-y-2 font-poppins text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{q.subject}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        q.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'
                      }`}>
                        {q.status}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">{q.description}</p>

                    {q.response && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-200">
                        <span className="font-bold block">Accounts Response:</span>
                        {q.response}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 text-right">
                      Submitted on: {q.createdAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md glass-card rounded-3xl p-6 border border-emerald-500/30 bg-white/90 dark:bg-slate-900/90 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-1 border-b border-slate-200/40 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                🌿
              </div>
              <h3 className="font-poppins font-extrabold text-lg text-slate-800 dark:text-slate-100">
                Official Fee Receipt
              </h3>
              <p className="text-[11px] text-slate-500 font-poppins">
                TCET Autonomous Academic Accounts Portal
              </p>
            </div>

            <div className="space-y-2.5 font-poppins text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Receipt No:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{selectedReceipt.receiptNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Transaction Reference:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedReceipt.transactionRef}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Payment Date:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedReceipt.mode}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold">
                <span className="text-slate-800 dark:text-slate-100">Amount Paid:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">₹{selectedReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => addToast('Receipt download started! 📄', 'success')}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-500 text-white font-poppins font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-poppins font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
