import React, { useEffect, useState } from 'react';
import { 
  Brain, 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  HelpCircle, 
  ShieldAlert, 
  Flame, 
  Compass, 
  Bookmark, 
  Scale, 
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from './AuthContext.tsx';
import { Decision } from '../types.ts';

interface DecisionViewProps {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'loading') => void;
}

export const DecisionView: React.FC<DecisionViewProps> = ({ showToast }) => {
  const { token } = useAuth();
  
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [viewingHistory, setViewingHistory] = useState<boolean>(true);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Career');
  const [importance, setImportance] = useState<number>(5);
  const [mood, setMood] = useState<string>('Neutral');
  const [energy, setEnergy] = useState<string>('Medium');
  const [deadline, setDeadline] = useState<string>('');
  const [availableTime, setAvailableTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Dynamic options
  const [options, setOptions] = useState<Array<{ title: string; description: string }>>([
    { title: 'Option A', description: '' },
    { title: 'Option B', description: '' }
  ]);

  useEffect(() => {
    if (!token) return;
    fetchDecisions();
  }, [token]);

  const fetchDecisions = async () => {
    try {
      const res = await fetch('/api/decisions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDecisions(data);
        if (data.length > 0 && !selectedDecision) {
          // Default to the most recent decision
          setSelectedDecision(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { title: `Option ${String.fromCharCode(65 + options.length)}`, description: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill in the title and description.', 'error');
      return;
    }
    setAnalyzing(true);
    showToast('Atlas is evaluating decision criteria...', 'loading');
    try {
      const response = await fetch('/api/decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          importance,
          mood,
          energy,
          deadline,
          availableTime,
          notes,
          options
        })
      });

      if (response.ok) {
        const result = await response.json();
        setDecisions([result, ...decisions]);
        setSelectedDecision(result);
        
        // Reset form
        setTitle('');
        setDescription('');
        setImportance(5);
        setNotes('');
        setOptions([
          { title: 'Option A', description: '' },
          { title: 'Option B', description: '' }
        ]);

        showToast('Strategic analysis complete.', 'success');
        setViewingHistory(true); // Switch to viewing results
      } else {
        const errData = await response.json();
        showToast(errData.error || 'Evaluation failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error during analysis.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectOptionChoice = async (decisionId: number, optionId: number) => {
    showToast('Registering choice selection...', 'loading');
    try {
      const response = await fetch(`/api/decisions/${decisionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'DECIDED',
          selectedOptionId: optionId
        })
      });

      if (response.ok) {
        showToast('Decision finalized.', 'success');
        // Refresh local items
        await fetchDecisions();
        // Update selected view
        if (selectedDecision && selectedDecision.id === decisionId) {
          const updatedSelected = {
            ...selectedDecision,
            status: 'DECIDED' as const,
            options: selectedDecision.options.map(o => ({ ...o, isSelected: o.id === optionId }))
          };
          setSelectedDecision(updatedSelected);
        }
      } else {
        showToast('Failed to save choice.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error registering choice.', 'error');
    }
  };

  const handleDeleteDecision = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this decision analysis?')) return;
    try {
      const response = await fetch(`/api/decisions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDecisions(decisions.filter(d => d.id !== id));
        if (selectedDecision?.id === id) {
          setSelectedDecision(decisions.find(d => d.id !== id) || null);
        }
        showToast('Decision analysis deleted.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[#fafafa] font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">Decision Center</h2>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Challenge your emotional state, list choices, uncover biases, and receive high-integrity operating advice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingHistory(!viewingHistory)}
            className="px-4 py-2 text-xs font-semibold bg-[#27272a] border border-[#3f3f46] hover:bg-[#27272a]/80 text-[#fafafa] rounded-lg transition-colors cursor-pointer"
          >
            {viewingHistory ? 'New Decision Analysis' : 'Browse Analytics History'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Decision History list (Only in viewingHistory mode) */}
        {viewingHistory && (
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest">Decision Registry</h3>
            {decisions.length === 0 ? (
              <p className="text-xs text-[#71717a] italic">No historical decisions. Analyze one on the right.</p>
            ) : (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {decisions.map((dec) => (
                  <button
                    key={dec.id}
                    onClick={() => setSelectedDecision(dec)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      selectedDecision?.id === dec.id
                        ? 'bg-[#18181b] border-white text-[#fafafa] font-medium shadow-md'
                        : 'bg-[#09090b]/50 border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h4 className="text-sm font-semibold truncate flex-1 leading-tight">{dec.title}</h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${
                        dec.status === 'DECIDED' ? 'bg-white text-black' : 'bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]'
                      }`}>
                        {dec.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717a] truncate mb-2">{dec.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a] pt-2 border-t border-[#27272a]/40">
                      <span>{dec.category}</span>
                      <span>Imp: {dec.importance}/10</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Side / Middle Container: Main Working Pane */}
        <div className={viewingHistory ? 'lg:col-span-3' : 'lg:col-span-4'}>
          
          {/* SKELETON ANALYZING LOADER */}
          {analyzing ? (
            <div className="p-8 bg-[#18181b] border border-[#27272a] rounded-2xl flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold font-display text-white">Atlas is reasoning server-side...</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  Parsing operating alignment rulebook, evaluating short-term vs long-term tradeoffs, evaluating opportunity costs, and mapping sub-conscious cognitive biases...
                </p>
              </div>
            </div>
          ) : !viewingHistory ? (
            
            // FORM FOR CREATING NEW DECISION ANALYSIS
            <form onSubmit={handleSubmitDecision} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-[#27272a] pb-4 mb-2">
                <Brain className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold font-display text-white">Initiate Decision Evaluation</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Core details */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Decision Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Choose whether to accept offer from TechCorp or stay freelance"
                      className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Comprehensive Description</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Contextualize the dilemma. What is the immediate conflict? What are your fears?"
                      rows={4}
                      className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                      >
                        {['Career', 'Finance', 'Lifestyle', 'Relationship', 'Health', 'General'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Importance (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={importance}
                        onChange={(e) => setImportance(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] focus:outline-none focus:border-[#3f3f46] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Emotional Mood</label>
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                      >
                        {['Clear', 'Anxious', 'Fatigued', 'Inspired', 'Overwhelmed', 'Neutral'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Energy Level</label>
                      <select
                        value={energy}
                        onChange={(e) => setEnergy(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                      >
                        {['High', 'Medium', 'Low'].map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Deadline</label>
                      <input
                        type="text"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        placeholder="e.g. Next Friday"
                        className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Time Available</label>
                      <input
                        type="text"
                        value={availableTime}
                        onChange={(e) => setAvailableTime(e.target.value)}
                        placeholder="e.g. 10 hours of research"
                        className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Additional Notes / Nuances</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add supplementary links, options metadata, or external pressures..."
                      rows={2.5}
                      className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                    />
                  </div>
                </div>

                {/* Column 2: Dynamically added Options */}
                <div className="space-y-5 bg-[#09090b] p-5 border border-[#27272a] rounded-xl">
                  <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#a1a1aa]">Alternative Paths ({options.length})</span>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Option
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                    {options.map((opt, idx) => (
                      <div key={idx} className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-3 relative group">
                        
                        {/* Remove Option Button */}
                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="absolute top-3 right-3 text-[#71717a] hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <div>
                          <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1 font-bold">Option {String.fromCharCode(65 + idx)} Title</label>
                          <input
                            type="text"
                            required
                            value={opt.title}
                            onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                            placeholder="e.g. Accept Full-Time position"
                            className="w-full px-3 py-1.5 text-xs bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1 font-bold">Description / Tradeoffs</label>
                          <textarea
                            value={opt.description}
                            onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                            placeholder="Describe what occurs if you take this path."
                            rows={2}
                            className="w-full px-3 py-1.5 text-xs bg-[#09090b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                          />
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t border-[#27272a]">
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-[#fafafa]/90 shadow-lg transition-all cursor-pointer"
                >
                  Analyze & Reason With Atlas AI
                </button>
              </div>
            </form>
          ) : (
            
            // RENDERING SELECTION DETAILS & DECISION RESULTS
            selectedDecision ? (
              <div className="space-y-6">
                
                {/* Top overview card */}
                <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[10px] bg-[#09090b] border border-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded uppercase font-mono font-bold tracking-wider">
                          {selectedDecision.category}
                        </span>
                        <span className="text-[10px] bg-[#09090b] border border-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded font-mono font-bold">
                          Importance: {selectedDecision.importance}/10
                        </span>
                        <span className="text-[#27272a] font-mono text-xs">•</span>
                        <span className="text-[10px] text-[#71717a] font-mono">Created: {new Date(selectedDecision.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-display text-white mt-1">{selectedDecision.title}</h3>
                    </div>

                    <button
                      onClick={() => handleDeleteDecision(selectedDecision.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#09090b] border border-[#27272a] hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-500/20 text-[#a1a1aa] text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Analysis
                    </button>
                  </div>

                  <p className="text-sm text-[#a1a1aa] leading-relaxed bg-[#09090b] p-4 rounded-xl border border-[#27272a]">{selectedDecision.description}</p>
                </div>

                {/* ANALYTICAL REPORT WRAPPER */}
                {selectedDecision.analysis ? (
                  <div className="space-y-6">
                    
                    {/* Executive Summary & Confidence Gauge */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      
                      {/* confidence Gauge */}
                      <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-white" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#71717a] mb-3">AI Confidence</span>
                        <div className="relative flex items-center justify-center">
                          {/* Circle Progress bar */}
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#09090b" strokeWidth="6" fill="transparent" />
                            <circle cx="48" cy="48" r="40" stroke="#fafafa" strokeWidth="6" fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - selectedDecision.analysis.confidenceScore / 100)}`}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="absolute text-xl font-bold font-mono text-white">{selectedDecision.analysis.confidenceScore}%</span>
                        </div>
                        <span className="text-[10px] text-[#71717a] font-mono uppercase tracking-widest mt-4">Confidence Index</span>
                      </div>

                      {/* Executive Summary text */}
                      <div className="md:col-span-3 p-6 bg-[#18181b] border border-[#27272a] rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                          <Compass className="w-24 h-24 text-white" />
                        </div>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          Executive Evaluation Summary
                        </h4>
                        <p className="text-sm text-[#a1a1aa] leading-relaxed font-sans">{selectedDecision.analysis.summary}</p>
                      </div>

                    </div>

                    {/* Dynamic Path Options Comparison */}
                    <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#71717a] mb-4 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#71717a]" />
                        Option-by-Option Comparative Pros & Cons
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedDecision.analysis.prosAndCons.map((poc, idx) => {
                          // Find corresponding option if saved
                          const savedOpt = selectedDecision.options.find(o => o.title.toLowerCase() === poc.optionTitle.toLowerCase() || o.title.toLowerCase().includes(poc.optionTitle.toLowerCase()));
                          const isOptionSelected = savedOpt?.isSelected;
                          
                          return (
                            <div 
                              key={idx} 
                              className={`p-5 rounded-xl border relative flex flex-col justify-between ${
                                isOptionSelected 
                                  ? 'bg-white/[0.03] border-white/40' 
                                  : 'bg-[#09090b]/40 border-[#27272a]'
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-start gap-4 mb-3 border-b border-[#27272a] pb-2.5">
                                  <h5 className="text-sm font-bold text-white">{poc.optionTitle}</h5>
                                  
                                  {/* Select this option Button */}
                                  {savedOpt && (
                                    selectedDecision.status !== 'DECIDED' ? (
                                      <button
                                        onClick={() => handleSelectOptionChoice(selectedDecision.id, savedOpt.id)}
                                        className="text-[10px] font-bold px-2 py-1 bg-white text-black rounded hover:bg-[#fafafa]/90 transition-colors cursor-pointer"
                                      >
                                        Choose Path
                                      </button>
                                    ) : (
                                      isOptionSelected && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold font-mono bg-white text-black px-2 py-0.5 rounded">
                                          <Check className="w-3 h-3" />
                                          Selected Choice
                                        </span>
                                      )
                                    )
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <span className="block text-[10px] font-mono font-bold uppercase text-emerald-400">Pros</span>
                                    <ul className="space-y-1">
                                      {poc.pros.map((p, i) => (
                                        <li key={i} className="text-xs text-[#a1a1aa] leading-snug flex items-start gap-1.5">
                                          <span className="text-emerald-500 text-[10px] mt-0.5">•</span>
                                          {p}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="space-y-1.5">
                                    <span className="block text-[10px] font-mono font-bold uppercase text-rose-400">Cons</span>
                                    <ul className="space-y-1">
                                      {poc.cons.map((c, i) => (
                                        <li key={i} className="text-xs text-[#a1a1aa] leading-snug flex items-start gap-1.5">
                                          <span className="text-rose-400 text-[10px] mt-0.5">•</span>
                                          {c}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Strategic Impact columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Short Term Impact */}
                      <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717a] mb-2">Short-Term Strategic Impact (1-90 Days)</span>
                        <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedDecision.analysis.shortTermImpact}</p>
                      </div>

                      {/* Long Term Impact */}
                      <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white mb-2">Long-Term Lifespan Alignment (1-5 Years)</span>
                        <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedDecision.analysis.longTermImpact}</p>
                      </div>

                    </div>

                    {/* Risks, Opportunity Cost & Biases */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Opportunity Cost */}
                      <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717a]">Opportunity Cost</span>
                        </div>
                        <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedDecision.analysis.opportunityCost}</p>
                      </div>

                      {/* Potential Risks */}
                      <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717a]">Potential Vulnerabilities</span>
                        </div>
                        <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedDecision.analysis.potentialRisks}</p>
                      </div>

                      {/* Cognitive Biases Detected */}
                      <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Bookmark className="w-4 h-4 text-white" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717a]">Sub-conscious Cognitive Biases</span>
                        </div>
                        <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedDecision.analysis.cognitiveBiases}</p>
                      </div>

                    </div>

                    {/* Challenge Questions & Alternative Option */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Questions Not Considered */}
                      <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl space-y-3">
                        <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717a] flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Paradigm Challenge Questions
                        </span>
                        
                        {selectedDecision.analysis.questionsNotConsidered && selectedDecision.analysis.questionsNotConsidered.length > 0 ? (
                          <ul className="space-y-2">
                            {selectedDecision.analysis.questionsNotConsidered.map((q, idx) => (
                              <li key={idx} className="text-xs text-[#a1a1aa] leading-relaxed flex items-start gap-2.5 bg-[#09090b]/50 p-2.5 rounded-lg border border-[#27272a]">
                                <span className="font-mono font-bold text-white">0{idx + 1}.</span>
                                <span className="italic">"{q}"</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-[#71717a] italic">No alternative challenge parameters mapped.</p>
                        )}
                      </div>

                      {/* Alternative solution */}
                      <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl">
                        <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white mb-2">Out-Of-The-Box Alternative Solution</span>
                        <p className="text-xs text-[#a1a1aa] leading-relaxed bg-[#09090b]/50 p-3 rounded-lg border border-[#27272a]">{selectedDecision.analysis.alternativeSolutions}</p>
                      </div>

                    </div>

                    {/* Final Recommendation */}
                    <div className="p-6 bg-gradient-to-br from-[#18181b] to-[#09090b] border border-[#27272a] rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Sparkles className="w-24 h-24 text-white" />
                      </div>
                      
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Final Strategic Life Recommendation
                      </h4>
                      <h3 className="text-lg font-bold font-display text-white mb-2">{selectedDecision.analysis.recommendation}</h3>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed border-t border-[#27272a] pt-3">{selectedDecision.analysis.reasoning}</p>
                    </div>

                  </div>
                ) : (
                  <div className="py-12 text-center text-[#71717a]">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Calculating analysis results...</p>
                  </div>
                )}

              </div>
            ) : (
              <div className="py-12 text-center text-[#71717a] border border-dashed border-[#27272a] rounded-xl">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Please select a decision analysis from the left panel, or trigger a new analysis.</p>
              </div>
            )

          )}

        </div>

      </div>

    </div>
  );
};
