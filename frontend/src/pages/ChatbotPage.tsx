import { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import Loader from '@/components/Loader';
import { mockChatMessages } from '@/utils/mockData';

const ChatbotPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState(mockChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      message: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: 'bot',
        message: "I'm here to help! This is a placeholder response. In production, this would be powered by AI.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-card border-b border-border p-6 shadow-soft">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ISL Assistant</h1>
                <p className="text-sm text-muted-foreground">Ask me anything about sign language</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 animate-fade-in ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={msg.sender === 'user' ? 'bg-primary' : 'bg-accent'}>
                      {msg.sender === 'user' ? 'U' : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex flex-col gap-1 max-w-[80%] ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <Card
                      className={`px-6 py-3 ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card'
                      }`}
                    >
                      {msg.message}
                    </Card>
                    <span className="text-xs text-muted-foreground px-2">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-4 animate-fade-in">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent">AI</AvatarFallback>
                  </Avatar>
                  <Card className="px-6 py-4">
                    <Loader />
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="bg-card border-t border-border p-6 shadow-soft">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 h-12"
                />
                <Button onClick={handleSend} size="lg" className="gap-2">
                  <Send className="h-5 w-5" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatbotPage;
