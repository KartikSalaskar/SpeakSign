import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Volume2, AlertCircle, WifiOff } from 'lucide-react';

const ChatbotPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      message: "Hello! I am SpeakSign. I can answer your questions about Sign Language.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health', {
          method: 'GET',
        });
        if (response.ok) {
          setConnectionError(false);
        } else {
          setConnectionError(true);
        }
      } catch (error) {
        setConnectionError(true);
      }
    };
    
    checkConnection();
  }, []);

  // Text to Speech Function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Send Message to Backend
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const currentText = inputValue;
    setInputValue('');

    // Add User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      message: currentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add Bot Reply
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        message: data.reply || data.response || "I received your message but couldn't generate a response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      
      // Speak the result
      speak(botMsg.message);
      setConnectionError(false);

    } catch (error) {
      console.error("Connection Error:", error);
      setConnectionError(true);
      
      // Only add error message if it's the first error
      if (messages[messages.length - 1]?.sender !== 'bot' || !messages[messages.length - 1]?.message.includes('cannot reach')) {
        const errorMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          message: "I cannot reach the server right now. Please make sure the backend is running on port 5000.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-blue-600">SpeakSign</h1>
          </div>
          {connectionError && (
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <WifiOff className="h-4 w-4" />
              <span className="hidden sm:inline">Backend Offline</span>
            </div>
          )}
        </div>
      </nav>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-white border-r border-gray-200 p-4`}>
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Chatbot
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </a>
          </nav>
        </aside>
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ISL Assistant</h1>
                <p className="text-sm text-gray-500">Powered by AI</p>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {msg.sender === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-6 py-3 rounded-2xl shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : msg.message.includes('cannot reach') 
                          ? 'bg-orange-50 text-orange-900 border border-orange-200'
                          : 'bg-white text-gray-800'
                    }`}>
                      {msg.message.includes('cannot reach') && (
                        <AlertCircle className="inline-block h-4 w-4 mr-2" />
                      )}
                      {msg.message}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 px-2">{msg.timestamp}</span>
                      {msg.sender === 'bot' && !msg.message.includes('cannot reach') && (
                        <button 
                          onClick={() => speak(msg.message)} 
                          className="text-gray-400 hover:text-blue-600 transition-colors" 
                          title="Listen"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">AI</div>
                  <div className="px-6 py-4 rounded-2xl bg-white shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 p-6 shadow-sm">
            <div className="max-w-4xl mx-auto flex gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
              <button 
                onClick={handleSend} 
                disabled={isTyping}
                className="px-6 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Send className="h-5 w-5" /> Send
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatbotPage;