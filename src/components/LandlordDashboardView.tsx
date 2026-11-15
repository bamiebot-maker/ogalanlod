import React, { useState } from 'react';
import { 
  Building, Info, Eye, EyeOff, Landmark, 
  Link2, TrendingUp, Download, ArrowRight, Check, Plus
} from 'lucide-react';
import type { LeaseVault, UserProfile } from '../types';
import { getLandlordBankAccount } from '../services/bankService';

interface LandlordDashboardViewProps {
  user: UserProfile;
  vaults: LeaseVault[];
  selectedVault: LeaseVault;
  onSelectVault: (vault: LeaseVault) => void;
  onOpenCreate: () => void;
  onOpenBank: () => void;
  onOpenShare: (vault: LeaseVault) => void;
  onSwitchTab: (tab: 'yield' | 'properties' | 'vault') => void;
  onOpenInspector: () => void;
}

export const LandlordDashboardView: React.FC<LandlordDashboardViewProps> = ({
  user,
  vaults,
  selectedVault,
  onSelectVault,
  onOpenCreate,
  onOpenBank,
  onOpenShare,
  onSwitchTab,
  onOpenInspector,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);

  const savedBank = getLandlordBankAccount();

  // Aggregate stats across all vaults
  const totalLockedUSDC = vaults.reduce((acc, v) => acc + (v.status !== 'awaiting_deposit' ? v.depositAmount : 0), 0);
  const totalAccruedYield = vaults.reduce((acc, v) => acc + (v.accruedYield || 0), 0);
  const activeCount = vaults.filter((v) => v.status === 'earning_yield').length;

  const currentVault = selectedVault || vaults[0];

  const handleExportCSV = () => {
    const csvContent = [
      ['Vault ID', 'Property Name', 'Tenant', 'Deposit (USDC)', 'APY (%)', 'Yield Earned', 'Status'],
      ...vaults.map((v) => [
        v.id,
        v.propertyName,
        v.tenantName,
        v.depositAmount.toFixed(2),
        v.selectedPool.apy,
        (v.accruedYield || 0).toFixed(2),
        v.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ogalandlord_escrow_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-left pb-4 text-white">
      
      {/* 1. TOP PROPERTY SWITCHER (Modeled directly after Image 2) */}
      <div className="flex items-center justify-between pt-1">
        <div 
          onClick={() => setIsSwitchOpen(true)}
          className="flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/90 rounded-2xl px-3 py-2 cursor-pointer transition-all max-w-[80%]"
        >
          <Building className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 truncate">
            {currentVault.propertyName}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold shrink-0">
            Switch ▾
          </span>
        </div>

        <button
          onClick={onOpenInspector}
          className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors"
          title="Pollar SDK & Stellar Explorer Info"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* 2. HERO TOTAL ESCROW CARD (Modeled directly after Image 2: Dark luxury green background) */}
      <div className="bg-gradient-to-br from-[#06241a] via-[#093527] to-[#041912] border border-emerald-500/30 rounded-[28px] p-5 shadow-2xl relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-1.5 text-slate-300 text-xs font-medium">
            <span>Total Settled in Escrow</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1 shadow-sm">
            <span>Protected Escrow ✓</span>
          </div>
        </div>

        {/* Big Bold Balance */}
        <div className="mt-2">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-1.5">
            {showBalance ? (
              <>
                <span>${totalLockedUSDC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-sm font-semibold text-emerald-400 font-sans">USDC</span>
              </>
            ) : (
              <span>••••••••</span>
            )}
          </div>
          <span className="text-[11px] text-emerald-300/80 font-medium block mt-1">
            {showBalance 
              ? `≈ ₦${(totalLockedUSDC * 1500).toLocaleString()} credited directly to Stellar Soroban Escrow`
              : '••••••••••••'}
          </span>
        </div>

        {/* 3. FOUR CIRCULAR QUICK ACTION BUTTONS (Exact Image 2 Layout) */}
        <div className="grid grid-cols-4 gap-2 pt-5 text-center">
          
          {/* Button 1: My Bank */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={onOpenBank}
              className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all"
              title="Connect NUBAN Bank"
            >
              <Landmark className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-slate-200 font-bold">My Bank</span>
          </div>

          {/* Button 2: Share Link */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={() => onOpenShare(currentVault)}
              className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700/80 text-emerald-400 flex items-center justify-center shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
              title="Share Payment Link with Tenant"
            >
              <Link2 className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-slate-200 font-bold">Share Link</span>
          </div>

          {/* Button 3: Live Yield */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={() => onSwitchTab('yield')}
              className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700/80 text-emerald-400 flex items-center justify-center shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
              title="View Yield Portfolio"
            >
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-slate-200 font-bold">Live Yield</span>
          </div>

          {/* Button 4: Export CSV */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={handleExportCSV}
              className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 flex items-center justify-center shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
              title="Export Official Escrow Ledger CSV"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-slate-200 font-bold">Export CSV</span>
          </div>

        </div>
      </div>

      {/* 4. AUTO-OFFRAMP DESTINATION CARD (Exact Image 2 Component) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Auto-Offramp Destination
            </span>
            <span className="text-xs font-bold text-white block">
              {savedBank ? `${savedBank.bankName} • ${savedBank.accountNumber.slice(-4)}` : 'OPay Digital Bank (PayCom) • 7282'}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              Verified: {savedBank?.accountName || user.name}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenBank}
          className="text-xs font-bold text-slate-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
        >
          <span>Change</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 5. METRICS ROW (Side-by-side like Image 2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Active Houses */}
        <div 
          onClick={() => onSwitchTab('properties')}
          className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <span className="text-[10px] font-medium text-slate-400 block">
            Active Properties
          </span>
          <div className="text-lg font-black text-white font-mono mt-1">
            {vaults.length} Units
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">
            {activeCount} Compounding
          </span>
        </div>

        {/* Card 2: Compounding Yield */}
        <div 
          onClick={() => onSwitchTab('yield')}
          className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <span className="text-[10px] font-medium text-slate-400 block">
            Compounding Speed
          </span>
          <div className="text-lg font-black text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <span>Instant</span>
            <span className="text-amber-400">⚡</span>
          </div>
          <span className="text-[10px] text-slate-300 font-semibold mt-0.5 block">
            +${totalAccruedYield.toFixed(2)} Accrued Yield
          </span>
        </div>
      </div>

      {/* 6. QUICK ACTION: DEPLOY NEW HOUSE VAULT */}
      <button
        onClick={onOpenCreate}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-slate-900 to-emerald-500/10 border border-emerald-500/40 hover:border-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-sm transition-all group"
      >
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-emerald-400" />
          <span>Add New House & Deploy Lease Escrow</span>
        </div>
        <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] group-hover:scale-105 transition-transform">
          + Add House
        </span>
      </button>

      {/* 7. REAL-TIME ESCROW & YIELD LEDGER (Exact Image 2 Component) */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
            Real-Time Escrow Ledger
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {vaults.length} vaults
          </span>
        </div>

        <div className="space-y-2">
          {vaults.map((vault) => (
            <div
              key={vault.id}
              onClick={() => onSelectVault(vault)}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-850"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  vault.status === 'earning_yield'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {vault.tenantName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {vault.propertyName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({vault.houseCode})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Tenant: {vault.tenantName} • {vault.selectedPool.name.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <div className="text-xs font-bold font-mono text-white">
                  ${vault.depositAmount.toFixed(2)}
                </div>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                  vault.status === 'earning_yield'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {vault.status === 'earning_yield' ? '✓ Earning Yield' : '⏳ Awaiting Deposit'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. PROPERTY SWITCHER MODAL / BOTTOM SHEET */}
      {isSwitchOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white">Select Property</span>
              <button 
                onClick={() => setIsSwitchOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Done
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {vaults.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    onSelectVault(v);
                    setIsSwitchOpen(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    v.id === currentVault.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-white block truncate max-w-[200px]">
                      {v.propertyName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {v.houseCode} • ${v.depositAmount} USDC
                    </span>
                  </div>
                  {v.id === currentVault.id && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsSwitchOpen(false);
                onOpenCreate();
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New House</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
