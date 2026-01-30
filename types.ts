
export interface Pillar {
  id: string;
  category: 'life' | 'money' | 'tech';
  name: string;
  tagline: string;
  reflectionPrompt: string;
  majorMove: string;
  details: string;
  resource: {
    title: string;
    url: string;
  };
}

export interface UserProgress {
  completed: string[];
  updatedAt: number;
}

export interface JournalEntry {
  id: string;
  text: string;
  createdAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
}

export interface Thread {
  id: string;
  agentId: AgentId;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export type AgentId = 'PILLAR' | 'COME-UP' | 'CODEX';

export interface Agent {
  id: AgentId;
  name: string;
  archetype: string;
  summary: string;
  systemPrompt: string;
  color: string;
}
