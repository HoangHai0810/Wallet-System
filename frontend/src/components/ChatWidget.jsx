import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import axios from 'axios';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your Wallet Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const chatbotUrl = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${chatbotUrl}/chat`, 
        {
          message: userMessage,
          thread_id: 'user_session_1'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessages(prev => [...prev, { role: 'ai', content: response.data.response }]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to my brain right now. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '380px',
          height: '550px',
          background: '#0f172a',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#818cf8" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>AI Assistant</h4>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>Always active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', color: '#94a3b8', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                {msg.role === 'ai' && (
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color="#94a3b8" />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                  background: msg.role === 'user' ? '#6366f1' : 'rgba(255,255,255,0.05)',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  color: msg.role === 'user' ? 'white' : '#cbd5e1',
                  border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={14} color="#818cf8" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Bot size={14} color="#94a3b8" />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '4px 20px 20px 20px', display: 'flex', gap: '4px' }}>
                  <div className="dot" style={{ width: '4px', height: '4px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0.1s' }}></div>
                  <div className="dot" style={{ width: '4px', height: '4px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                  <div className="dot" style={{ width: '4px', height: '4px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '12px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                color: 'white',
                fontSize: '0.85rem'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: input.trim() ? '#6366f1' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;
