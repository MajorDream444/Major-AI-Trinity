
import React from 'react';
import { Link } from 'react-router-dom';
import { AGENTS } from '../constants';
import { ChevronRight, Shield, Zap, TrendingUp } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-tight">
          Master the <span className="text-emerald-500">Trinity</span> of Existence
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl">
          A blueprint for the modern sovereign. 30 daily pillars. 3 specialized AI agents. One path to legacy.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link 
            to="/dashboard" 
            className="px-8 py-3 bg-zinc-100 text-zinc-950 font-semibold rounded-full hover:bg-emerald-400 transition-colors"
          >
            Access Dashboard
          </Link>
          <Link 
            to="/agent-chat" 
            className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 font-semibold rounded-full hover:bg-zinc-800 transition-colors"
          >
            Summon Agents
          </Link>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        {Object.values(AGENTS).map((agent) => (
          <div 
            key={agent.id} 
            className="group relative bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-all hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center
              ${agent.id === 'PILLAR' ? 'bg-emerald-500/10 text-emerald-500' : ''}
              ${agent.id === 'COME-UP' ? 'bg-amber-500/10 text-amber-500' : ''}
              ${agent.id === 'CODEX' ? 'bg-blue-500/10 text-blue-500' : ''}
            `}>
              {agent.id === 'PILLAR' && <Shield size={24} />}
              {agent.id === 'COME-UP' && <TrendingUp size={24} />}
              {agent.id === 'CODEX' && <Zap size={24} />}
            </div>
            <h3 className="text-2xl font-serif mb-2">{agent.name}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{agent.archetype}</p>
            <p className="text-zinc-400 mb-8 line-clamp-3">{agent.summary}</p>
            <Link 
              to="/agent-chat" 
              className="flex items-center gap-2 text-sm font-semibold text-zinc-100 group-hover:gap-3 transition-all"
            >
              Consult the Agent <ChevronRight size={16} />
            </Link>
          </div>
        ))}
      </section>

      {/* Features List */}
      <section className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif">The Path of the Trinity</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="mt-1 bg-emerald-500/20 p-1 rounded">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold">30 Daily Micro-Lessons</h4>
                  <p className="text-sm text-zinc-400">Atomic habits for massive life shifts across health, wealth, and technology.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-amber-500/20 p-1 rounded">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold">Persistent Journaling</h4>
                  <p className="text-sm text-zinc-400">Track your evolution with our secure, end-to-end journal system.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-blue-500/20 p-1 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold">Context-Aware AI</h4>
                  <p className="text-sm text-zinc-400">Our agents remember your progress and provide hyper-personalized strategy.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-square bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-blue-500/10 rounded-full flex items-center justify-center">
            <div className="absolute inset-0 border border-zinc-800 rounded-full scale-90 opacity-50"></div>
            <div className="absolute inset-0 border border-zinc-800 rounded-full scale-75 opacity-30"></div>
            <div className="w-24 h-24 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl animate-bounce duration-[3000ms]">
              <Shield className="text-emerald-500" size={40} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
