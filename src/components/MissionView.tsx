import React, { useEffect, useState } from 'react';
import { 
  Target, 
  ShieldAlert, 
  ListTodo, 
  Trash2, 
  Plus, 
  Check, 
  Calendar,
  Eye,
  Zap,
  RotateCcw,
  Sparkles,
  Heart,
  User,
  Shield,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from './AuthContext.tsx';
import { Mission, Goal } from '../types.ts';

interface MissionViewProps {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'loading') => void;
}

export const MissionView: React.FC<MissionViewProps> = ({ showToast }) => {
  const { token } = useAuth();
  
  // Mission states
  const [mission, setMission] = useState<Mission | null>(null);
  const [savingMission, setSavingMission] = useState<boolean>(false);
  const [vision, setVision] = useState<string>('');
  const [strengths, setStrengths] = useState<string>(''); // Dream Career
  const [weaknesses, setWeaknesses] = useState<string>(''); // Fear List
  const [goodHabits, setGoodHabits] = useState<string>(''); // Habits I'm Building
  const [badHabits, setBadHabits] = useState<string>(''); // Habits I'm Breaking
  const [principles, setPrinciples] = useState<string>(''); // My Principles
  const [neverCompromise, setNeverCompromise] = useState<string>(''); // Things I Will Never Compromise
  const [motivations, setMotivations] = useState<string>(''); // Core Values
  const [neverWantToBecome, setNeverWantToBecome] = useState<string>(''); // The Person I Want To Become
  const [successDefinition, setSuccessDefinition] = useState<string>(''); // Definition of Success

  // Goals states
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');
  const [newGoalDesc, setNewGoalDesc] = useState<string>('');
  const [newGoalCategory, setNewGoalCategory] = useState<string>('career');
  const [newGoalDate, setNewGoalDate] = useState<string>('');
  const [creatingGoal, setCreatingGoal] = useState<boolean>(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'blueprint' | 'goals'>('blueprint');

  useEffect(() => {
    if (!token) return;
    fetchMissionAndGoals();
  }, [token]);

  const fetchMissionAndGoals = async () => {
    try {
      // 1. Fetch Mission
      const mRes = await fetch('/api/missions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        setMission(mData);
        setVision(mData.vision || '');
        setStrengths(mData.strengths || '');
        setWeaknesses(mData.weaknesses || '');
        setGoodHabits(mData.goodHabits || '');
        setBadHabits(mData.badHabits || '');
        
        // Split personalRules into principles and neverCompromise
        const rules = mData.personalRules || '';
        const parts = rules.split('\n---\n');
        setPrinciples(parts[0] || '');
        setNeverCompromise(parts[1] || '');

        setMotivations(mData.motivations || '');
        setNeverWantToBecome(mData.neverWantToBecome || '');
        setSuccessDefinition(mData.successDefinition || '');
      }

      // 2. Fetch Goals
      const gRes = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (gRes.ok) {
        const gData = await gRes.json();
        setGoals(gData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMission(true);
    showToast('Aligning blueprint with future self...', 'loading');
    
    // Combine principles and neverCompromise
    const combinedRules = `${principles}\n---\n${neverCompromise}`;

    try {
      const response = await fetch('/api/missions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vision,
          strengths, // Dream Career
          weaknesses, // Fear List
          goodHabits, // Habits I'm Building
          badHabits, // Habits I'm Breaking
          personalRules: combinedRules,
          motivations, // Core Values
          neverWantToBecome, // The Person I Want To Become
          successDefinition // Definition of Success
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setMission(updated);
        showToast('Personal blueprint saved.', 'success');
      } else {
        showToast('Failed to save blueprint.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving blueprint.', 'error');
    } finally {
      setSavingMission(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    setCreatingGoal(true);
    showToast('Registering goal...', 'loading');
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newGoalTitle,
          description: newGoalDesc,
          category: newGoalCategory,
          targetDate: newGoalDate
        })
      });

      if (response.ok) {
        const created = await response.json();
        setGoals([created, ...goals]);
        setNewGoalTitle('');
        setNewGoalDesc('');
        setNewGoalDate('');
        showToast('Goal added successfully.', 'success');
      } else {
        showToast('Failed to save goal.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error creating goal.', 'error');
    } finally {
      setCreatingGoal(false);
    }
  };

  const handleUpdateGoalProgress = async (goalId: number, progress: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ progress })
      });

      if (response.ok) {
        const updated = await response.json();
        setGoals(goals.map(g => g.id === goalId ? updated : g));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleGoalStatus = async (goalId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const nextProgress = nextStatus === 'COMPLETED' ? 100 : 50;
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus, progress: nextProgress })
      });

      if (response.ok) {
        const updated = await response.json();
        setGoals(goals.map(g => g.id === goalId ? updated : g));
        showToast(nextStatus === 'COMPLETED' ? 'Goal achieved! Keep moving forward.' : 'Goal reactivated.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm('Are you sure you want to permanently delete this goal?')) return;
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGoals(goals.filter(g => g.id !== goalId));
        showToast('Goal removed.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-5xl mx-auto text-[#fafafa] font-sans selection:bg-white selection:text-black">
      
      {/* Page Header */}
      <div className="border-b border-[#1c1c1e] pb-6">
        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white font-display">Personal Blueprint</h2>
        <p className="text-sm text-[#71717a] mt-1.5 leading-relaxed">
          Define who you are trying to become. This is the compass your future self will use to help you navigate critical decisions.
        </p>
      </div>

      {/* Modern Centered Tabs */}
      <div className="flex border-b border-[#1c1c1e] max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'blueprint' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          My Personal Blueprint
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'goals' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          My Long-Term Goals ({goals.length})
        </button>
      </div>

      {/* TAB 1: BLUEPRINT */}
      {activeTab === 'blueprint' && (
        <form onSubmit={handleSaveMission} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1 */}
            <div className="space-y-6">
              
              {/* Life Vision */}
              <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <Eye className="w-3.5 h-3.5 text-white" />
                  Life Vision
                </label>
                <textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Where are you heading in 5-10 years? Define your ultimate reality."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                />
              </div>

              {/* Core Values */}
              <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <Heart className="w-3.5 h-3.5 text-white" />
                  Core Values
                </label>
                <textarea
                  value={motivations}
                  onChange={(e) => setMotivations(e.target.value)}
                  placeholder="What are the non-negotiable core values that direct your decisions?"
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                />
              </div>

              {/* The Person I Want To Become */}
              <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <User className="w-3.5 h-3.5 text-white" />
                  The Person I Want To Become
                </label>
                <textarea
                  value={neverWantToBecome}
                  onChange={(e) => setNeverWantToBecome(e.target.value)}
                  placeholder="Describe the characteristics, posture, and traits of your ultimate self."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                />
              </div>

              {/* My Principles */}
              <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <Shield className="w-3.5 h-3.5 text-white" />
                  My Principles
                </label>
                <textarea
                  value={principles}
                  onChange={(e) => setPrinciples(e.target.value)}
                  placeholder="Your personal codes and laws. e.g., 'Sleep 7+ hours', 'No screen time before work'."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                />
              </div>

              {/* Things I Will Never Compromise */}
              <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-white" />
                  Things I Will Never Compromise
                </label>
                <textarea
                  value={neverCompromise}
                  onChange={(e) => setNeverCompromise(e.target.value)}
                  placeholder="Your absolute boundary lines that guard your peace, values, and energy."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                />
              </div>

            </div>
            
            {/* Column 2 */}
            <div className="space-y-6">

              {/* Habits Section */}
              <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                    <Zap className="w-3.5 h-3.5 text-white" />
                    Habits I'm Building
                  </label>
                  <textarea
                    value={goodHabits}
                    onChange={(e) => setGoodHabits(e.target.value)}
                    placeholder="Tiny deliberate habits you are practicing daily."
                    rows={2.5}
                    className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                  />
                </div>
                <div className="space-y-2 pt-2 border-t border-[#1c1c1e]">
                  <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    Habits I'm Breaking
                  </label>
                  <textarea
                    value={badHabits}
                    onChange={(e) => setBadHabits(e.target.value)}
                    placeholder="Temptations, micro-behaviors, and patterns you are shedding."
                    rows={2.5}
                    className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                  />
                </div>
              </div>

              {/* Dream Career */}
              <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <Award className="w-3.5 h-3.5 text-white" />
                  Dream Career
                </label>
                <textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Detail your ultimate career target, contribution, or focus."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                />
              </div>

              {/* Definition of Success */}
              <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  Definition of Success
                </label>
                <textarea
                  value={successDefinition}
                  onChange={(e) => setSuccessDefinition(e.target.value)}
                  placeholder="What is your honest definition of a well-lived life?"
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                />
              </div>

              {/* Fear List */}
              <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Fear List
                </label>
                <textarea
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="What fears, insecurities, or worst-case scenarios hold you back?"
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                />
              </div>

            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-[#1c1c1e]">
            <button
              type="submit"
              disabled={savingMission}
              className="px-6 py-3 bg-white text-black font-semibold text-xs rounded-xl hover:bg-[#fafafa]/90 shadow-md transition-all cursor-pointer uppercase font-mono tracking-wider"
            >
              {savingMission ? 'Aligning...' : 'Save Blueprint'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: GOALS */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Create Goal Form */}
          <div className="lg:col-span-1 p-5 bg-[#09090b] border border-[#1c1c1e] rounded-xl">
            <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 uppercase font-mono tracking-wider">
              <Plus className="w-4 h-4 text-white" />
              Register New Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase mb-1.5">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Master Accounting Ch 4"
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase mb-1.5">Focus Description</label>
                <textarea
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  placeholder="What is the definition of done?"
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase mb-1.5">Category</label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                  >
                    <option value="career">Career</option>
                    <option value="health">Health</option>
                    <option value="wealth">Wealth</option>
                    <option value="personal">Personal</option>
                    <option value="relationship">Relationship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase mb-1.5">Target Date</label>
                  <input
                    type="date"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#18181b]/40 border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingGoal}
                className="w-full py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-[#fafafa]/90 transition-colors cursor-pointer uppercase font-mono tracking-wider"
              >
                {creatingGoal ? 'Saving...' : 'Add Goal'}
              </button>
            </form>
          </div>

          {/* Goal List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest flex items-center gap-2 font-mono">
              <ListTodo className="w-4 h-4 text-[#71717a]" />
              Active Goals ({goals.filter(g => g.status === 'PENDING').length})
            </h3>

            {goals.length === 0 ? (
              <div className="py-12 text-center text-[#71717a] border border-dashed border-[#1c1c1e] rounded-xl">
                <p className="text-sm">No registered goals found. Define some long-term goals first.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className={`p-5 bg-[#09090b] border rounded-xl transition-all ${
                      goal.status === 'COMPLETED' ? 'border-[#1c1c1e]/40 opacity-50' : 'border-[#1c1c1e]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-semibold truncate ${
                            goal.status === 'COMPLETED' ? 'line-through text-[#71717a]' : 'text-white'
                          }`}>
                            {goal.title}
                          </h4>
                          <span className="text-[9px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            {goal.category}
                          </span>
                        </div>
                        {goal.description && (
                          <p className="text-xs text-[#a1a1aa] leading-relaxed">{goal.description}</p>
                        )}
                        {goal.targetDate && (
                          <div className="flex items-center gap-1 text-[10px] text-[#71717a] font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Target: {goal.targetDate}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleGoalStatus(goal.id, goal.status)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            goal.status === 'COMPLETED' 
                              ? 'bg-white text-black border-white' 
                              : 'bg-[#18181b]/50 border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46]'
                          }`}
                          title={goal.status === 'COMPLETED' ? 'Re-open Goal' : 'Achieve Goal'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 rounded-lg border bg-[#18181b]/50 border-[#27272a] text-[#71717a] hover:text-rose-400 hover:border-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Slider (Only for active goals) */}
                    {goal.status !== 'COMPLETED' && (
                      <div className="mt-4 pt-3 border-t border-[#1c1c1e] flex items-center gap-4">
                        <span className="text-[10px] text-[#71717a] font-mono font-bold uppercase">Progress</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={goal.progress}
                          onChange={(e) => handleUpdateGoalProgress(goal.id, parseInt(e.target.value))}
                          className="flex-1 accent-white h-1 bg-[#18181b] rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-mono font-semibold text-[#fafafa] w-8 text-right">{goal.progress}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
