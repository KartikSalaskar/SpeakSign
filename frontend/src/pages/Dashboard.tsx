import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, MessageSquare, History, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const quickLinks = [
  {
    icon: Video,
    title: 'ISL Convert',
    description: 'Convert sign language to text in real-time',
    path: '/isl',
    gradient: 'from-primary to-accent',
  },
  {
    icon: MessageSquare,
    title: 'Chatbot Assistant',
    description: 'Get help with sign language questions',
    path: '/chat',
    gradient: 'from-accent to-success',
  },
  {
    icon: History,
    title: 'History',
    description: 'View your past recognition results',
    path: '/history',
    gradient: 'from-success to-primary',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Welcome Back! 👋</h1>
              <p className="text-muted-foreground text-lg">
                Ready to convert sign language to text? Choose an option below to get started.
              </p>
            </div>

            {/* Quick Links Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <Card
                  key={link.path}
                  className="p-6 hover:shadow-medium transition-all duration-300 cursor-pointer group animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(link.path)}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <link.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 text-sm">
                    {link.description}
                  </p>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 group-hover:gap-3 transition-all"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>

            {/* Stats Section */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">256</div>
                  <div className="text-sm text-muted-foreground">Total Conversions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-1">94.2%</div>
                  <div className="text-sm text-muted-foreground">Avg. Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-1">48</div>
                  <div className="text-sm text-muted-foreground">Chat Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">12</div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
