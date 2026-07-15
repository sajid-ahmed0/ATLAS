import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  Calendar, 
  CheckCircle, 
  HelpCircle, 
  TrendingUp, 
  AlertCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useAuth } from './AuthContext.tsx';
import { JournalEntry } from '../types.ts';

interface JournalViewProps {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'loading') => void;
}

export const JournalView: React.FC<JournalViewProps> = ({ showToast }) => {
  const { token } = useAuth();
  
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Field states
  const [sleepHours, setSleepHours] = useState<string>('');
  const [mood, setMood] = useState<string>('Neutral');
  const [energy, setEnergy] = useState<string>('Medium');
  const [stress, setStress] = useState<string>('Low');
  const [focus, setFocus] = useState<string>('');
  const [challenge, setChallenge] = useState<string>('');
  
  // Evening fields
  const [eveningDecision, setEveningDecision] = useState<string>('');
  const [eveningBest, setEveningBest] = useState<string>('');
  const [eveningWorst, setEveningWorst] = useState<string>('');
  const [followedPriorities, setFollowedPriorities] = useState<string>('');
  const [regret, setRegret] = useState<string>('');
  const [lessons, setLessons] = useState<string>('');
  const [gratitude, setGratitude] = useState<string>('');

  useEffect(() => {
    if (!token) return;
    fetchJournalForDate();
    fetchHistory();
  }, [token, date]);

  const fetchJournalForDate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/journal/by-date?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const entry = await response.json();
        if (entry) {
          setSleepHours(entry.sleepHours || '');
          setMood(entry.mood || 'Neutral');
          setEnergy(entry.energy || 'Medium');
          setStress(entry.stress || 'Low');
          setFocus(entry.focus || '');
          setChallenge(entry.challenge || '');
          setEveningDecision(entry.eveningDecision || '');
          setEveningBest(entry.eveningBest || '');
          setEveningWorst(entry.eveningWorst || '');
          setFollowedPriorities(entry.followedPriorities || '');
          setRegret(entry.regret || '');
          setLessons(entry.lessons || '');
          setGratitude(entry.gratitude || '');
        } else {
          // Reset fields for new entry
          setSleepHours('');
          setMood('Neutral');
          setEnergy('Medium');
          setStress('Low');
          setFocus('');
          setChallenge('');
          setEveningDecision('');
          setEveningBest('');
          setEveningWorst('');
          setFollowedPriorities('');
          setRegret('');
          setLessons('');
          setGratitude('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/journal/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    showToast('Securing journal entries inside database...', 'loading');
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          sleepHours,
          mood,
          energy,
          stress,
          focus,
          challenge,
          eveningDecision,
          eveningBest,
          eveningWorst,
          followedPriorities,
          regret,
          lessons,
          gratitude
        })
      });

      if (response.ok) {
        showToast('Daily journal synced successfully.', 'success');
        await fetchHistory();
      } else {
        showToast('Failed to sync journal.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving journal entry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[#fafafa] font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">Daily Journal & Calibration</h2>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Align your intent every morning and conduct rigorous integrity audits every evening.
          </p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Active Date:</span>
          <div className="flex items-center bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-1.5 gap-2 focus-within:border-[#3f3f46]">
            <Calendar className="w-4 h-4 text-white" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-medium text-[#fafafa] bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <TrendingUp className="w-8 h-8 text-white animate-pulse" />
          <p className="text-xs text-[#71717a] font-mono">RETRIEVING ENCRYPTED DAYSTATE DATA...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveJournal} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* MORNING ALIGNMENT PANEL */}
            <div className="p-6 md:p-8 bg-[#18181b] border border-[#27272a] rounded-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-[#27272a] pb-3 mb-2">
                <Sun className="w-5 h-5 text-white animate-pulse" />
                <h3 className="text-md font-bold font-display text-white">Morning Alignment & Focus</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Sleep Quantity</label>
                  <input
                    type="text"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    placeholder="e.g. 7.5 hours"
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Emotional Mood State</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                  >
                    {['Clear', 'Anxious', 'Fatigued', 'Inspired', 'Overwhelmed', 'Neutral'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Energy Reserves</label>
                  <select
                    value={energy}
                    onChange={(e) => setEnergy(e.target.value)}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                  >
                    {['High', 'Medium', 'Low'].map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Stress Factor</label>
                  <select
                    value={stress}
                    onChange={(e) => setStress(e.target.value)}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                  >
                    {['High', 'Medium', 'Low'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Primary Strategic Focus For Today</label>
                <textarea
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="What is the single highest-value action you must complete today to align with your mission goals?"
                  rows={3}
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Key Obstacle / Friction Areas</label>
                <textarea
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="What is the biggest threat to your productivity or alignment today? How will you counter it?"
                  rows={2.5}
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

            </div>

            {/* EVENING REFLECTION PANEL */}
            <div className="p-6 md:p-8 bg-[#18181b] border border-[#27272a] rounded-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl rounded-full pointer-events-none" />

              <div className="flex items-center gap-2 border-b border-[#27272a] pb-3 mb-2">
                <Moon className="w-5 h-5 text-white animate-pulse" />
                <h3 className="text-md font-bold font-display text-white">Evening Rigor Reflection</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Followed Priorities?</label>
                  <input
                    type="text"
                    value={followedPriorities}
                    onChange={(e) => setFollowedPriorities(e.target.value)}
                    placeholder="e.g. Yes, did focus first."
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Evening Decisions Made</label>
                  <input
                    type="text"
                    value={eveningDecision}
                    onChange={(e) => setEveningDecision(e.target.value)}
                    placeholder="e.g. Decided to delegate email flow."
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase font-bold text-emerald-400">Peak Accomplishment Today</label>
                  <textarea
                    value={eveningBest}
                    onChange={(e) => setEveningBest(e.target.value)}
                    placeholder="What occurred today that went remarkably well?"
                    rows={2.5}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase font-bold text-rose-400">Low Point / Friction Encountered</label>
                  <textarea
                    value={eveningWorst}
                    onChange={(e) => setEveningWorst(e.target.value)}
                    placeholder="What occurred today that was frustrating or inefficient?"
                    rows={2.5}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase font-bold text-amber-500">Impulsive Traps / Regrets</label>
                  <textarea
                    value={regret}
                    onChange={(e) => setRegret(e.target.value)}
                    placeholder="Did you fall for bad habits? List triggers to avoid."
                    rows={2.5}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Primary Lesson Learned</label>
                  <textarea
                    value={lessons}
                    onChange={(e) => setLessons(e.target.value)}
                    placeholder="Distill today's experience into a hard-hitting mental blueprint lesson."
                    rows={2.5}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Acts of Gratitude</label>
                <textarea
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="Record 1-3 simple elements of gratitude from today."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

            </div>

          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-[#fafafa]/90 transition-colors cursor-pointer"
            >
              {submitting ? 'Syncing...' : 'Sync Daily Reflection Data'}
            </button>
          </div>

        </form>
      )}

      {/* HISTORIC LOG OF PAST DAYS */}
      <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl">
        <h3 className="text-md font-bold font-display text-white mb-4">Historical Alignment Log ({history.length} Days)</h3>
        
        {history.length === 0 ? (
          <p className="text-xs text-[#71717a] italic">No historical daily recordings found.</p>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {history.map((h) => (
              <div 
                key={h.id} 
                onClick={() => setDate(h.date)}
                className="p-4 bg-[#09090b]/50 border border-[#27272a] hover:border-[#3f3f46] rounded-xl cursor-pointer transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#fafafa] font-mono">{h.date}</span>
                    <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded uppercase font-mono font-bold">
                      Mood: {h.mood}
                    </span>
                    <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded uppercase font-mono font-bold">
                      Stress: {h.stress}
                    </span>
                  </div>
                  {h.focus && (
                    <p className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed truncate max-w-xl">Focus: {h.focus}</p>
                  )}
                  {h.lessons && (
                    <p className="text-xs text-white/90 mt-1.5 leading-relaxed italic truncate max-w-xl">Lesson: {h.lessons}</p>
                  )}
                </div>
                <span className="text-[10px] text-[#71717a] font-mono">Load Entry →</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
