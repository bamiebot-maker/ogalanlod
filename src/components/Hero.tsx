import React from 'react';
import { ArrowUpRight, ShieldCheck, Zap, Coins, Users, Lock, ChevronRight } from 'lucide-react';

interface HeroProps {
  onOpenCreateModal: () => void;
  onSelectSampleVault: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenCreateModal,
  onSelectSampleVault,
}) => {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-[300px] h-[250px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Announcement Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6 shadow-sm shadow-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Built with Pollar SDK for the Boundless Stellar Hackathon</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn Idle Rent Deposits Into{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              High-Yield Escrow
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Traditional landlord deposits sit in zero-interest bank accounts, losing value to inflation while creating dispute nightmares. 
            <strong className="text-slate-200"> OgaLandlord</strong> locks deposits into auto-compounding Stellar DeFi vaults (DeFindex & Blend) with zero crypto jargon and mutual cryptographic release.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Create Lease Vault (10s)</span>
            </button>
            <button
              onClick={onSelectSampleVault}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>⚡ Try Live Vault Demo (6-Mo Yield)</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Feature Badges */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">DeFi Yield</span>
              </div>
              <div className="text-xl font-bold text-white">8.42% APY</div>
              <div className="text-[11px] text-slate-400">Via DeFindex & Blend on Stellar</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Security</span>
              </div>
              <div className="text-xl font-bold text-white">SEP-43 Auth</div>
              <div className="text-[11px] text-slate-400">Mutual dual-sign release</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Onboarding</span>
              </div>
              <div className="text-xl font-bold text-white">Zero Seed Phrase</div>
              <div className="text-[11px] text-slate-400">Google/Email Pollar embedded wallet</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-amber-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Gas Covered</span>
              </div>
              <div className="text-xl font-bold text-white">$0.00 Gas</div>
              <div className="text-[11px] text-slate-400">Pollar sponsored Stellar fee bumps</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

