import React from 'react';
import { 
  Settings, 
  Database, 
  User, 
  Cpu, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from './AuthContext.tsx';

export const SettingsView: React.FC = () => {
  const { firebaseUser, dbUser } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto text-slate-100 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-900/60 pb-6">
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage system configurations, verify secure cloud connectivity, and audit authorization structures.
        </p>
      </div>

      {/* User Information */}
      <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold font-display text-slate-200 flex items-center gap-2 uppercase font-mono tracking-wider text-slate-400">
          <User className="w-4 h-4 text-emerald-400" />
          Active Strategist Profile
        </h3>

        {firebaseUser ? (
          <div className="flex items-center gap-4 p-4 bg-[#070a11] border border-slate-900 rounded-xl">
            <img 
              src={firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${firebaseUser.email}`} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full border border-slate-800"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-100">{firebaseUser.displayName || 'Atlas User'}</p>
              <p className="text-xs text-slate-500 font-mono">{firebaseUser.email}</p>
              <span className="inline-block text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-mono font-bold">
                OAuth Verified
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No verified strategist identity detected.</p>
        )}
      </div>

      {/* Cloud Infrastructure Statistics */}
      <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold font-display text-slate-200 flex items-center gap-2 uppercase font-mono tracking-wider text-slate-400">
          <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
          Durable Cloud Storage Engine
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-4 bg-[#070a11] border border-slate-900 rounded-xl space-y-2">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Target Cloud SQL Provider</span>
            <p className="text-xs font-semibold text-slate-200">Google Cloud Run & Cloud SQL</p>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
              Engine: PostgreSQL 15 • Serverless scale-to-zero pooled queries
            </p>
          </div>

          <div className="p-4 bg-[#070a11] border border-slate-900 rounded-xl space-y-2">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Primary Target Region</span>
            <p className="text-xs font-semibold text-emerald-400">asia-southeast1 (Singapore)</p>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
              Latency Optimized • Multi-zone high durability persistence
            </p>
          </div>

        </div>

        <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="block text-xs font-bold text-slate-200">Encrypted Transport Active</span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              All transactions between the Atlas client and your private regional PostgreSQL database are authorized using Google Firebase JWT tokens and TLS 1.3 protocol.
            </p>
          </div>
        </div>
      </div>

      {/* AI Systems Integration */}
      <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold font-display text-slate-200 flex items-center gap-2 uppercase font-mono tracking-wider text-slate-400">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Gemini Intelligence Engine
        </h3>

        <div className="p-4 bg-[#070a11] border border-slate-900 rounded-xl space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-900 pb-2">
            <span className="text-xs font-semibold text-slate-200">Target Large Language Model</span>
            <span className="text-[10px] bg-slate-900 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">gemini-2.5-flash</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Atlas invokes Google Gemini via modern server-side APIs to map cognitive biases, calculate opportunity costs, and align daily actions.
          </p>
        </div>
      </div>

      {/* System info credit */}
      <div className="text-center pt-4">
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider">
          Atlas Life OS v1.0.0 • regional infrastructure online
        </p>
      </div>

    </div>
  );
};
