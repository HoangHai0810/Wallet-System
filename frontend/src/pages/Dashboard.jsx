import React, { useEffect, useState } from 'react';
import { walletService } from '../services/api';
import { LogOut, ArrowUpRight, ArrowDownLeft, RefreshCw, History, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';

const Dashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [bankHistory, setBankHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const walletRes = await walletService.getWallet();
      setWallet(walletRes.data);
      const historyRes = await walletService.getHistory({ page: 0, size: 5 });
      setHistory(historyRes.data.content);
      const bankRes = await walletService.getBankTransactions(0, 5);
      setBankHistory(bankRes.content);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await walletService.getAiAnalysis();
      setAiAnalysis(res.data);
    } catch (err) {
      console.error(err);
      setAiAnalysis("Sorry, AI Assistant is currently unavailable. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="container text-center">Loading Wallet...</div>;

  return (
    <div className="container">
      <header className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Wallet Overview</h2>
          <p className="text-secondary text-sm">Welcome back to your dashboard</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444' }}>
          <LogOut size={20} />
        </button>
      </header>

      <div className="flex gap-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ flex: 1, padding: '2rem' }}>
          <p className="text-secondary text-sm">Total Balance</p>
          <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>
            ${wallet?.balance?.toLocaleString() || '0'}
          </h1>
          <div className="flex gap-4 mt-4">
            <button className="flex items-center gap-4" style={{ flex: 1 }} onClick={() => navigate('/transfer')}>
              <ArrowUpRight size={18} /> Transfer
            </button>
            <button
              style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}
              onClick={() => setShowDepositModal(true)}
            >
              <ArrowDownLeft size={18} /> Deposit
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ width: '350px', padding: '2rem' }}>
          <h3 className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
            <History size={18} /> Quick Actions
          </h3>
          <p className="text-secondary text-sm">Scan QR, check rewards, or manage cards.</p>
          <div className="mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="glass-card text-center" style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => fetchData()}>
              <RefreshCw size={20} style={{ margin: '0 auto' }} />
              <p className="text-sm mt-4">Sync</p>
            </div>
            <div className="glass-card text-center text-info" style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => setShowQrModal(true)}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.9rem' }}>📱</div>
              <p className="text-sm mt-2">My QR</p>
            </div>
          </div>
        </div>
      </div>

      {showDepositModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '2rem', width: '400px', position: 'relative' }}>
            <h3 style={{ marginBottom: '1rem' }}>Deposit Funds</h3>
            <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
              To top up your wallet instantly, please make a bank transfer to our corporate account.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p className="text-sm text-secondary mb-1">Bank</p>
              <p style={{ fontWeight: 'bold' }}>MB Bank (Military Bank)</p>

              <p className="text-sm text-secondary mt-3 mb-1">Account Number</p>
              <p style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.2rem', color: '#60a5fa' }}>031208100212</p>

              <p className="text-sm text-secondary mt-3 mb-1">Account Name</p>
              <p style={{ fontWeight: 'bold' }}>HOANG HAI ANH</p>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px dashed #f59e0b', padding: '1rem', marginTop: '1.5rem', borderRadius: '8px' }}>
                <p className="text-sm text-secondary mb-1" style={{ color: '#f59e0b' }}>Transfer Message (CRITICAL)</p>
                <p style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.2rem', color: '#f59e0b' }}>
                  NAPTIEN [Your Phone Number]
                </p>
                <p className="text-xs mt-2" style={{ color: '#fcd34d' }}>Example: NAPTIEN 0905116043</p>
              </div>
            </div>

            <button
              style={{ width: '100%', background: '#3b82f6', color: 'white' }}
              onClick={() => setShowDepositModal(false)}
            >
              I Understand, Close
            </button>
          </div>
        </div>
      )}

      {showQrModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '2.5rem', width: '380px', textAlign: 'center', position: 'relative' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Your Deposit QR</h3>
            <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
              Scan with any banking app to top up instantly.
            </p>

            <div style={{ background: '#fff', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'inline-block' }}>
              <img
                src={`https://img.vietqr.io/image/970422-031208100212-compact2.png?amount=100000&addInfo=NAPTIEN%20${wallet?.phoneNumber}&accountName=HOANG%20HAI%20ANH`}
                alt="VietQR"
                style={{ width: '100%', maxWidth: '280px', height: 'auto', borderRadius: '8px' }}
              />
            </div>

            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#60a5fa', marginBottom: '0.5rem' }}>MB Bank • 031208100212</p>
            <p className="text-sm text-secondary" style={{ marginBottom: '1.5rem' }}>
              Content: <strong>NAPTIEN {wallet?.phoneNumber || 'YOUR_PHONE'}</strong><br />
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(Amount defaults to 100k, editable in your bank app)</span>
            </p>

            <button
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)' }}
              onClick={() => setShowQrModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h3 className="flex items-center gap-4">
            <Sparkles size={20} color="#f59e0b" /> AI Financial Insights
          </h3>
          <button
            className="text-sm px-8"
            onClick={handleAiAnalysis}
            disabled={aiLoading}
            style={{
              background: aiLoading ? 'rgba(255,255,255,0.05)' : 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            {aiLoading ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>

        {aiLoading ? (
          <div className="text-secondary text-sm animate-pulse">
            Getting insights from Gemini AI... Please wait.
          </div>
        ) : aiAnalysis ? (
          <div
            className="text-sm leading-relaxed"
            style={{
              color: '#cbd5e1',
              background: 'rgba(255,255,255,0.02)',
              padding: '1.5rem',
              borderRadius: '12px',
              whiteSpace: 'pre-wrap'
            }}
          >
            {aiAnalysis}
          </div>
        ) : (
          <p className="text-secondary text-sm">
            Click "Refresh Insights" to let AI analyze your recent transactions and provide saving tips.
          </p>
        )}
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h3 className="flex items-center gap-4" style={{ marginBottom: '1.5rem' }}>
          <span className="text-info">🏦</span> Real Bank Transactions (MB Bank)
        </h3>
        {bankHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bankHistory.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div className="flex items-center gap-4">
                  <div style={{ padding: '0.5rem', background: tx.transferType === 'in' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', borderRadius: '8px' }}>
                    {tx.transferType === 'in' ? <ArrowDownLeft size={20} color="#22c55e" /> : <ArrowUpRight size={20} color="#ef4444" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-4">
                      <p style={{ fontWeight: 600 }}>{tx.referenceNumber}</p>
                      <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#94a3b8' }}>
                        MB Bank
                      </span>
                    </div>
                    <p className="text-secondary text-sm">{new Date(tx.transactionDate).toLocaleString()}</p>
                    <p className="text-secondary text-xs mt-1">{tx.content}</p>
                  </div>
                </div>
                <p style={{ fontWeight: 'bold', color: tx.transferType === 'in' ? '#22c55e' : '#ef4444' }}>
                  {tx.transferType === 'in' ? '+' : '-'}${tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-secondary text-sm text-center py-4">
            No bank transactions found. Connect via Webhook to sync data.
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Wallet Transactions</h3>
        {history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div className="flex items-center gap-4">
                  <div style={{ padding: '0.5rem', background: tx.type === 'TRANSFER' ? 'rgba(99,102,241,0.2)' : 'rgba(34,197,94,0.2)', borderRadius: '8px' }}>
                    {tx.type === 'TRANSFER' ? <ArrowUpRight size={20} color="#6366f1" /> : <ArrowDownLeft size={20} color="#22c55e" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-4">
                      <p style={{ fontWeight: 600 }}>{tx.type}</p>
                      <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#94a3b8' }}>
                        {tx.category || 'General'}
                      </span>
                    </div>
                    <p className="text-secondary text-sm">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p style={{ fontWeight: 'bold', color: tx.type === 'TRANSFER' ? '#ef4444' : '#22c55e' }}>
                  {tx.type === 'TRANSFER' ? '-' : '+'}${tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-secondary">No transactions yet.</p>
        )}
      </div>
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
