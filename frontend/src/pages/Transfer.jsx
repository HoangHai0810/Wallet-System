import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletService } from '../services/api';
import { ArrowLeft, Send, Phone, Hash } from 'lucide-react';

const categories = [
  { id: 'GENERAL', label: 'General' },
  { id: 'FOOD', label: 'Food & Dining' },
  { id: 'SHOPPING', label: 'Shopping' },
  { id: 'BILLS', label: 'Utility Bills' },
  { id: 'ENTERTAINMENT', label: 'Entertainment' },
  { id: 'OTHER', label: 'Other' },
];

const Transfer = () => {
  const [toWalletId, setToWalletId] = useState('');
  const [toPhoneNumber, setToPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [transferMode, setTransferMode] = useState('id'); // 'id' or 'phone'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleTransfer = async (e) => {
    const transferAmount = parseFloat(amount);
    if (transferAmount < 5000) {
      setError('Minimum transfer amount is 5,000 VNĐ');
      return;
    }

    const idempotencyKey = crypto.randomUUID();

    const data = {
      amount: parseFloat(amount),
      category: category,
      [transferMode === 'id' ? 'toWalletId' : 'toPhoneNumber']: transferMode === 'id' ? parseInt(toWalletId) : toPhoneNumber
    };

    try {
      await walletService.transfer(data, idempotencyKey);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please check your information.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', cursor: 'pointer' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Send Money</h2>
        
        {success ? (
          <div className="text-center" style={{ color: '#22c55e', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3>Transaction Successful!</h3>
            <p className="text-sm">Returning to home...</p>
          </div>
        ) : (
          <form onSubmit={handleTransfer}>
            {error && <p style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button 
                    type="button"
                    onClick={() => setTransferMode('id')}
                    className={transferMode === 'id' ? 'active' : ''}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', background: transferMode === 'id' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <Hash size={16} /> Via Wallet ID
                </button>
                <button 
                    type="button"
                    onClick={() => setTransferMode('phone')}
                    className={transferMode === 'phone' ? 'active' : ''}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', background: transferMode === 'phone' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <Phone size={16} /> Via Phone
                </button>
            </div>

            {transferMode === 'id' ? (
                <div className="mt-4">
                  <label className="text-sm text-secondary">Recipient Wallet ID</label>
                  <input type="number" value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} required placeholder="e.g.: 2" />
                </div>
            ) : (
                <div className="mt-4">
                  <label className="text-sm text-secondary">Phone Number</label>
                  <input type="text" value={toPhoneNumber} onChange={(e) => setToPhoneNumber(e.target.value)} required placeholder="e.g.: 0901234567" />
                </div>
            )}
            
            <div className="mt-4">
              <label className="text-sm text-secondary">Amount (VNĐ)</label>
              <input type="number" step="1000" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="e.g.: 100,000" />
            </div>

            <div className="mt-4">
              <label className="text-sm text-secondary">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', outline: 'none' }}
              >
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id} style={{ background: '#1e1b4b' }}>{cat.label}</option>
                ))}
              </select>
            </div>

            <button type="submit" style={{ width: '100%', marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', borderRadius: '0.75rem', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              <Send size={18} /> Execute Transfer
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Transfer;
