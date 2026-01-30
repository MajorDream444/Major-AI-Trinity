
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import AgentChat from './pages/AgentChat';
import { 
  Home as HomeIcon, 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  LogOut, 
  LogIn,
  Menu,
  X
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
    setIsMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-full mb-4"></div>
          <p className="text-xl font-serif">Major AI Trinity</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { path: '/', label: 'Home', icon: <HomeIcon size={20} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, protected: true },
    { path: '/agent-chat', label: 'Agent Chat', icon: <MessageSquare size={20} />, protected: true },
    { path: '/journal', label: 'Journal', icon: <BookOpen size={20} />, protected: true },
  ];

  const filteredLinks = navLinks.filter(link => !link.protected || (link.protected && user));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-4 h-4 border border-white -rotate-45"></div>
              </div>
              <span className="font-serif text-xl tracking-tight hidden sm:block">Major AI Trinity</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path 
                    ? 'bg-zinc-800 text-emerald-400' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-md"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium"
                >
                  <LogIn size={20} />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-zinc-400 hover:text-white p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-b border-zinc-800 px-2 pt-2 pb-3 space-y-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-red-400 hover:bg-zinc-800 rounded-md"
              >
                <LogOut size={20} />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-base font-medium text-emerald-400 hover:bg-zinc-800 rounded-md"
              >
                <LogIn size={20} />
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
          <Route path="/journal" element={user ? <Journal /> : <Login />} />
          <Route path="/agent-chat" element={user ? <AgentChat /> : <Login />} />
        </Routes>
      </main>

      <footer className="py-8 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-xs">
            &copy; {new Date().getFullYear()} Major AI Trinity. All rights reserved.
          </p>
          <p className="text-zinc-600 text-[10px] mt-2 italic">
            Self-Mastery. Spiritual Finance. AI Sovereignty.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
