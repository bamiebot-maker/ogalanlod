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
    <div className="bg-white text-stone-900 rounded-[32px] p-5 shadow-xl border border-stone-200/90 space-y-4 text-left transition-all">
      {/* 1. Header */}
      <div className="flex items-center justify-between pt-1">
        <div 
          onClick={onOpenProfile}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/40 group-hover:scale-105 transition-transform"
          >
          </img>
          <div>
            <h1 className="text-sm font-black text-stone-950 tracking-tight">
              Hi, {user.name.split(' ')[0]}
            </h1>
            <p className="text-[11px] text-stone-500 font-mono">
              Yield Portfolio • <span className="text-orange-600 font-black">{user.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCreate}
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 hover:text-black hover:bg-stone-200 transition-colors"
            title="Create New Lease Vault"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 hover:text-black hover:bg-stone-200 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* 2. Electric Solar Orange Hero Card: Income / Yield Tracker */}
      <div className="rounded-[28px] bg-gradient-to-br from-[#FF5E00] via-[#FF6B00] to-[#E65100] p-5 shadow-xl text-white relative overflow-hidden">
        {/* Subtle patterned texture background overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2 text-white font-bold text-xs tracking-wide">
            <Coins className="w-4 h-4 fill-white" />
            <span>Yield Income Tracker</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black flex items-center gap-1 backdrop-blur-sm">
            <TrendingUp className="w-3 h-3" />
            <span>8.42% APY</span>
          </span>
        </div>

        {/* Balance Amount */}
        <div className="my-2 relative z-10">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
            +${totalAccrued.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-semibold ml-1.5 opacity-90">USDC</span>
          </div>
          <p className="text-[10px] text-white/80 font-medium">
            Total yield distributed across {vaults.length} active lease vaults
          </p>
        </div>

        {/* Bar Chart */}
        <div className="mt-4 pt-1 relative z-10">
          <div className="h-28 flex items-end justify-between gap-2.5 px-1">
            {/* Bar 1: Jan */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-white/30 rounded-xl h-[45%] border border-white/20" />
              <span className="text-[10px] font-bold text-white/80">Jan</span>
            </div>

            {/* Bar 2: Feb */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-white/30 rounded-xl h-[55%] border border-white/20" />
              <span className="text-[10px] font-bold text-white/80">Feb</span>
            </div>

            {/* Bar 3: Mar (Active) */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative">
              <div className="absolute -top-3 px-1.5 py-0.5 rounded-full bg-stone-950 text-white text-[9px] font-black shadow-lg flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                <span>+${totalAccrued.toFixed(0)}</span>
              </div>
              <div className="w-full bg-white rounded-xl h-[85%] shadow-lg shadow-black/20 flex items-center justify-center text-stone-950 font-black">
                <span className="text-[9px] text-orange-600">Peak</span>
              </div>
              <span className="text-[10px] font-black text-white">Mar</span>
            </div>

            {/* Bar 4: Apr */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-white/30 rounded-xl h-[65%] border border-white/20" />
              <span className="text-[10px] font-bold text-white/80">Apr</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Performance Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black text-stone-950 font-mono">+43%</span>
            <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-[10px]">
              ↑
            </div>
          </div>
          <div className="text-[11px] text-stone-500 font-medium">Stellar Yield Growth</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black text-stone-950 font-mono">100%</span>
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
              ✓
            </div>
          </div>
          <div className="text-[11px] text-stone-500 font-medium">Principal Protected</div>
        </div>
      </div>

      {/* 4. Action Card: Create New Lease */}
      <div 
        onClick={onOpenCreate}
        className="p-3.5 rounded-2xl bg-[#18120C] text-white flex items-center justify-between group cursor-pointer hover:bg-stone-900 transition-colors shadow-md"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
            <Building className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
              Deploy New Lease Vault
            </h3>
            <p className="text-[10px] text-stone-400">
              Lock security deposit in Pollar DeFi
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-white transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};