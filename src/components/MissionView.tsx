import React, { useEffect, useState } from 'react';
import { 
  Target, 
  ShieldAlert, 
  ListTodo, 
  Trash2, 
  Plus, 
  Check, 
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  Zap,
  RotateCcw
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
  const [strengths, setStrengths] = useState<string>('');
  const [weaknesses, setWeaknesses] = useState<string>('');
  const [goodHabits, setGoodHabits] = useState<string>('');
  const [badHabits, setBadHabits] = useState<string>('');
  const [personalRules, setPersonalRules] = useState<string>('');
  const [motivations, setMotivations] = useState<string>('');
  const [neverWantToBecome, setNeverWantToBecome] = useState<string>('');
  const [successDefinition, setSuccessDefinition] = useState<string>('');

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
        setPersonalRules(mData.personalRules || '');
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
    showToast('Saving mission blueprint...', 'loading');
    try {
      const response = await fetch('/api/missions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vision,
          strengths,
          weaknesses,
          goodHabits,
          badHabits,
          personalRules,
          motivations,
          neverWantToBecome,
          successDefinition
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setMission(updated);
        showToast('Mission blueprint securely updated.', 'success');
      } else {
        showToast('Failed to update blueprint.', 'error');
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
        showToast('Goal registered successfully.', 'success');
      } else {
        showToast('Failed to register goal.', 'error');
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
        showToast(nextStatus === 'COMPLETED' ? 'Goal achieved! Excellent work.' : 'Goal reactivated.', 'success');
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
        showToast('Goal record removed.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[#fafafa] font-sans">
      
      {/* Page Header */}
      <div className="border-b border-[#27272a] pb-6">
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">Mission & Identity</h2>
        <p className="text-sm text-[#a1a1aa] mt-1">
          Store your foundational rules, values, and vision. This page forms the context engine that maps the AI strategist's recommendations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27272a] max-w-md">
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'blueprint' 
              ? 'border-white text-white' 
              : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          Operating Blueprint
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'goals' 
              ? 'border-white text-white' 
              : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          Goals Registry ({goals.length})
        </button>
      </div>

      {/* TAB 1: BLUEPRINT */}
      {activeTab === 'blueprint' && (
        <form onSubmit={handleSaveMission} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1 */}
            <div className="space-y-6">
              
              {/* Life Vision */}
              <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <Eye className="w-3.5 h-3.5 text-white" />
                  Life Vision (Long-term)
                </label>
                <textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Where are you heading in 5-10 years? Define your ultimate reality."
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              {/* Personal Rules */}
              <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Personal Rules & Principles
                </label>
                <textarea
                  value={personalRules}
                  onChange={(e) => setPersonalRules(e.target.value)}
                  placeholder="e.g. Always sleep 7+ hours, Never make decisions when angry, No screen time after 10 PM."
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              {/* Strengths */}
              <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <Zap className="w-3.5 h-3.5 text-white animate-pulse" />
                  Personal Strengths
                </label>
                <textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="List your core cognitive and execution advantages."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              {/* Weaknesses */}
              <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400/80" />
                  Blindspots & Weaknesses
                </label>
                <textarea
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="What often triggers you or slows down your progress?"
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

            </div>

            {/* Column 2 */}
            <div className="space-y-6">

              {/* Good & Bad Habits */}
              <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Good Habits to Cultivate</label>
                  <textarea
                    value={goodHabits}
                    onChange={(e) => setGoodHabits(e.target.value)}
                    placeholder="e.g. Daily exercise, reading, planning tasks first thing"
                    rows={2.5}
                    className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Bad Habits to Destroy</label>
                  <textarea
                    value={badHabits}
                    onChange={(e) => setBadHabits(e.target.value)}
                    placeholder="e.g. Doomscrolling on phone, procrastinating, impulsive spending"
                    rows={2.5}
                    className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              {/* Motivations & Antipatterns */}
              <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Core Motivations</label>
                  <textarea
                    value={motivations}
                    onChange={(e) => setMotivations(e.target.value)}
                    placeholder="What drives your energy? e.g. Freedom, impact, building great code."
                    rows={2.5}
                    className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">Who I Never Want to Become</label>
                  <textarea
                    value={neverWantToBecome}
                    onChange={(e) => setNeverWantToBecome(e.target.value)}
                    placeholder="Define your ultimate personal antipattern to avoid slide-backs."
                    rows={2.5}
                    className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              {/* Definition of Success */}
              <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider font-bold">My Definition of Success</label>
                <textarea
                  value={successDefinition}
                  onChange={(e) => setSuccessDefinition(e.target.value)}
                  placeholder="How do you define a life well lived? Keep it distinct and honest."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingMission}
              className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-[#fafafa]/90 shadow-md transition-all cursor-pointer"
            >
              {savingMission ? 'Saving Blueprint...' : 'Save Blueprint'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: GOALS */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Create Goal Form */}
          <div className="lg:col-span-1 p-5 bg-[#18181b] border border-[#27272a] rounded-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              Register New Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-1.5">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Secure dynamic backend"
                  className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-1.5">Description</label>
                <textarea
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  placeholder="Detail the metrics and definition of done"
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-1.5">Category</label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                  >
                    <option value="career">Career</option>
                    <option value="health">Health</option>
                    <option value="wealth">Wealth</option>
                    <option value="personal">Personal</option>
                    <option value="relationship">Relationship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-1.5">Target Date</label>
                  <input
                    type="date"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingGoal}
                className="w-full py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-[#fafafa]/90 transition-colors cursor-pointer"
              >
                {creatingGoal ? 'Adding...' : 'Add Goal to Registry'}
              </button>
            </form>
          </div>

          {/* Goal List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#71717a]" />
              Active Goals ({goals.filter(g => g.status === 'PENDING').length})
            </h3>

            {goals.length === 0 ? (
              <div className="py-12 text-center text-[#71717a] border border-dashed border-[#27272a] rounded-xl">
                <p className="text-sm">No registered goals found. Create your first goal using the left panel.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className={`p-5 bg-[#18181b] border rounded-xl transition-all ${
                      goal.status === 'COMPLETED' ? 'border-[#27272a]/40 opacity-60' : 'border-[#27272a]'
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
                          <span className="text-[9px] bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa] px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            {goal.category}
                          </span>
                        </div>
                        {goal.description && (
                          <p className="text-xs text-[#a1a1aa] leading-relaxed">{goal.description}</p>
                        )}
                        {goal.targetDate && (
                          <div className="flex items-center gap-1 text-[10px] text-[#71717a] font-mono">
                            <Calendar className="w-3 h-3" />
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
                              : 'bg-[#09090b]/50 border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46]'
                          }`}
                          title={goal.status === 'COMPLETED' ? 'Mark Pending' : 'Mark Achieved'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 rounded-lg border bg-[#09090b]/50 border-[#27272a] text-[#71717a] hover:text-rose-400 hover:border-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Slider (Only for active goals) */}
                    {goal.status !== 'COMPLETED' && (
                      <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center gap-4">
                        <span className="text-[10px] text-[#71717a] font-mono font-bold uppercase">Progress</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={goal.progress}
                          onChange={(e) => handleUpdateGoalProgress(goal.id, parseInt(e.target.value))}
                          className="flex-1 accent-white h-1 bg-[#09090b] rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-mono font-semibold text-white w-8 text-right">{goal.progress}%</span>
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
