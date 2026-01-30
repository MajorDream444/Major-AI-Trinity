
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PILLARS } from '../constants';
import { Pillar, UserProgress } from '../types';
import { CheckCircle, Circle, ArrowRight, Zap, Trophy, TrendingUp, Info, ExternalLink } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'life' | 'money' | 'tech'>('life');
  const [progress, setProgress] = useState<UserProgress>({ completed: [], updatedAt: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const progressRef = doc(db, `users/${userId}/progress/v1`);
    
    const unsubscribe = onSnapshot(progressRef, (docSnap) => {
      if (docSnap.exists()) {
        setProgress(docSnap.data() as UserProgress);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const togglePillar = async (e: React.MouseEvent, pillarId: string) => {
    e.stopPropagation(); // Prevent card expansion when clicking the checkbox
    if (!userId) return;

    const isCompleted = progress.completed.includes(pillarId);
    const newCompleted = isCompleted
      ? progress.completed.filter(id => id !== pillarId)
      : [...progress.completed, pillarId];

    const progressRef = doc(db, `users/${userId}/progress/v1`);
    await setDoc(progressRef, {
      completed: newCompleted,
      updatedAt: Date.now()
    }, { merge: true });
  };

  const filteredPillars = PILLARS.filter(p => p.category === activeTab);
  const totalCompleted = progress.completed.length;
  const categoryCompleted = filteredPillars.filter(p => progress.completed.includes(p.id)).length;
  const progressPercentage = (totalCompleted / 30) * 100;

  return (
    <div className="space-y-10">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif">Dashboard</h1>
          <p className="text-zinc-400">Track your evolution through the 30 Pillars.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 min-w-[240px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Overall Progress</span>
            <span className="text-emerald-500 font-bold">{totalCompleted}/30</span>
          </div>
          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-900 rounded-2xl w-full max-w-md mx-auto md:mx-0">
        {(['life', 'money', 'tech'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold capitalize transition-all ${
              activeTab === tab 
              ? 'bg-zinc-800 text-zinc-100 shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Pillar Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredPillars.map((pillar) => {
          const isDone = progress.completed.includes(pillar.id);
          const isExpanded = expandedPillar === pillar.id;
          return (
            <div 
              key={pillar.id}
              onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
              className={`group relative bg-zinc-900 border transition-all rounded-3xl p-6 cursor-pointer ${
                isDone ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800'
              } ${isExpanded ? 'ring-2 ring-zinc-700' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-500">{pillar.id}</span>
                  <h3 className="text-xl font-serif group-hover:text-emerald-400 transition-colors">{pillar.name}</h3>
                  <p className="text-sm text-zinc-400 italic">"{pillar.tagline}"</p>
                </div>
                <button 
                  onClick={(e) => togglePillar(e, pillar.id)}
                  className={`p-2 rounded-xl transition-all ${
                    isDone ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-700 bg-zinc-950 hover:text-zinc-400'
                  }`}
                >
                  {isDone ? <CheckCircle size={28} /> : <Circle size={28} />}
                </button>
              </div>

              {isExpanded && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                   <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-zinc-500" />
                    <p className="text-xs font-bold text-zinc-500 uppercase">Insight</p>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-4">{pillar.details}</p>
                  <a 
                    href={pillar.resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    <ExternalLink size={12} /> {pillar.resource.title}
                  </a>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Reflection</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{pillar.reflectionPrompt}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDone ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-950/50 border-zinc-800/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className={isDone ? 'text-emerald-500' : 'text-zinc-500'} />
                    <p className="text-xs font-bold text-zinc-500 uppercase">Major Move</p>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDone ? 'text-emerald-100' : 'text-zinc-400'}`}>
                    {pillar.majorMove}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Summary */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 rounded-3xl border border-zinc-700 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-serif">
            {categoryCompleted === 10 ? `Ascended in ${activeTab.toUpperCase()}` : `Master the ${activeTab.toUpperCase()} Matrix`}
          </h2>
          <p className="text-zinc-400 max-w-md">
            Complete all 10 pillars in this category to unlock advanced strategies and specialized AI interactions.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-serif text-emerald-500">{categoryCompleted}/10</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Pillars Mastery</p>
          </div>
          {categoryCompleted === 10 ? (
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/20">
              <Trophy size={32} />
            </div>
          ) : (
            <div className="w-16 h-16 border-2 border-dashed border-zinc-700 rounded-full flex items-center justify-center text-zinc-700">
              <TrendingUp size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
