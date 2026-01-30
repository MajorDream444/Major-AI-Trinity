
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { JournalEntry } from '../types';
// Added missing BookOpen import
import { Save, Plus, Clock, Search, BookOpen } from 'lucide-react';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const journalRef = collection(db, `users/${userId}/journal`);
    const q = query(journalRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entryList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JournalEntry[];
      setEntries(entryList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const saveEntry = async () => {
    if (!newEntryText.trim() || !userId) return;
    
    setIsSaving(true);
    try {
      const journalRef = collection(db, `users/${userId}/journal`);
      await addDoc(journalRef, {
        text: newEntryText,
        createdAt: Date.now()
      });
      setNewEntryText('');
      setShowEditor(false);
    } catch (err) {
      console.error("Error saving journal entry:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif">Journal</h1>
          <p className="text-zinc-400">Chronicle your journey and track your mental shifts.</p>
        </div>
        {!showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold transition-all"
          >
            <Plus size={20} /> New Entry
          </button>
        )}
      </div>

      {showEditor && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4">
          <textarea
            autoFocus
            value={newEntryText}
            onChange={(e) => setNewEntryText(e.target.value)}
            placeholder="What breakthroughs did you experience today?"
            className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowEditor(false)}
              className="px-6 py-3 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEntry}
              disabled={isSaving || !newEntryText.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
            >
              {isSaving ? 'Archiving...' : <><Save size={20} /> Save to Trinity</>}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl">
            <BookOpen className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500">Your journal is empty. Start your first legacy entry above.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div 
              key={entry.id}
              className="bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 rounded-3xl p-8 transition-all"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                <Clock size={12} />
                {formatDate(entry.createdAt)}
              </div>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {entry.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Journal;
