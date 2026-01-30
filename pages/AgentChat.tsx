
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  limit,
  updateDoc,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getGeminiResponse } from '../geminiService';
import { AGENTS } from '../constants';
import { Message, AgentId, Thread } from '../types';
import { 
  Send, 
  Sparkles, 
  User, 
  Terminal, 
  ArrowLeft, 
  RefreshCw, 
  Trash2, 
  Plus, 
  MessageSquare, 
  Clock, 
  ChevronLeft,
  Shield,
  TrendingUp,
  Zap
} from 'lucide-react';

const AgentIcon = ({ id, size = 24, className = "" }: { id: AgentId, size?: number, className?: string }) => {
  switch (id) {
    case 'PILLAR': return <Shield size={size} className={className} />;
    case 'COME-UP': return <TrendingUp size={size} className={className} />;
    case 'CODEX': return <Zap size={size} className={className} />;
    default: return null;
  }
};

const AgentChat: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentId>('PILLAR');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showThreadList, setShowThreadList] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const userId = auth.currentUser?.uid;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Load threads for the active agent
  useEffect(() => {
    if (!userId) return;

    setLoadingThreads(true);
    const threadsRef = collection(db, `users/${userId}/threads`);
    const q = query(
      threadsRef, 
      where('agentId', '==', activeAgent),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Thread[];
      setThreads(threadList);
      setLoadingThreads(false);
    });

    return () => unsubscribe();
  }, [userId, activeAgent]);

  // Load messages for the current thread
  useEffect(() => {
    if (!userId || !currentThreadId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const messagesRef = collection(db, `users/${userId}/threads/${currentThreadId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgList);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [userId, currentThreadId]);

  const startNewThread = async () => {
    if (!userId) return;
    
    const threadsRef = collection(db, `users/${userId}/threads`);
    const newThreadDoc = await addDoc(threadsRef, {
      agentId: activeAgent,
      title: "New Conversation",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    setCurrentThreadId(newThreadDoc.id);
    setShowThreadList(false);
  };

  const selectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    setShowThreadList(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId || !currentThreadId || isTyping) return;

    const userText = input;
    setInput('');
    setIsTyping(true);

    try {
      const messagesRef = collection(db, `users/${userId}/threads/${currentThreadId}/messages`);
      const threadRef = doc(db, `users/${userId}/threads/${currentThreadId}`);

      // 1. Save user message to Firestore
      await addDoc(messagesRef, {
        role: 'user',
        text: userText,
        createdAt: Date.now()
      });

      // 2. If it's the first message, update thread title
      if (messages.length === 0) {
        await updateDoc(threadRef, {
          title: userText.substring(0, 40) + (userText.length > 40 ? '...' : ''),
          updatedAt: Date.now()
        });
      } else {
        await updateDoc(threadRef, {
          updatedAt: Date.now()
        });
      }

      // 3. Call Gemini
      const history = messages.slice(-5);
      const aiResponseText = await getGeminiResponse(activeAgent, userText, history);

      // 4. Save AI message to Firestore
      await addDoc(messagesRef, {
        role: 'assistant',
        text: aiResponseText,
        createdAt: Date.now()
      });

    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const agent = AGENTS[activeAgent];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto">
      {/* Agent Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(AGENTS) as AgentId[]).map((id) => (
          <button
            key={id}
            onClick={() => {
              setActiveAgent(id);
              setShowThreadList(true);
              setCurrentThreadId(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
              activeAgent === id 
                ? id === 'PILLAR' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                : id === 'COME-UP' ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                : 'bg-blue-500/10 border-blue-500 text-blue-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <AgentIcon id={id} size={16} />
            {id}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex overflow-hidden shadow-2xl">
        {/* Thread History Sidebar (Desktop) / Full Screen (Mobile) */}
        {(showThreadList || !currentThreadId) ? (
          <div className="w-full flex flex-col bg-zinc-900/80 border-r border-zinc-800">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <AgentIcon id={activeAgent} size={24} className={
                  activeAgent === 'PILLAR' ? 'text-emerald-500' :
                  activeAgent === 'COME-UP' ? 'text-amber-500' : 'text-blue-500'
                } />
                <h3 className="font-serif text-xl tracking-tight">Transmissions</h3>
              </div>
              <button 
                onClick={startNewThread}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                title="New Chat"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingThreads ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="text-zinc-700 animate-spin" size={24} />
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="p-4 bg-zinc-950 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                    <AgentIcon id={activeAgent} size={32} className="text-zinc-700" />
                  </div>
                  <p className="text-zinc-500 text-sm italic">No previous logs for {agent.name}.</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => selectThread(thread.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all hover:bg-zinc-800/50 group ${
                      currentThreadId === thread.id 
                        ? 'border-emerald-500/30 bg-emerald-500/5' 
                        : 'border-transparent'
                    }`}
                  >
                    <p className="text-sm font-medium text-zinc-200 truncate mb-1 group-hover:text-emerald-400">{thread.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest">
                      <Clock size={10} />
                      {formatDate(thread.updatedAt)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Chat Area */
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-start">
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => setShowThreadList(true)}
                  className="mt-1 p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className={`mt-1 p-3 rounded-2xl border ${
                  activeAgent === 'PILLAR' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                  activeAgent === 'COME-UP' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-500'
                }`}>
                  <AgentIcon id={activeAgent} size={28} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-2xl leading-none">{agent.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest border ${
                      activeAgent === 'PILLAR' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                      activeAgent === 'COME-UP' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                      'bg-blue-500/10 border-blue-500/30 text-blue-500'
                    }`}>
                      {agent.archetype}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-lg leading-relaxed italic">
                    {agent.summary}
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-zinc-600 font-mono hidden lg:block uppercase tracking-tighter">
                NODE_SECURE: {currentThreadId.substring(0, 12)}
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950/20"
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="text-zinc-800 animate-spin" size={32} />
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-4 md:p-6 ${
                      msg.role === 'user' 
                        ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm shadow-xl'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'user' ? (
                          <span className="text-[10px] font-bold uppercase text-zinc-500">Authorized Human</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <AgentIcon id={activeAgent} size={10} className={
                              activeAgent === 'PILLAR' ? 'text-emerald-500' :
                              activeAgent === 'COME-UP' ? 'text-amber-500' : 'text-blue-500'
                            } />
                            <span className={`text-[10px] font-bold uppercase ${
                              activeAgent === 'PILLAR' ? 'text-emerald-500' :
                              activeAgent === 'COME-UP' ? 'text-amber-500' : 'text-blue-500'
                            }`}>{agent.name}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 rounded-tl-sm flex gap-2">
                    <div className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 max-w-4xl mx-auto w-full">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Consult ${agent.name}...`}
                  disabled={isTyping}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-6 pr-14 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-zinc-700 transition-all disabled:opacity-50 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`absolute right-2 p-3 rounded-xl transition-all ${
                    input.trim() && !isTyping 
                      ? activeAgent === 'PILLAR' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' :
                        activeAgent === 'COME-UP' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40' :
                        'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  } text-white shadow-lg`}
                >
                  <Send size={20} />
                </button>
              </form>
              <div className="flex items-center justify-center gap-4 mt-3">
                <p className="text-[10px] text-zinc-600 uppercase tracking-tighter">
                  NEURAL LINK ACTIVE
                </p>
                <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-tighter">
                  ENCRYPTION: AES-256
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentChat;
