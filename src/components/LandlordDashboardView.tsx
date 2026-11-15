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
  selectedVault: LeaseVault | null;
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

  const currentVault = selectedVault || (vaults.length > 0 ? vaults[0] : null);

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
    <div className="space-y-4 text-left pb-4 text-stone-900">
      
      {/* 1. TOP PROPERTY SWITCHER (Modeled after Image 2: Light Clean Vibe) */}
      <div className="flex items-center justify-between pt-1">
        {currentVault ? (
          <div 
            onClick={() => setIsSwitchOpen(true)}
            className="flex items-center space-x-2 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-2xl px-3.5 py-2 cursor-pointer transition-all shadow-sm max-w-[80%]"
          >
            <Building className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-xs font-bold text-stone-900 truncate">
              {currentVault.propertyName}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black shrink-0">
              Switch ▾
            </span>
          </div>
        ) : (
          <button 
            onClick={onOpenCreate}
            className="flex items-center space-x-2 bg-white hover:bg-stone-50 border border-orange-200 rounded-2xl px-3.5 py-2 cursor-pointer transition-all shadow-sm"
          >
            <Building className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-xs font-bold text-stone-900">
              {user.name && user.name !== 'Landlord' ? `${user.name} • + Deploy Vault` : '+ Deploy First Lease Vault'}
            </span>
          </button>
        )}

        <button
          onClick={onOpenInspector}
          className="w-9 h-9 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-300 text-stone-600 hover:text-orange-500 flex items-center justify-center transition-colors shadow-sm"
          title="Pollar SDK & Stellar Explorer Info"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* 2. HERO TOTAL ESCROW CARD (Luxury Espresso & Solar Orange Neon Accent) */}
      <div className="bg-gradient-to-br from-[#1C140E] via-[#2A1D13] to-[#140D07] border border-orange-500/35 rounded-[28px] p-5 shadow-2xl relative overflow-hidden text-white">
        
        {/* Subtle background solar glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-1.5 text-stone-300 text-xs font-medium">
            <span>Total Settled in Escrow</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-stone-400 hover:text-white p-0.5"
            >
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-[10px] font-black text-orange-300 flex items-center gap-1 shadow-sm">
            <span>Protected Escrow ✓</span>
          </div>
        </div>

        {/* Big Bold Balance */}
        <div className="mt-2">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-1.5">
            {showBalance ? (
              <>
                <span>${totalLockedUSDC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-sm font-bold text-orange-400 font-sans">USDC</span>
              </>
            ) : (
              <span>••••••••</span>
            )}
          </div>
          <span className="text-[11px] text-amber-200/90 font-medium block mt-1">
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
              className="w-12 h-12 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-lg hover:bg-stone-100 hover:scale-105 active:scale-95 transition-all"
              title="Connect NUBAN Bank"
            >
              <Landmark className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-stone-200 font-bold">My Bank</span>
          </div>

          {/* Button 2: Share Link */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={() => {
                if (currentVault) {
                  onOpenShare(currentVault);
                } else {
                  onOpenCreate();
                }
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all"
              title={currentVault ? "Share Payment Link with Tenant" : "Deploy a Vault First"}
            >
              <Link2 className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-orange-200 font-bold">Share Link</span>
          </div>

          {/* Button 3: Live Yield */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={() => onSwitchTab('yield')}
              className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700/80 text-orange-400 flex items-center justify-center shadow-lg hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all"
              title="View Yield Portfolio"
            >
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-stone-200 font-bold">Live Yield</span>
          </div>

          {/* Button 4: Export CSV */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={handleExportCSV}
              className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700/80 text-stone-300 flex items-center justify-center shadow-lg hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all"
              title="Export Official Escrow Ledger CSV"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-stone-200 font-bold">Export CSV</span>
          </div>

        </div>
      </div>

      {/* 4. AUTO-OFFRAMP DESTINATION CARD */}
      <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            savedBank 
              ? 'bg-orange-50 border border-orange-200/80 text-orange-600' 
              : 'bg-stone-100 border border-stone-200 text-stone-400'
          }`}>
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">
              Auto-Offramp Destination
            </span>
            {savedBank ? (
              <>
                <span className="text-xs font-black text-stone-950 block">
                  {savedBank.bankName} • {savedBank.accountNumber}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  Verified: {savedBank.accountName}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-stone-700 block">
                  No Payout Bank Connected
                </span>
                <span className="text-[10px] text-amber-600 font-medium">
                  Add NUBAN account for instant NGN payouts
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onOpenBank}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
        >
          <span>{savedBank ? 'Change' : '+ Add Bank'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 5. METRICS ROW (Side-by-side like Image 2: Light Cards) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Active Houses */}
        <div 
          onClick={() => onSwitchTab('properties')}
          className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-300 transition-all cursor-pointer shadow-sm"
        >
          <span className="text-[10px] font-bold text-stone-500 block uppercase">
            Active Properties
          </span>
          <div className="text-xl font-black text-stone-950 font-mono mt-1">
            {vaults.length} Units
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
            {activeCount} Compounding
          </span>
        </div>

        {/* Card 2: Compounding Yield */}
        <div 
          onClick={() => onSwitchTab('yield')}
          className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-300 transition-all cursor-pointer shadow-sm"
        >
          <span className="text-[10px] font-bold text-stone-500 block uppercase">
            Compounding Speed
          </span>
          <div className="text-xl font-black text-orange-600 font-mono mt-1 flex items-center gap-1">
            <span>Instant</span>
            <span className="text-amber-500">⚡</span>
          </div>
          <span className="text-[10px] text-stone-600 font-bold mt-0.5 block">
            +${totalAccruedYield.toFixed(2)} Accrued Yield
          </span>
        </div>
      </div>

      {/* 6. QUICK ACTION: DEPLOY NEW HOUSE VAULT (Flashy Solar Gradient) */}
      <button
        onClick={onOpenCreate}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-between shadow-md shadow-orange-500/20 transition-all group"
      >
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-white" />
          <span>Add New House & Deploy Lease Escrow</span>
        </div>
        <span className="px-2 py-0.5 rounded-lg bg-white text-orange-600 font-black text-[10px] group-hover:scale-105 transition-transform shadow-sm">
          + Add House
        </span>
      </button>

      {/* 7. REAL-TIME ESCROW & YIELD LEDGER (Clean Light Cards) */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
            Real-Time Escrow Ledger
          </span>
          <span className="text-[10px] text-stone-400 font-mono font-bold">
            {vaults.length} vaults
          </span>
        </div>

        {vaults.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-stone-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">No Active Lease Vaults Yet</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Add your first property to generate a secure Stellar caution deposit link for your tenant.
              </p>
            </div>
            <button
              onClick={onOpenCreate}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/25 inline-flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy First Lease Vault</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {vaults.map((vault) => (
              <div
                key={vault.id}
                onClick={() => onSelectVault(vault)}
                className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-300 flex items-center justify-between cursor-pointer transition-all shadow-sm hover:shadow"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    vault.status === 'earning_yield'
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {vault.tenantName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-950 truncate">
                        {vault.propertyName}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono font-bold">
                        ({vault.houseCode})
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 block truncate font-medium">
                      Tenant: {vault.tenantName} • {vault.selectedPool.name.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div className="text-xs font-black font-mono text-stone-950">
                    ${vault.depositAmount.toFixed(2)}
                  </div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                    vault.status === 'earning_yield'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {vault.status === 'earning_yield' ? '✓ Earning Yield' : '⏳ Awaiting Deposit'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. PROPERTY SWITCHER MODAL / BOTTOM SHEET (Light Theme) */}
      {isSwitchOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border-t sm:border border-stone-200 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl space-y-3 text-stone-900">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200">
              <span className="text-sm font-black text-stone-950">Select Property</span>
              <button 
                onClick={() => setIsSwitchOpen(false)}
                className="text-xs font-bold text-stone-500 hover:text-stone-900"
              >
                Done
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {vaults.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-500">
                  No properties added yet. Click below to add your first property.
                </div>
              ) : (
                vaults.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      onSelectVault(v);
                      setIsSwitchOpen(false);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      currentVault && v.id === currentVault.id
                        ? 'border-orange-500 bg-orange-50/50'
                        : 'border-stone-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-stone-950 block truncate max-w-[200px]">
                        {v.propertyName}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono font-medium">
                        {v.houseCode} • ${v.depositAmount} USDC
                      </span>
                    </div>
                    {currentVault && v.id === currentVault.id && <Check className="w-4 h-4 text-orange-600" />}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                setIsSwitchOpen(false);
                onOpenCreate();
              }}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-orange-500/20"
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
