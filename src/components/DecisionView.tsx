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
  X,
  AlertTriangle,
  Lightbulb,
  CornerDownRight
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [immediateConflict, setImmediateConflict] = useState<string>('');
  const [fears, setFears] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [category, setCategory] = useState<string>('Career');
  const [importance, setImportance] = useState<number>(5);
  const [mood, setMood] = useState<string>('Clear');
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
    if (!title.trim() || !immediateConflict.trim()) {
      showToast('Please fill in the title and the immediate conflict.', 'error');
      return;
    }
    setAnalyzing(true);
    setIsModalOpen(false);
    showToast('Atlas is evaluating decision paths...', 'loading');

    // Combine conflict, fears, and context into description to feed backend cleanly
    const combinedDescription = `Immediate Conflict: ${immediateConflict}\n\nFears: ${fears}\n\nContext: ${context}`;

    try {
      const response = await fetch('/api/decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description: combinedDescription,
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
        setImmediateConflict('');
        setFears('');
        setContext('');
        setImportance(5);
        setNotes('');
        setOptions([
          { title: 'Option A', description: '' },
          { title: 'Option B', description: '' }
        ]);

        showToast('Decision paths evaluated.', 'success');
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
        showToast('Choice path finalized.', 'success');
        await fetchDecisions();
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
        const remaining = decisions.filter(d => d.id !== id);
        setDecisions(remaining);
        setSelectedDecision(remaining.length > 0 ? remaining[0] : null);
        showToast('Decision analysis deleted.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Safe description parsing helper
  const parseDescription = (desc: string) => {
    let conflict = '';
    let fearsText = '';
    let mainContext = desc || '';

    if (desc && desc.includes('Immediate Conflict:') && desc.includes('Fears:')) {
      try {
        const conflictIndex = desc.indexOf('Immediate Conflict:');
        const fearsIndex = desc.indexOf('Fears:');
        const contextIndex = desc.indexOf('Context:');
        
        conflict = desc.substring(conflictIndex + 'Immediate Conflict:'.length, fearsIndex).trim();
        fearsText = desc.substring(fearsIndex + 'Fears:'.length, contextIndex !== -1 ? contextIndex : desc.length).trim();
        if (contextIndex !== -1) {
          mainContext = desc.substring(contextIndex + 'Context:'.length).trim();
        } else {
          mainContext = '';
        }
      } catch (e) {
        // Fallback
      }
    }
    return { conflict, fears: fearsText, mainContext };
  };

  return (
    <div className="p-6 md:p-12 space-y-10 max-w-7xl mx-auto text-[#fafafa] font-sans selection:bg-white selection:text-black">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1c1c1e] pb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-light font-display tracking-tight text-white">Decision Recommendation Center</h2>
          <p className="text-sm text-[#71717a] mt-1.5 leading-relaxed">
            Deconstruct complex dilemmas, expose hidden biases, and evaluate pathways with your wiser future self.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold bg-white text-black rounded-xl hover:bg-[#fafafa]/90 transition-all cursor-pointer shadow-md uppercase font-mono tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4" />
          Initiate Decision Evaluation
        </button>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Left column: Decision Registry List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest font-mono">Decision Registry</h3>
          
          {decisions.length === 0 ? (
            <p className="text-xs text-[#71717a] italic p-4 bg-[#09090b]/50 border border-[#1c1c1e] rounded-xl">
              No historical decisions recorded.
            </p>
          ) : (
            <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
              {decisions.map((dec) => (
                <button
                  key={dec.id}
                  onClick={() => setSelectedDecision(dec)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedDecision?.id === dec.id
                      ? 'bg-[#18181b] border-white text-white font-medium shadow-md'
                      : 'bg-[#09090b]/30 border-[#1c1c1e] text-[#a1a1aa] hover:border-[#27272a]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 mb-1.5">
                    <h4 className="text-xs font-semibold truncate flex-1 leading-tight">{dec.title}</h4>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold font-mono tracking-wider shrink-0 ${
                      dec.status === 'DECIDED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-[#18181b] text-[#71717a] border border-[#27272a]'
                    }`}>
                      {dec.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717a] truncate leading-normal">
                    {parseDescription(dec.description).conflict || dec.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Main Workspace Panel */}
        <div className="lg:col-span-3 min-h-[50vh]">
          
          {/* SKELETON ANALYZING LOADER */}
          {analyzing ? (
            <div className="p-8 bg-[#09090b] border border-[#1c1c1e] rounded-2xl flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-light font-display text-white">Consulting your wiser future self...</h3>
                <p className="text-xs text-[#71717a] leading-relaxed">
                  Atlas is aligning decision options with your personal identity blueprint, modeling opportunity costs, and uncovering sub-conscious cognitive filters.
                </p>
              </div>
            </div>
          ) : selectedDecision ? (
            
            // RENDERING SELECTION DETAILS & DECISION RESULTS
            <div className="space-y-8">
              
              {/* Decision Overview Card */}
              <div className="p-6 bg-[#09090b] border border-[#1c1c1e] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-[#1c1c1e]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] bg-[#1c1c1e] text-[#a1a1aa] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                        {selectedDecision.category}
                      </span>
                      <span className="text-[9px] bg-[#1c1c1e] text-[#a1a1aa] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                        Importance: {selectedDecision.importance}/10
                      </span>
                      <span className="text-[10px] text-[#71717a] font-mono ml-1">
                        Logged: {new Date(selectedDecision.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium font-display text-white mt-1">{selectedDecision.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteDecision(selectedDecision.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1e] border border-[#27272a] hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/30 text-[#a1a1aa] text-[10px] font-mono rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Evaluation
                  </button>
                </div>

                {/* Subsections for parseable Description (Conflict, Fears, Context) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-[#71717a] font-mono uppercase tracking-widest font-bold block">Immediate Conflict</span>
                    <p className="text-xs text-[#e4e4e7] leading-relaxed italic">
                      "{parseDescription(selectedDecision.description).conflict || selectedDecision.description}"
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-[#71717a] font-mono uppercase tracking-widest font-bold block">Fears & Obstacles</span>
                    <p className="text-xs text-[#e4e4e7] leading-relaxed">
                      {parseDescription(selectedDecision.description).fears || <span className="text-[#52525b] italic">No active fears recorded.</span>}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-[#71717a] font-mono uppercase tracking-widest font-bold block">Detailed Context</span>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">
                      {parseDescription(selectedDecision.description).mainContext || <span className="text-[#52525b] italic">No additional context.</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* ANALYTICAL REPORT WRAPPER */}
              {selectedDecision.analysis ? (
                <div className="space-y-8">
                  
                  {/* Executive Summary & Confidence */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    
                    {/* Confidence gauge */}
                    <div className="p-6 bg-[#09090b] border border-[#1c1c1e] rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-white" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#71717a] mb-3">AI Confidence</span>
                      <div className="relative flex items-center justify-center">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="34" stroke="#18181b" strokeWidth="4" fill="transparent" />
                          <circle cx="40" cy="40" r="34" stroke="#fafafa" strokeWidth="4" fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - selectedDecision.analysis.confidenceScore / 100)}`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <span className="absolute text-sm font-bold font-mono text-white">{selectedDecision.analysis.confidenceScore}%</span>
                      </div>
                      <span className="text-[9px] text-[#71717a] font-mono uppercase tracking-widest mt-4">Wiser alignment</span>
                    </div>

                    {/* Executive Summary */}
                    <div className="md:col-span-3 p-6 bg-[#09090b] border border-[#1c1c1e] rounded-2xl relative overflow-hidden">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#71717a] mb-2.5 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        Executive Evaluation Summary
                      </h4>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed font-sans">{selectedDecision.analysis.summary}</p>
                    </div>

                  </div>

                  {/* Comparative Path Options */}
                  <div className="p-6 bg-[#09090b] border border-[#1c1c1e] rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#71717a] flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#71717a]" />
                      Option-by-Option Comparative Pros & Cons
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedDecision.analysis.prosAndCons.map((poc, idx) => {
                        const savedOpt = selectedDecision.options.find(o => o.title.toLowerCase() === poc.optionTitle.toLowerCase() || o.title.toLowerCase().includes(poc.optionTitle.toLowerCase()));
                        const isOptionSelected = savedOpt?.isSelected;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`p-5 rounded-xl border relative flex flex-col justify-between transition-all ${
                              isOptionSelected 
                                ? 'bg-white/[0.02] border-white/40 shadow-sm' 
                                : 'bg-[#18181b]/20 border-[#1c1c1e] hover:border-[#27272a]'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start gap-4 mb-3 border-b border-[#1c1c1e] pb-2.5">
                                <h5 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                                  <CornerDownRight className="w-3.5 h-3.5 text-[#71717a]" />
                                  {poc.optionTitle}
                                </h5>
                                
                                {savedOpt && (
                                  selectedDecision.status !== 'DECIDED' ? (
                                    <button
                                      onClick={() => handleSelectOptionChoice(selectedDecision.id, savedOpt.id)}
                                      className="text-[9px] font-bold px-2 py-1 bg-white text-black rounded hover:bg-[#fafafa]/90 transition-colors cursor-pointer uppercase font-mono tracking-wider"
                                    >
                                      Choose Path
                                    </button>
                                  ) : (
                                    isOptionSelected && (
                                      <span className="flex items-center gap-1 text-[8px] font-bold font-mono bg-white text-black px-2 py-0.5 rounded uppercase tracking-wider">
                                        <Check className="w-2.5 h-2.5" />
                                        Selected Choice
                                      </span>
                                    )
                                  )
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <span className="block text-[9px] font-mono font-bold uppercase text-emerald-400">Pros</span>
                                  <ul className="space-y-1">
                                    {poc.pros.map((p, i) => (
                                      <li key={i} className="text-[11px] text-[#a1a1aa] leading-relaxed flex items-start gap-1.5">
                                        <span className="text-emerald-500 text-[10px] mt-0.5">•</span>
                                        {p}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="space-y-1.5">
                                  <span className="block text-[9px] font-mono font-bold uppercase text-rose-400">Cons</span>
                                  <ul className="space-y-1">
                                    {poc.cons.map((c, i) => (
                                      <li key={i} className="text-[11px] text-[#a1a1aa] leading-relaxed flex items-start gap-1.5">
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

                  {/* Impact Columns (Short vs Long Term) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-2xl">
                      <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#71717a] mb-2">Short-Term Strategic Impact (1-90 Days)</span>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedDecision.analysis.shortTermImpact}</p>
                    </div>

                    <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-2xl">
                      <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#71717a] mb-2">Long-Term Lifespan Alignment (1-5 Years)</span>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedDecision.analysis.longTermImpact}</p>
                    </div>
                  </div>

                  {/* Risks & Cognitive Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Vulnerabilities */}
                    <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#71717a]">Potential Vulnerabilities & Risks</span>
                      </div>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedDecision.analysis.potentialRisks}</p>
                    </div>

                    {/* Cognitive Biases Detected */}
                    <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Bookmark className="w-4 h-4 text-[#a1a1aa]" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#71717a]">Sub-conscious Cognitive Biases</span>
                      </div>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedDecision.analysis.cognitiveBiases}</p>
                    </div>

                  </div>

                  {/* Deep Paradigm Challenge Questions */}
                  <div className="p-5 bg-[#09090b] border border-[#1c1c1e] rounded-2xl space-y-3">
                    <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#71717a] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Paradigm Challenge Questions
                    </span>
                    
                    {selectedDecision.analysis.questionsNotConsidered && selectedDecision.analysis.questionsNotConsidered.length > 0 ? (
                      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedDecision.analysis.questionsNotConsidered.map((q, idx) => (
                          <li key={idx} className="text-xs text-[#a1a1aa] leading-relaxed flex items-start gap-2.5 bg-[#18181b]/30 p-3 rounded-lg border border-[#1c1c1e]">
                            <span className="font-mono font-bold text-white text-[10px]">0{idx + 1}.</span>
                            <span className="italic">"{q}"</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#71717a] italic">No challenge parameters mapped.</p>
                    )}
                  </div>

                  {/* PREMIUM RECOMMENDATION CONTAINER WITH THE UPDATED STRUCTURE */}
                  <div className="p-6 bg-gradient-to-br from-[#18181b] to-[#09090b] border border-white/20 rounded-2xl relative overflow-hidden space-y-6">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                      <Sparkles className="w-40 h-40 text-white" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-white pb-3 border-b border-[#27272a]">
                      <Sparkles className="w-4.5 h-4.5 text-white" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Decision Recommendation & Tradeoffs</span>
                    </div>

                    <div className="space-y-4">
                      {/* Main Recommended Route */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold tracking-wider">Recommended Pathway</span>
                        <h3 className="text-lg font-bold font-display text-white leading-snug">
                          {selectedDecision.analysis.recommendation}
                        </h3>
                      </div>

                      {/* Mentor Reasoning */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[9px] font-mono uppercase text-[#71717a] font-bold tracking-wider block">Mentor Reasoning & Insight</span>
                        <p className="text-xs text-[#a1a1aa] leading-relaxed font-sans bg-[#09090b]/40 p-3.5 rounded-xl border border-[#27272a]">
                          {selectedDecision.analysis.reasoning}
                        </p>
                      </div>

                      {/* Opportunity Cost & Alternative Solution row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-900/30">
                          <span className="flex items-center gap-1 text-[9px] font-mono uppercase text-amber-500 font-bold tracking-wider mb-1">
                            <Flame className="w-3 h-3 text-amber-500" />
                            Opportunity Cost
                          </span>
                          <p className="text-xs text-[#a1a1aa] leading-relaxed">
                            {selectedDecision.analysis.opportunityCost}
                          </p>
                        </div>

                        <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-900/30">
                          <span className="flex items-center gap-1 text-[9px] font-mono uppercase text-blue-400 font-bold tracking-wider mb-1">
                            <Lightbulb className="w-3 h-3 text-blue-400" />
                            Alternative Path Choice
                          </span>
                          <p className="text-xs text-[#a1a1aa] leading-relaxed">
                            {selectedDecision.analysis.alternativeSolutions}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-12 text-center text-[#71717a]">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-xs uppercase tracking-wider font-mono">Calculating insights...</p>
                </div>
              )}

            </div>
          ) : (
            
            // THE REQUESTED CUSTOM EMPTY STATE WITH BRANCHING PATH ILLUSTRATION
            <div className="py-16 px-6 text-center border border-dashed border-[#1c1c1e] rounded-2xl flex flex-col items-center justify-center min-h-[50vh] space-y-6">
              
              {/* Custom Branching Paths CSS/SVG Illustration */}
              <div className="w-24 h-24 relative flex items-center justify-center bg-[#09090b] rounded-full border border-[#1c1c1e]">
                <svg className="w-14 h-14 text-[#71717a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V12" />
                  <path d="M12 12C12 9.5 9.5 7 6 7" />
                  <path d="M12 12C12 9.5 14.5 7 18 7" />
                  <path d="M6 7V2" />
                  <path d="M18 7V2" />
                  <circle cx="6" cy="2" r="1.5" className="fill-current text-[#71717a]" />
                  <circle cx="18" cy="2" r="1.5" className="fill-current text-[#71717a]" />
                  <circle cx="12" cy="22" r="1.5" className="fill-current text-[#71717a]" />
                </svg>
              </div>

              <div className="space-y-2 max-w-sm">
                <h3 className="text-md font-semibold text-white">No Decision Selected</h3>
                <p className="text-xs text-[#71717a] leading-relaxed">
                  "The best way to make a hard choice is to bring it to your wiser future self." Select a dilemma from the registry or begin evaluating a new choice path.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-xs font-bold bg-white text-black hover:bg-[#fafafa]/90 rounded-xl transition-all cursor-pointer uppercase font-mono tracking-wider shadow-sm"
              >
                Initiate Decision Evaluation
              </button>
            </div>
          )}

        </div>

      </div>

      {/* EVALUATION MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#09090b] border border-[#27272a] rounded-2xl overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1c1c1e] pb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light font-display text-white">Initiate Decision Evaluation</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#71717a] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitDecision} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Core Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1.5 font-bold">Decision Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Accept Full-Time TechCorp position"
                      className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1.5 font-bold">Immediate Conflict</label>
                    <textarea
                      required
                      value={immediateConflict}
                      onChange={(e) => setImmediateConflict(e.target.value)}
                      placeholder="What is the active clash? e.g. 'Should I accept job or freelance?'"
                      rows={2.5}
                      className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1.5 font-bold">Fears & Blockers</label>
                    <textarea
                      value={fears}
                      onChange={(e) => setFears(e.target.value)}
                      placeholder="What are you afraid of losing? What worst-case scenarios stall you?"
                      rows={2.5}
                      className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1.5 font-bold">Detailed Context & Nuance</label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Supplementary metadata, other options context, pressure points..."
                      rows={2.5}
                      className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1.5 font-bold">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                      >
                        {['Career', 'Finance', 'Lifestyle', 'Relationship', 'Health', 'General'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1.5 font-bold">Importance (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={importance}
                        onChange={(e) => setImportance(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1.5 font-bold">Emotional Mood</label>
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                      >
                        {['Clear', 'Anxious', 'Fatigued', 'Inspired', 'Overwhelmed', 'Neutral'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1.5 font-bold">Energy Level</label>
                      <select
                        value={energy}
                        onChange={(e) => setEnergy(e.target.value)}
                        className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                      >
                        {['High', 'Medium', 'Low'].map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Column 2: Alternative Options paths */}
                <div className="space-y-4 bg-[#18181b]/40 p-4 border border-[#1c1c1e] rounded-xl">
                  <div className="flex items-center justify-between border-b border-[#1c1c1e] pb-2.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#a1a1aa]">Alternative Paths ({options.length})</span>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Option
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {options.map((opt, idx) => (
                      <div key={idx} className="p-4 bg-[#09090b]/50 border border-[#27272a] rounded-xl space-y-3 relative group">
                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="absolute top-3 right-3 text-[#71717a] hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div>
                          <label className="block text-[9px] font-mono text-[#a1a1aa] uppercase mb-1 font-bold">Option {String.fromCharCode(65 + idx)} Title</label>
                          <input
                            type="text"
                            required
                            value={opt.title}
                            onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                            placeholder="e.g. Option title"
                            className="w-full px-2.5 py-1.5 text-xs bg-[#18181b]/50 border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3f3f46]"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono text-[#a1a1aa] uppercase mb-1 font-bold">Tradeoffs / Impact</label>
                          <textarea
                            value={opt.description}
                            onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                            placeholder="What happens if you take this route?"
                            rows={2}
                            className="w-full px-2.5 py-1.5 text-xs bg-[#18181b]/50 border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3f3f46]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Extra inputs row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#1c1c1e] pt-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1">Imminent Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="e.g. Friday 5 PM, or None"
                    className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] placeholder-[#52525b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-1">Time/Energy Available to Decide</label>
                  <input
                    type="text"
                    value={availableTime}
                    onChange={(e) => setAvailableTime(e.target.value)}
                    placeholder="e.g. 2 hours of contemplation"
                    className="w-full px-3 py-2 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-xs text-[#fafafa] placeholder-[#52525b] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1c1c1e]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-xs font-semibold rounded-lg text-white cursor-pointer uppercase font-mono tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-[#fafafa]/90 cursor-pointer uppercase font-mono tracking-wider shadow-sm"
                >
                  Consult Atlas AI
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
