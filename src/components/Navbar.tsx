import React from 'react';
import { usePollar } from '@pollar/react';
import { Shield, Sparkles, Code2, Wallet, Cloud, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

interface NavbarProps {
  currentRole: 'landlord' | 'tenant';
  setCurrentRole: (role: 'landlord' | 'tenant') => void;
  onOpenTechModal: () => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  onOpenTechModal,
  onOpenCreateModal,
}) => {
  const { wallet, isAuthenticated, openLoginModal, logout } = usePollar();

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Oga<span className="text-emerald-400">Landlord</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Stellar DeFi
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <span>Powered by <strong className="text-slate-300 font-medium">Pollar SDK</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[10px]">
                  {isSupabaseConfigured ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Cloud className="w-3 h-3" /> Supabase Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Database className="w-3 h-3" /> Instant Sync
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Role Switcher & SDK Inspector */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Perspective Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl flex items-center space-x-1 shadow-inner">
              <button
                onClick={() => setCurrentRole('landlord')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentRole === 'landlord'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>👔</span>
                <span>Landlord View</span>
              </button>
              <button
                onClick={() => setCurrentRole('tenant')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentRole === 'tenant'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔑</span>
                <span>Tenant View</span>
              </button>
            </div>

            {/* Tech Inspector Button for Judges */}
            <button
              onClick={onOpenTechModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-all shadow-sm shadow-indigo-500/10"
              title="Inspect Pollar SDK implementation"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pollar SDK Inspector</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {currentRole === 'landlord' && (
              <button
                onClick={onOpenCreateModal}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Lease Vault</span>
              </button>
            )}

            {/* Pollar Wallet Button */}
            {isAuthenticated && wallet ? (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-slate-300">
                  {truncateAddress(wallet.address)}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-[11px] text-slate-400 hover:text-rose-400 ml-1 underline decoration-slate-700"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-all shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connect Pollar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
