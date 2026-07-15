import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Brain, 
  Target, 
  BookOpen, 
  AlertTriangle,
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useAuth } from './AuthContext.tsx';
import { InsightsData } from '../types.ts';

export const InsightsView: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) return;
    fetchInsights();
  }, [token]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const payload = await response.json();
        setData(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper mapping qualitative states to integers for visualization
  const mapMoodToValue = (m: string): number => {
    switch (m.trim()) {
      case 'Inspired': return 5;
      case 'Clear': return 5;
      case 'Balanced': return 3.5;
      case 'Neutral': return 3;
      case 'Anxious': return 1.5;
      case 'Fatigued': return 1.5;
      case 'Overwhelmed': return 1;
      default: return 3;
    }
  };

  const mapEnergyToValue = (e: string): number => {
    switch (e.trim()) {
      case 'High': return 5;
      case 'Medium': return 3;
      case 'Low': return 1;
      default: return 3;
    }
  };

  const mapStressToValue = (s: string): number => {
    switch (s.trim()) {
      case 'High': return 5;
      case 'Medium': return 3;
      case 'Low': return 1;
      default: return 1;
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <p className="text-xs text-[#71717a] font-mono uppercase tracking-widest">Reviewing personal patterns...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-[#71717a] max-w-2xl mx-auto mt-12 bg-[#18181b] border border-[#27272a] rounded-2xl">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30 text-white" />
        <p className="text-sm">No analytics metrics compiled yet. Log several days of journal entries and analyze a decision to generate intelligence trends.</p>
      </div>
    );
  }

  // Formatting Charts Datasets
  const formattedMoodTrends = data.moodTrends.map(item => ({
    date: item.date.slice(5), // MM-DD
    Mood: mapMoodToValue(item.mood),
    Energy: mapEnergyToValue(item.energy),
    Stress: mapStressToValue(item.stress),
    rawMood: item.mood,
    rawEnergy: item.energy,
    rawStress: item.stress,
  }));

  const formattedCategories = Object.entries(data.decisionCategories).map(([name, value]) => ({
    name,
    value
  }));

  const formattedBiases = Object.entries(data.cognitiveBiases).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[#fafafa] font-sans">
      
      {/* Header */}
      <div className="border-b border-[#27272a] pb-6">
        <h2 className="text-2xl md:text-3xl font-light font-display tracking-tight text-white">Insights & Personal Patterns</h2>
        <p className="text-sm text-[#a1a1aa] mt-1.5 leading-relaxed">
          Observe your trends, trace emotional rhythms, and understand how to refine your daily decision parameters.
        </p>
      </div>

      {/* METRIC COUNTER GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-white" />
          <div className="flex items-center gap-3 text-[#71717a] mb-2">
            <Brain className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Decisions Mapped</span>
          </div>
          <p className="text-2xl font-bold font-display text-white">{data.decisionsCount}</p>
          <span className="text-[10px] text-[#71717a] font-mono mt-1 block">Rigorously Analyzed</span>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#a1a1aa]" />
          <div className="flex items-center gap-3 text-[#71717a] mb-2">
            <BookOpen className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Reflection Days</span>
          </div>
          <p className="text-2xl font-bold font-display text-white">{data.journalEntriesCount}</p>
          <span className="text-[10px] text-[#71717a] font-mono mt-1 block">Lessons logged</span>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#71717a]" />
          <div className="flex items-center gap-3 text-[#71717a] mb-2">
            <Target className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Avg Goal Progress</span>
          </div>
          <p className="text-2xl font-bold font-display text-white">{data.goalProgress.avgProgress}%</p>
          <span className="text-[10px] text-[#71717a] font-mono mt-1 block">Across {data.goalProgress.total} active goals</span>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#52525b]" />
          <div className="flex items-center gap-3 text-[#71717a] mb-2">
            <AlertTriangle className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Tracked Blindspots</span>
          </div>
          <p className="text-2xl font-bold font-display text-white">
            {Object.keys(data.cognitiveBiases).length}
          </p>
          <span className="text-[10px] text-[#71717a] font-mono mt-1 block">Subconscious biases mapped</span>
        </div>

      </div>

      {/* LINE CHART: EMOTIONAL & FOCUS TRENDS */}
      <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-white animate-pulse" />
          <h3 className="text-md font-bold font-display text-white">Emotional, Energy & Stress Trends</h3>
        </div>

        {formattedMoodTrends.length === 0 ? (
          <div className="py-12 text-center text-[#71717a] italic text-xs">
            Log several consecutive journal entries to generate timeline analytics.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedMoodTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} fontClassName="font-mono" />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#71717a" fontSize={11} fontClassName="font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#fafafa', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="Mood" stroke="#ffffff" strokeWidth={2.5} activeDot={{ r: 6 }} name="Mood level" />
                <Line type="monotone" dataKey="Energy" stroke="#a1a1aa" strokeWidth={2} name="Energy level" />
                <Line type="monotone" dataKey="Stress" stroke="#71717a" strokeWidth={1.5} strokeDasharray="5 5" name="Stress scale" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex items-center gap-6 justify-center flex-wrap pt-2 border-t border-[#27272a] text-[10px] font-mono text-[#71717a] uppercase">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-white rounded-full" /> Mood peak</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#a1a1aa] rounded-full" /> Energy Reserves</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-dashed border-[#71717a] rounded-full" /> Stress Level</div>
        </div>
      </div>

      {/* LOWER CHARTS: CATEGORIES & BIASES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Decision Categories Pie Chart */}
        <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl space-y-4">
          <h3 className="text-md font-bold font-display text-white">Decision Distribution by Category</h3>
          
          {formattedCategories.length === 0 ? (
            <p className="py-12 text-center text-xs text-[#71717a] italic">No decision data logs registered.</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-56 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formattedCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {formattedCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#fafafa', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2">
                {formattedCategories.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-[#a1a1aa]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-semibold text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cognitive Biases Mapped */}
        <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-2xl space-y-4">
          <h3 className="text-md font-bold font-display text-white">Subconscious Cognitive Bias Frequency</h3>
          
          {formattedBiases.length === 0 ? (
            <p className="py-12 text-center text-xs text-[#71717a] italic">No decision evaluations generated yet.</p>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedBiases} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={10} fontClassName="font-mono" />
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} fontClassName="font-mono" width={110} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#fafafa', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" fill="#ffffff" radius={[0, 4, 4, 0]}>
                    {formattedBiases.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#ffffff" fillOpacity={0.8 - (index * 0.1)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
