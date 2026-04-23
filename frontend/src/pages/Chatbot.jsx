import api from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';

function Chatbot() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setLoading(true);

    try {
      // Changed from axios.post('http://localhost:5000/api/chatbot/message') 
      // to api.post('/api/chatbot/message') to use the project's API client
      const response = await api.post('/api/chatbot/message', {
        message: messageToSend
      });
      const botMessage = { role: 'bot', content: response.data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-t-2xl shadow-lg p-6 border-b dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('chatbot.title')}</h1>
              <p className="text-gray-600 dark:text-slate-400">{t('chatbot.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white dark:bg-slate-800 shadow-lg min-h-[500px] max-h-[600px] overflow-hidden flex flex-col border-x dark:border-slate-700">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-2">{t('chatbot.welcome')}</h3>
                <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                  {t('chatbot.description')}
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-sm'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">
                      {msg.role === 'user' ? '👤 You' : '🤖 WellMate'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm max-w-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-600 dark:text-slate-400">🤖 WellMate</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{t('chatbot.thinking')}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-b-2xl">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('chatbot.placeholder')}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center transition-colors shadow-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-sm">➤</span>
                  )}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-500 mt-2 text-center uppercase tracking-tighter">
              {t('chatbot.tip')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
