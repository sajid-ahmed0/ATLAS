import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Compass, Key, ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './components/AuthContext.tsx';
import { Sidebar, ViewType } from './components/Sidebar.tsx';
import { HomeView } from './components/HomeView.tsx';
import { MissionView } from './components/MissionView.tsx';
import { DecisionView } from './components/DecisionView.tsx';
import { JournalView } from './components/JournalView.tsx';
import { KnowledgeView } from './components/KnowledgeView.tsx';
import { InsightsView } from './components/InsightsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { Toast, ToastType } from './components/Toast.tsx';

const OnboardingGate: React.FC<{ onSignIn: () => void; onSignInAsGuest: () => void; loading: boolean }> = ({ onSignIn, onSignInAsGuest, loading }) => {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden font-sans text-[#fafafa]">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-500/5 blur-3xl rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-lg p-8 md:p-10 bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl relative z-10 space-y-8"
      >
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#27272a] border border-[#3f3f46] text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wider font-display text-[#fafafa]">
              ATLAS
            </h1>
            <p className="text-[11px] font-bold text-[#a1a1aa] tracking-widest font-mono uppercase mt-1">
              Personal AI Life Operating System
            </p>
          </div>
          <p className="text-sm text-[#a1a1aa] leading-relaxed max-w-sm">
            Not a chatbot. Not a note-taker. Atlas is your external brain designed for high-integrity strategic decision-making and cognitive calibration.
          </p>
        </div>

        {/* Feature pillars */}
        <div className="space-y-3 pt-2">
          
          <div className="flex gap-3.5 p-3.5 bg-[#09090b] border border-[#27272a] rounded-xl">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] text-white shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold font-display text-[#fafafa]">Decision Center</h3>
              <p className="text-[11px] text-[#71717a] mt-0.5 leading-relaxed">
                Deconstruct choices, map long-term lifespan impact, and isolate cognitive biases.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 p-3.5 bg-[#09090b] border border-[#27272a] rounded-xl">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] text-white shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold font-display text-[#fafafa]">Rigor Reflection Engine</h3>
              <p className="text-[11px] text-[#71717a] mt-0.5 leading-relaxed">
                Align daily objectives every morning and audit behavioral integrity every evening.
              </p>
            </div>
          </div>

        </div>

        {/* Action controls */}
        <div className="pt-2 space-y-3">
          <button
            onClick={onSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white text-black hover:bg-[#fafafa]/90 font-bold text-xs tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-mono"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                />
                Authorizing Identity...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Initialize OS with Google
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center py-1">
            <span className="absolute w-full border-t border-[#27272a]"></span>
            <span className="relative bg-[#18181b] px-3 text-[10px] text-[#71717a] font-mono uppercase tracking-wider">or</span>
          </div>

          <button
            onClick={onSignInAsGuest}
            disabled={loading}
            className="w-full py-3 px-4 bg-transparent hover:bg-[#27272a]/40 text-[#fafafa] border border-[#27272a] hover:border-[#3f3f46] font-bold text-xs tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-mono"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Launch OS in Guest / Demo Mode
          </button>
          
          <p className="text-[10px] text-center text-[#71717a] pt-2 leading-relaxed font-mono uppercase tracking-wider">
            SECURED PERSISTENCE IN PRIVATE REGIONAL DATABASE (ASIA-SOUTHEAST1)
          </p>
        </div>

      </motion.div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { firebaseUser, signIn, signInAsGuest, loading } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Global Toast State
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const triggerToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-[#fafafa] font-mono text-center space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
        <p className="text-xs text-[#71717a] uppercase tracking-widest font-mono">Loading Atlas AI Life OS Core Systems...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <OnboardingGate onSignIn={signIn} onSignInAsGuest={signInAsGuest} loading={loading} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#09090b] text-[#fafafa] relative">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Panel Viewport */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {activeView === 'home' && <HomeView onNavigate={setActiveView} showToast={triggerToast} />}
            {activeView === 'mission' && <MissionView showToast={triggerToast} />}
            {activeView === 'decision' && <DecisionView showToast={triggerToast} />}
            {activeView === 'journal' && <JournalView showToast={triggerToast} />}
            {activeView === 'knowledge' && <KnowledgeView showToast={triggerToast} />}
            {activeView === 'insights' && <InsightsView />}
            {activeView === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Notifications */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
