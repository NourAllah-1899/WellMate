import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ChatPopup() {
  const { t } = useLanguage();
  const { me } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setLoading(true);

    try {
      console.log('Sending message to chatbot:', messageToSend);
      const response = await api.post('/api/chatbot/message', {
        message: messageToSend
      });
      console.log('Chatbot response:', response.data);
      const botMessage = { role: 'bot', content: response.data.reply || String(response.data) };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        role: 'bot',
        content: t('chatbot.error')
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  };

  if (!me) return null; // Only show if logged in

  return (
    <div className="wm-chat-popup-container">
      {/* Floating Button */}
      <button 
        className="wm-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        🤖
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="wm-chat-window">
          <div className="wm-chat-header">
            <div className="wm-chat-header-info">
              <span className="wm-chat-bot-icon">🤖</span>
              <div>
                <h3>{t('chatbot.title')}</h3>
                <p>{t('chatbot.subtitle')}</p>
              </div>
            </div>
            <button 
              className="wm-chat-close" 
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              ✕
            </button>
          </div>

          <div className="wm-chat-messages">
            {messages.length === 0 && (
              <div className="wm-chat-empty">
                <div className="wm-chat-empty-icon">💬</div>
                <p>{t('chatbot.description')}</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`wm-chat-msg ${msg.role}`}>
                <div className="wm-chat-msg-bubble">
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="wm-chat-msg bot">
                <div className="wm-chat-msg-bubble thinking">
                  <div className="wm-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="wm-chat-input-area">
            <div className="wm-chat-input-wrapper">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chatbot.placeholder')}
                disabled={loading}
              />
              <button 
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="wm-chat-send-btn"
              >
                {loading ? '...' : '➤'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
