import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  TrendingUp, 
  Brain, 
  BookOpen, 
  Plus, 
  Calendar, 
  Activity, 
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from './AuthContext.tsx';
import { DashboardRecommendation, Goal, Decision, JournalEntry } from '../types.ts';

interface HomeViewProps {
  onNavigate: (view: any) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'loading') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, showToast }) => {
  const { firebaseUser, token } = useAuth();
  const [recommendation, setRecommendation] = useState<DashboardRecommendation | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState<boolean>(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [todayJournal, setTodayJournal] = useState<JournalEntry | null>(null);
  const [submittingState, setSubmittingState] = useState<boolean>(false);

  // Today state log parameters
  const [mood, setMood] = useState<string>('Balanced');
  const [energy, setEnergy] = useState<string>('Medium');
  const [stress, setStress] = useState<string>('Low');
  const [focus, setFocus] = useState<string>('');
  const [challenge, setChallenge] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!token) return;
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    setLoadingBriefing(true);
    try {
      // 1. Fetch today's journal
      const jRes = await fetch(`/api/journal/by-date?date=${todayStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (jRes.ok) {
        const jData = await jRes.json();
        if (jData) {
          setTodayJournal(jData);
          setMood(jData.mood || 'Balanced');
          setEnergy(jData.energy || 'Medium');
          setStress(jData.stress || 'Low');
          setFocus(jData.focus || '');
          setChallenge(jData.challenge || '');
        }
      }

      // 2. Fetch goals
      const gRes = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (gRes.ok) {
        const gData = await gRes.json();
        setGoals(gData.slice(0, 3)); // show top 3
      }

      // 3. Fetch decisions
      const dRes = await fetch('/api/decisions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dRes.ok) {
        const dData = await dRes.json();
        setDecisions(dData.slice(0, 3)); // show top 3
      }

      // 4. Fetch AI Briefing
      const bRes = await fetch('/api/dashboard/recommendation', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        setRecommendation(bData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingBriefing(false);
    }
  };

  const handleUpdateState = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingState(true);
    showToast('Updating daily calibration...', 'loading');
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: todayStr,
          mood,
          energy,
          stress,
          focus,
          challenge
        })
      });

      if (response.ok) {
        showToast('Daily state calibrated successfully.', 'success');
        const updatedEntry = await response.json();
        setTodayJournal(updatedEntry);

        // Regenerate recommendation based on new daily state
        showToast('Atlas is recalculating your briefing...', 'loading');
        const bRes = await fetch('/api/dashboard/recommendation', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bRes.ok) {
          const bData = await bRes.json();
          setRecommendation(bData);
          showToast(' Briefing realigned.', 'success');
        }
      } else {
        showToast('Failed to update daily state.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating daily state.', 'error');
    } finally {
      setSubmittingState(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[#fafafa] font-sans">
      
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
            Good morning, <span className="text-[#fafafa] font-extrabold">{firebaseUser?.displayName?.split(' ')[0] || 'Strategist'}</span>
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1 font-mono uppercase tracking-wider">
            EXTERNAL ALIGNMENT: <span className="text-white font-bold">ONLINE</span> • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        {/* Quick action triggers */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('decision')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white text-black hover:bg-[#fafafa]/90 rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Analyze Decision
          </button>
          <button 
            onClick={() => onNavigate('journal')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#27272a] border border-[#3f3f46] hover:bg-[#27272a]/80 text-[#fafafa] rounded-lg transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#a1a1aa]" />
            Journal Entry
          </button>
        </div>
      </div>

      {/* Grid Layout (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (AI BRIEFING & PRIORITIES) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Intelligence Briefing */}
          <div className="p-6 bg-gradient-to-br from-[#18181b] to-[#09090b] border border-[#27272a] rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold uppercase tracking-wider">AI Recommendation</span>
            </div>

            {loadingBriefing ? (
              <div className="py-8 space-y-4">
                <div className="h-6 bg-[#27272a] rounded w-1/3 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#27272a] rounded w-full animate-pulse" />
                  <div className="h-4 bg-[#27272a] rounded w-5/6 animate-pulse" />
                </div>
              </div>
            ) : recommendation ? (
              <div className="space-y-4">
                <h3 className="text-xl font-medium leading-tight mb-2 italic text-white font-display">"{recommendation.headline}"</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{recommendation.focusAdvice}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#27272a]">
                  <div className="p-3.5 bg-[#09090b]/60 rounded-xl border border-[#27272a]">
                    <div className="flex items-center gap-2 text-rose-400 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase font-mono tracking-wider">Cognitive Warning</span>
                    </div>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">{recommendation.warningsOrBiases}</p>
                  </div>
                  
                  <div className="p-3.5 bg-[#09090b]/60 rounded-xl border border-[#27272a]">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase font-mono tracking-wider">Aligned Habit</span>
                    </div>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">{recommendation.alignedHabitToPractice}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 border border-[#27272a] rounded-xl mt-4">
                  <span className="text-xs font-mono bg-white text-black px-2 py-0.5 rounded font-bold uppercase text-[9px]">Micro-Action</span>
                  <p className="text-xs font-medium text-[#fafafa]">{recommendation.microAction}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-[#71717a]">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No briefing generated. Log today's calibration metrics to begin.</p>
              </div>
            )}
          </div>

          {/* Goals and Action Progress */}
          <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#71717a]" />
                <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest">Core Mission Progress</h3>
              </div>
              <button 
                onClick={() => onNavigate('mission')}
                className="text-xs text-white hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                Configure
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="py-8 text-center text-[#71717a] border border-dashed border-[#27272a] rounded-xl">
                <p className="text-sm">No active goals found.</p>
                <button 
                  onClick={() => onNavigate('mission')}
                  className="mt-2 text-xs text-white font-bold hover:underline"
                >
                  Create Goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 bg-[#09090b]/40 border border-[#27272a] rounded-xl">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{goal.title}</h4>
                        <span className="inline-block text-[10px] bg-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded uppercase font-mono mt-1 font-bold">
                          {goal.category}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#a1a1aa] font-bold">{goal.progress}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Decisions and Status */}
          <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#71717a]" />
                <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest">Decision Center</h3>
              </div>
              <button 
                onClick={() => onNavigate('decision')}
                className="text-xs text-white hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                View Center
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {decisions.length === 0 ? (
              <div className="py-8 text-center text-[#71717a] border border-dashed border-[#27272a] rounded-xl">
                <p className="text-sm">No recorded decisions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {decisions.map((dec) => (
                  <div key={dec.id} className="flex items-center justify-between p-3.5 bg-[#09090b]/40 border border-[#27272a] rounded-xl hover:bg-[#27272a]/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white truncate">{dec.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#71717a] font-mono capitalize">{dec.category}</span>
                        <span className="text-[#27272a] font-mono text-xs">•</span>
                        <span className="text-[10px] text-[#a1a1aa] font-mono">Importance: {dec.importance}/10</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                        dec.status === 'DECIDED' ? 'bg-white text-black' : 'bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]'
                      }`}>
                        {dec.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (TODAY'S CALIBRATION / STATE RECORDER) */}
        <div className="space-y-6">
          
          {/* Today Calibration Logger */}
          <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#71717a]" />
              <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest">Daily State Calibration</h3>
            </div>

            <form onSubmit={handleUpdateState} className="space-y-4">
              
              {/* Mood Selection */}
              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-2">Current Mood</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Clear', 'Anxious', 'Fatigued', 'Inspired', 'Overwhelmed', 'Neutral'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`px-2 py-1.5 text-[11px] rounded-lg border transition-all cursor-pointer ${
                        mood === m 
                          ? 'bg-white border-white text-black font-semibold' 
                          : 'bg-[#09090b]/50 border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-2">Energy Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['High', 'Medium', 'Low'].map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEnergy(e)}
                      className={`px-2 py-1.5 text-[11px] rounded-lg border transition-all cursor-pointer ${
                        energy === e 
                          ? 'bg-white border-white text-black font-semibold' 
                          : 'bg-[#09090b]/50 border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-white'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Level */}
              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-2">Stress Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['High', 'Medium', 'Low'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStress(s)}
                      className={`px-2 py-1.5 text-[11px] rounded-lg border transition-all cursor-pointer ${
                        stress === s 
                          ? 'bg-rose-600/20 border-rose-500 text-rose-400 font-semibold' 
                          : 'bg-[#09090b]/50 border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Today's Focus Input */}
              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-1.5">Today's Strategic Focus</label>
                <input
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g. Code database schema and API routing"
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              {/* Biggest Challenge */}
              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-1.5">Biggest Obstacle</label>
                <input
                  type="text"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="e.g. High distraction or physical fatigue"
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingState}
                className="w-full py-2.5 bg-white text-black hover:bg-[#fafafa]/90 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase font-mono"
              >
                {submittingState ? 'Calibrating...' : 'Update Daily State'}
              </button>
            </form>
          </div>

          {/* Quick Actions / Shortcut Palettes */}
          <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl">
            <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest mb-4">Quick OS Triggers</h3>
            <div className="space-y-2">
              <button 
                onClick={() => onNavigate('journal')}
                className="w-full flex items-center justify-between p-3 bg-transparent border border-[#27272a] hover:bg-[#27272a]/30 rounded-xl text-left text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-[#a1a1aa]">
                  <BookOpen className="w-3.5 h-3.5 text-[#71717a]" />
                  <span>Evening Reflection Check</span>
                </div>
                <ArrowRight className="w-3 h-3 text-[#71717a]" />
              </button>
              <button 
                onClick={() => onNavigate('knowledge')}
                className="w-full flex items-center justify-between p-3 bg-transparent border border-[#27272a] hover:bg-[#27272a]/30 rounded-xl text-left text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-[#a1a1aa]">
                  <Lightbulb className="w-3.5 h-3.5 text-[#71717a]" />
                  <span>Access Knowledge Base</span>
                </div>
                <ArrowRight className="w-3 h-3 text-[#71717a]" />
              </button>
              <button 
                onClick={() => onNavigate('insights')}
                className="w-full flex items-center justify-between p-3 bg-transparent border border-[#27272a] hover:bg-[#27272a]/30 rounded-xl text-left text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-[#a1a1aa]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#71717a]" />
                  <span>Analyze Emotional Trends</span>
                </div>
                <ArrowRight className="w-3 h-3 text-[#71717a]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
