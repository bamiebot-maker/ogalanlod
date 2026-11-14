import React from 'react';
import { 
  TrendingUp, Coins, ChevronRight, Bell, UserPlus, Building, Sparkles 
} from 'lucide-react';
import type { LeaseVault, UserProfile } from '../types';
import { calculateYield } from '../services/pollarService';

interface MobileYieldTrackerProps {
  user: UserProfile;
  vaults: LeaseVault[];
  onOpenCreate: () => void;
  onOpenProfile: () => void;
}

export const MobileYieldTracker: React.FC<MobileYieldTrackerProps> = ({
  user,
  vaults,
  onOpenCreate,
  onOpenProfile,
}) => {
  const totalAccrued = vaults.reduce((acc, v) => {
    const y = calculateYield(v.depositAmount, v.selectedPool.apy, v.simulatedMonthsElapsed || 0);
    return acc + y.accrued;
  }, 0);

  return (
    <div className="bg-white text-slate-900 rounded-[32px] p-5 shadow-xl space-y-4 text-left transition-all">
      {/* 1. Header */}
      <div className="flex items-center justify-between pt-1">
        <div 
          onClick={onOpenProfile}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40 group-hover:scale-105 transition-transform"
          />
          <div>
            <h1 className="text-sm font-bold text-slate-950 tracking-tight">
              Hi, {user.name.split(' ')[0]}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">
              Yield Portfolio • <span className="text-emerald-600 font-bold">{user.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCreate}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:text-black hover:bg-slate-200 transition-colors"
            title="Create New Lease Vault"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:text-black hover:bg-slate-200 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* 2. Vibrant Green Hero Card: Income / Yield Tracker */}
      <div className="rounded-[28px] bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] p-5 shadow-xl text-slate-950 relative overflow-hidden">
        {/* Striped texture background overlay */}
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#000,#000_2px,transparent_2px,transparent_8px)] pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2 text-slate-950 font-bold text-xs tracking-wide">
            <Coins className="w-4 h-4 fill-slate-950" />
            <span>Yield Income Tracker</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/20 text-slate-950 text-[10px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>8.42% APY</span>
          </span>
        </div>

        {/* Balance Amount */}
        <div className="my-2 relative z-10">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-950">
            +${totalAccrued.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-semibold ml-1.5 opacity-80">USDC</span>
          </div>
          <p className="text-[10px] text-slate-950/80 font-medium">
            Total yield distributed across {vaults.length} active lease vaults
          </p>
        </div>

        {/* Bar Chart */}
        <div className="mt-4 pt-1 relative z-10">
          <div className="h-28 flex items-end justify-between gap-2.5 px-1">
            {/* Bar 1: Jan */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-slate-950/20 rounded-xl h-[45%] border border-slate-950/10" />
              <span className="text-[10px] font-bold text-slate-950/70">Jan</span>
            </div>

            {/* Bar 2: Feb */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-slate-950/20 rounded-xl h-[55%] border border-slate-950/10" />
              <span className="text-[10px] font-bold text-slate-950/70">Feb</span>
            </div>

            {/* Bar 3: Mar (Active) */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative">
              <div className="absolute -top-3 px-1.5 py-0.5 rounded-full bg-slate-950 text-emerald-400 text-[9px] font-bold shadow-lg flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span>+${totalAccrued.toFixed(0)}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-xl h-[85%] shadow-lg shadow-slate-950/30 flex items-center justify-center text-white">
                <span className="text-[9px] font-bold text-emerald-400">Peak</span>
              </div>
              <span className="text-[10px] font-bold text-slate-950">Mar</span>
            </div>

            {/* Bar 4: Apr */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-slate-950/20 rounded-xl h-[65%] border border-slate-950/10" />
              <span className="text-[10px] font-bold text-slate-950/70">Apr</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Performance Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-950 font-mono">+43%</span>
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
              ↑
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Stellar Yield Growth</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-950 font-mono">100%</span>
            <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-[10px]">
              ✓
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Principal Protected</div>
        </div>
      </div>

      {/* 4. Action Card: Create New Lease */}
      <div 
        onClick={onOpenCreate}
        className="p-3.5 rounded-2xl bg-slate-950 text-white flex items-center justify-between group cursor-pointer hover:bg-slate-900 transition-colors shadow-md"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
              Deploy New Lease Vault
            </h3>
            <p className="text-[10px] text-slate-400">
              Lock security deposit in Pollar DeFi
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};