import React from 'react';
import { 
  Home, 
  Target, 
  Brain, 
  BookOpen, 
  Library, 
  TrendingUp, 
  Settings, 
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from './AuthContext.tsx';

export type ViewType = 'home' | 'mission' | 'decision' | 'journal' | 'knowledge' | 'insights' | 'settings';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange,
  isOpen,
  onToggle
}) => {
  const { firebaseUser, signOut } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'mission', label: 'Mission', icon: Target },
    { id: 'decision', label: 'Decision Center', icon: Brain },
    { id: 'journal', label: 'Daily Journal', icon: BookOpen },
    { id: 'knowledge', label: 'Knowledge Base', icon: Library },
    { id: 'insights', label: 'Insights & Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <button 
          onClick={onToggle}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 hover:bg-slate-800"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-30 flex flex-col h-screen w-64 bg-[#09090b] border-r border-[#27272a] text-[#a1a1aa] font-sans transition-transform duration-300 transform md:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#27272a]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-[#09090b]">
            <div className="h-3 w-3 bg-[#09090b] rotate-45"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-white tracking-wider">ATLAS</h1>
            <p className="text-[10px] text-emerald-400 tracking-widest font-mono uppercase">Life OS</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onToggle(); // Close on mobile selection
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 group ${
                  isActive 
                    ? 'bg-[#27272a] text-white font-semibold' 
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]/50'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-[#71717a] group-hover:text-white'
                }`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User profile footer */}
        {firebaseUser && (
          <div className="p-4 border-t border-[#27272a] bg-[#18181b]">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${firebaseUser.email}`} 
                alt="Profile" 
                className="w-9 h-9 rounded-full border border-[#27272a]"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{firebaseUser.displayName || 'Atlas Strategist'}</p>
                <p className="text-[10px] text-[#71717a] truncate font-mono">{firebaseUser.email}</p>
              </div>
            </div>
            
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#a1a1aa] bg-[#27272a]/40 border border-[#27272a] hover:bg-[#27272a] hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
        />
      )}
    </>
  );
};
