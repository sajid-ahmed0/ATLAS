import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  Plus, 
  Activity, 
  AlertTriangle,
  Lightbulb,
  Check,
  ArrowRight,
  Target,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from './AuthContext.tsx';
import { DashboardRecommendation, Goal, Decision, JournalEntry, Mission } from '../types.ts';

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
  const [mission, setMission] = useState<Mission | null>(null);
  const [recentReflection, setRecentReflection] = useState<string>('');
  const [todayJournal, setTodayJournal] = useState<JournalEntry | null>(null);
  const [submittingState, setSubmittingState] = useState<boolean>(false);

  // Today state metrics
  const [mood, setMood] = useState<string>('Clear');
  const [energy, setEnergy] = useState<string>('Medium');
  const [stress, setStress] = useState<string>('Low');
  const [focus, setFocus] = useState<string>('');
  const [challenge, setChallenge] = useState<string>('');
  const [showStateLogger, setShowStateLogger] = useState<boolean>(false);

  // Quick inputs
  const [quickGoalTitle, setQuickGoalTitle] = useState<string>('');

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
          setMood(jData.mood || 'Clear');
          setEnergy(jData.energy || 'Medium');
          setStress(jData.stress || 'Low');
          setFocus(jData.focus || '');
          setChallenge(jData.challenge || '');
        }
      }

      // 2. Fetch goals (Today's Priorities)
      const gRes = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (gRes.ok) {
        const gData = await gRes.json();
        // Keep pending goals as active priorities
        setGoals(gData.filter((g: Goal) => g.status === 'PENDING').slice(0, 3));
      }

      // 3. Fetch decisions
      const dRes = await fetch('/api/decisions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dRes.ok) {
        const dData = await dRes.json();
        setDecisions(dData);
      }

      // 4. Fetch Mission
      const mRes = await fetch('/api/missions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        setMission(mData);
      }

      // 5. Fetch journal history for recent reflections
      const hRes = await fetch('/api/journal/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (hRes.ok) {
        const hData = await hRes.json();
        // Get the latest lesson written by the user (ignoring today's if empty)
        const pastEntries = hData.filter((j: JournalEntry) => j.date !== todayStr);
        const entryWithLesson = pastEntries.find((j: JournalEntry) => j.lessons && j.lessons.trim().length > 0);
        if (entryWithLesson) {
          setRecentReflection(entryWithLesson.lessons);
        }
      }

      // 6. Fetch AI Recommendation
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
    showToast('Calibrating focus parameters...', 'loading');
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
        const updatedEntry = await response.json();
        setTodayJournal(updatedEntry);
        showToast('Focus settings aligned.', 'success');
        setShowStateLogger(false);

        // Regenerate briefing
        showToast('Atlas is thinking about your day...', 'loading');
        const bRes = await fetch('/api/dashboard/recommendation', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bRes.ok) {
          const bData = await bRes.json();
          setRecommendation(bData);
          showToast('New AI insights generated.', 'success');
        }
      } else {
        showToast('Could not save your today focus.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating focus.', 'error');
    } finally {
      setSubmittingState(false);
    }
  };

  const handleToggleGoal = async (goalId: number) => {
    showToast('Priority marked as complete!', 'success');
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'COMPLETED', progress: 100 })
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuickPriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickGoalTitle.trim()) return;
    showToast('Adding to today\'s priorities...', 'loading');
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quickGoalTitle,
          category: 'personal',
          description: 'Created from today\'s priorities checklist.',
          targetDate: todayStr
        })
      });

      if (response.ok) {
        setQuickGoalTitle('');
        showToast('Priority registered.', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      showToast('Error adding priority.', 'error');
    }
  };

  // Find the first pending decision
  const currentDecision = decisions.find(d => d.status === 'PENDING');

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-5xl mx-auto text-[#fafafa] font-sans selection:bg-white selection:text-black">
      
      {/* Editorial Header Greeting */}
      <div className="space-y-2 border-b border-[#1c1c1e] pb-8">
        <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white font-display">
          Welcome back, <span className="font-normal text-white">{firebaseUser?.displayName?.split(' ')[0] || 'Friend'}</span>.
        </h2>
        <p className="text-xs text-[#71717a] uppercase tracking-widest font-mono">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* The Central Question Banner */}
      <div className="py-6 border-y border-[#1c1c1e] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest block font-bold">The Core Question</span>
          <h1 className="text-xl md:text-2xl font-serif text-[#e4e4e7] italic leading-snug">
            "What is the best thing I should do right now to move closer to the life I want?"
          </h1>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={() => onNavigate('decision')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#fafafa] hover:bg-[#e4e4e7] text-[#09090b] rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Decision
          </button>
          <button 
            onClick={() => setShowStateLogger(!showStateLogger)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#18181b] border border-[#27272a] hover:bg-[#27272a]/80 text-[#fafafa] rounded-lg transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-[#a1a1aa]" />
            {showStateLogger ? 'Close Focus State' : 'Refine Focus'}
          </button>
        </div>
      </div>

      {/* Collapsible Today's Focus & State Calibration Form */}
      {showStateLogger && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-[#18181b] border border-[#27272a] rounded-xl space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest font-bold">How are you feeling right now?</h3>
            <button className="text-[10px] text-[#71717a] hover:text-white" onClick={() => setShowStateLogger(false)}>Dismiss</button>
          </div>
          <form onSubmit={handleUpdateState} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase mb-2">Current Mood</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Clear', 'Anxious', 'Fatigued', 'Inspired', 'Overwhelmed', 'Neutral'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`py-1.5 text-[10px] rounded-md border transition-all cursor-pointer ${
                        mood === m 
                          ? 'bg-[#fafafa] border-white text-black font-semibold' 
                          : 'bg-[#09090b]/50 border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase mb-2">Energy Level</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['High', 'Medium', 'Low'].map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEnergy(e)}
                      className={`py-1.5 text-[10px] rounded-md border transition-all cursor-pointer ${
                        energy === e 
                          ? 'bg-[#fafafa] border-white text-black font-semibold' 
                          : 'bg-[#09090b]/50 border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase mb-2">Stress Level</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['High', 'Medium', 'Low'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStress(s)}
                      className={`py-1.5 text-[10px] rounded-md border transition-all cursor-pointer ${
                        stress === s 
                          ? 'bg-rose-950/40 border-rose-800 text-rose-400 font-semibold' 
                          : 'bg-[#09090b]/50 border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase mb-1.5">Today's Focus</label>
                <input
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="What is your ultimate point of focus for today?"
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-xs text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase mb-1.5">Biggest Obstacle</label>
                <input
                  type="text"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="What is pulling your attention or slowing you down?"
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-xs text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submittingState}
                className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-[#fafafa]/90 cursor-pointer uppercase font-mono tracking-wider"
              >
                {submittingState ? 'Saving...' : 'Set State & Align Briefing'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Dynamic AI Thinking Partner Section (AI Insight Block) */}
      {recommendation && (
        <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">AI Insight</span>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white italic font-display">"{recommendation.headline}"</h3>
            <p className="text-sm text-[#a1a1aa] leading-relaxed max-w-3xl">{recommendation.focusAdvice}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-[#09090b]/40 rounded-lg border border-[#27272a] flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[9px] font-mono uppercase text-amber-500 font-bold tracking-wider mb-0.5">Pattern Detected</span>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{recommendation.warningsOrBiases}</p>
              </div>
            </div>
            <div className="p-3 bg-[#09090b]/40 rounded-lg border border-[#27272a] flex gap-3">
              <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[9px] font-mono uppercase text-blue-400 font-bold tracking-wider mb-0.5">Immediate Suggestion</span>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{recommendation.alignedHabitToPractice}</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-[#27272a] rounded-lg text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono bg-[#27272a] text-[#e4e4e7] px-2 py-0.5 rounded font-bold uppercase">Decision Recommendation</span>
              <p className="text-[#e4e4e7] font-medium">{recommendation.microAction}</p>
            </div>
            <button onClick={() => onNavigate('journal')} className="text-[10px] text-[#fafafa] font-semibold flex items-center gap-1 hover:underline shrink-0">
              Go to Journal
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Four-Question Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* Question 1: Who am I trying to become? */}
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-2xl flex flex-col justify-between min-h-[220px] transition-all hover:border-[#3f3f46]">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-[#71717a] font-medium font-mono uppercase tracking-widest">1. Who am I trying to become?</span>
                <button 
                  onClick={() => onNavigate('mission')}
                  className="text-[10px] text-[#fafafa] font-mono hover:underline uppercase tracking-wider"
                >
                  Edit Mission
                </button>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider font-mono">Current Mission</span>
                <h3 className="text-lg font-serif italic text-white leading-relaxed">
                  "{mission?.vision || "Become a disciplined student capable of getting into DU BBA."}"
                </h3>
              </div>
            </div>
            <div className="pt-4 border-t border-[#1c1c1e] flex items-center justify-between text-[11px] text-[#a1a1aa]">
              <span>Rooted in your identity blueprint</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#71717a]" />
            </div>
          </div>

          {/* Question 2: What matters today? */}
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-2xl flex flex-col justify-between min-h-[280px] transition-all hover:border-[#3f3f46]">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-[#71717a] font-medium font-mono uppercase tracking-widest">2. What matters today?</span>
                <span className="text-[10px] text-[#71717a] font-mono">Only 3 Priorities</span>
              </div>
              
              <div className="space-y-3">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider font-mono block">Today's Priorities</span>
                
                {goals.length === 0 ? (
                  /* Fallback List when no goals are entered */
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-[#18181b]/30 border border-[#27272a]/60 rounded-lg">
                      <span className="h-4 w-4 rounded-full border border-[#27272a] flex items-center justify-center text-[10px] text-emerald-400">•</span>
                      <span className="text-xs text-[#e4e4e7]">Finish Accounting Chapter 4</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#18181b]/30 border border-[#27272a]/60 rounded-lg">
                      <span className="h-4 w-4 rounded-full border border-[#27272a] flex items-center justify-center text-[10px] text-emerald-400">•</span>
                      <span className="text-xs text-[#e4e4e7]">Practice English Vocabulary</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#18181b]/30 border border-[#27272a]/60 rounded-lg">
                      <span className="h-4 w-4 rounded-full border border-[#27272a] flex items-center justify-center text-[10px] text-emerald-400">•</span>
                      <span className="text-xs text-[#e4e4e7]">Exercise for 30 minutes</span>
                    </div>
                  </div>
                ) : (
                  /* Real goals connected to DB */
                  <div className="space-y-2">
                    {goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => handleToggleGoal(goal.id)}
                        className="w-full flex items-center gap-3 p-2 bg-[#18181b]/30 border border-[#27272a]/60 rounded-lg text-left hover:border-[#3f3f46] transition-all cursor-pointer group"
                      >
                        <span className="h-4 w-4 rounded border border-[#27272a] group-hover:border-white transition-colors shrink-0 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                        <span className="text-xs text-[#e4e4e7] truncate">{goal.title}</span>
                      </button>
                    ))}
                    {goals.length < 3 && (
                      <form onSubmit={handleCreateQuickPriority} className="flex gap-2 mt-2">
                        <input
                          type="text"
                          required
                          value={quickGoalTitle}
                          onChange={(e) => setQuickGoalTitle(e.target.value)}
                          placeholder="Quick add a priority..."
                          className="flex-1 px-2.5 py-1.5 text-xs bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46]"
                        />
                        <button type="submit" className="px-2.5 py-1.5 bg-[#fafafa] hover:bg-[#e4e4e7] text-[#09090b] text-[10px] font-bold rounded-lg uppercase font-mono cursor-pointer">
                          Add
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate('mission')}
              className="pt-4 border-t border-[#1c1c1e] text-[11px] text-[#a1a1aa] hover:text-white hover:underline text-left flex items-center justify-between"
            >
              <span>Manage active goals registry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Question 3: What important decision needs my attention? */}
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-2xl flex flex-col justify-between min-h-[220px] transition-all hover:border-[#3f3f46]">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-[#71717a] font-medium font-mono uppercase tracking-widest">3. Current Decision</span>
                <span className="text-[9px] bg-rose-950/40 text-rose-400 border border-rose-900 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Attention Required</span>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-md font-semibold text-white leading-snug">
                  {currentDecision ? currentDecision.title : "Should I revise Accounting or practice English tonight?"}
                </h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-3">
                  {currentDecision ? currentDecision.description : "An imminent tradeoff between reinforcing technical accounting concepts or practicing vocabulary to maximize my scores tonight."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1c1c1e] flex items-center justify-between">
              <button
                onClick={() => onNavigate('decision')}
                className="w-full py-2.5 bg-white text-[#09090b] hover:bg-[#e4e4e7] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer uppercase font-mono"
              >
                <Brain className="w-3.5 h-3.5" />
                Analyze Decision Parameters
              </button>
            </div>
          </div>

          {/* Question 4: What did I learn recently? */}
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-2xl flex flex-col justify-between min-h-[280px] transition-all hover:border-[#3f3f46]">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-[#71717a] font-medium font-mono uppercase tracking-widest">4. What did I learn recently?</span>
                <span className="text-[10px] text-blue-400 font-mono">Reflection</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider font-mono">Yesterday's Lesson</span>
                <p className="text-sm italic text-[#e4e4e7] font-serif leading-relaxed">
                  "{recentReflection || "You usually regret scrolling social media before studying. Deliberate isolation creates focus."}"
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('journal')}
              className="pt-4 border-t border-[#1c1c1e] text-[11px] text-[#a1a1aa] hover:text-white hover:underline text-left flex items-center justify-between"
            >
              <span>Review full reflection history</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
