import React from 'react';
import { Home, TrendingUp, ShieldCheck, Code2, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'split' | 'yield' | 'inspector';
  onSelectTab: (tab: 'home' | 'split' | 'yield' | 'inspector') => void;
  onOpenCreate: () => void;
  userRole?: 'landlord' | 'tenant';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreate,
  userRole = 'landlord',
}) => {
  const isTenant = userRole === 'tenant';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:pb-4 flex justify-center pointer-events-none">
      <nav aria-label="Main Navigation" className="w-full max-w-sm bg-slate-900/90 text-slate-300 border border-slate-800/80 rounded-[28px] px-5 py-2.5 flex items-center justify-between shadow-2xl shadow-black/50 pointer-events-auto backdrop-blur-xl">
        {/* Tab 1: Home Dashboard */}
        <button
          onClick={() => onSelectTab('home')}
          className={`p-2 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-emerald-400 scale-105 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isTenant ? "My Apartment" : "Dashboard"}
        >
          <Home className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Tab 2: Security Deposit Vault */}
        <button
          onClick={() => onSelectTab('split')}
          className={`p-2 rounded-xl transition-all ${
            activeTab === 'split'
              ? 'text-emerald-400 scale-105 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isTenant ? "Escrow Vault & Receipt" : "Deposit Vault"}
        >
          <ShieldCheck className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Center Button: Add New Lease Vault (Only shown for Landlords) */}
        {!isTenant && (
          <button
            onClick={onOpenCreate}
            className="w-11 h-11 -my-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
            title="Create New Lease Vault"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}

        {/* Tab 3: Yield Tracker */}
        <button
          onClick={() => onSelectTab('yield')}
          className={`p-2 rounded-xl transition-all ${
            activeTab === 'yield'
              ? 'text-emerald-400 scale-105 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isTenant ? "My 80% Yield" : "Yield Portfolio"}
        >
          <TrendingUp className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Tab 4: Pollar SDK Inspector */}
        <button
          onClick={() => onSelectTab('inspector')}
          className={`p-2 rounded-xl transition-all ${
            activeTab === 'inspector'
              ? 'text-indigo-400 scale-105 font-bold bg-indigo-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Pollar SDK Inspector"
        >
          <Code2 className="w-5 h-5 stroke-[2]" />
        </button>
      </nav>
    </div>
  );
};