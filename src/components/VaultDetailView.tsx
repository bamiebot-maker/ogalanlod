import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Check, ExternalLink, Sparkles, Shield, 
  DollarSign, ArrowRight, Lock, CheckCircle2, AlertCircle,
  FileCheck2, Coins, FastForward, RotateCcw
} from 'lucide-react';
import type { LeaseVault } from '../types';
import { calculateYield, generateStellarTestnetTxHash, generateSEP43AuthSignature } from '../services/pollarService';
import { saveVault, subscribeToVault } from '../services/supabase';
import confetti from 'canvas-confetti';
import { usePollar } from '@pollar/react';

interface VaultDetailViewProps {
  vault: LeaseVault;
  onBack: () => void;
  onUpdateVault: (updated: LeaseVault) => void;
  currentRole: 'landlord' | 'tenant';
}

export const VaultDetailView: React.FC<VaultDetailViewProps> = ({
  vault,
  onBack,
  onUpdateVault,
}) => {
  const { wallet } = usePollar();

  const [copiedLink, setCopiedLink] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [livePulse, setLivePulse] = useState(false);

  // Micro-simulation ticker to show real-time compounding
  useEffect(() => {
    if (vault.status === 'earning_yield') {
      const interval = setInterval(() => {
        setLivePulse(true);
        setTimeout(() => setLivePulse(false), 500);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [vault.status]);

  // Real-time Supabase subscription across devices
  useEffect(() => {
    const unsubscribe = subscribeToVault(vault.id, (incomingVault) => {
      onUpdateVault(incomingVault);
    });
    return () => {
      unsubscribe();
    };
  }, [vault.id]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6'],
    });
  };

  const persistUpdate = (updated: LeaseVault) => {
    onUpdateVault(updated);
    saveVault(updated);
  };

  // 1. Simulation controls
  const handleFastForwardMonths = (monthsToAdd: number) => {
    const newMonths = vault.simulatedMonthsElapsed + monthsToAdd;
    const { accrued } = calculateYield(vault.depositAmount, vault.selectedPool.apy, newMonths);
    
    persistUpdate({
      ...vault,
      simulatedMonthsElapsed: newMonths,
      accruedYield: accrued,
    });
  };

  const handleResetSimulation = () => {
    const { accrued } = calculateYield(vault.depositAmount, vault.selectedPool.apy, 0);
    persistUpdate({
      ...vault,
      simulatedMonthsElapsed: 0,
      accruedYield: accrued,
      status: 'earning_yield',
      tenantSignature: undefined,
      landlordSignature: undefined,
      settlementTxHash: undefined,
    });
  };

  // 2. Deposit Action (Tenant)
  const handleExecuteDeposit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const txHash = generateStellarTestnetTxHash();
      const updated: LeaseVault = {
        ...vault,
        status: 'earning_yield',
        depositTxHash: txHash,
        startDate: new Date().toISOString(),
        tenantAddress: wallet?.address || 'GBTYMDF3J7V5Y4U2K6N3W9D8R1T0P4Q7S5V2X8Z1B6C9F3H5J7L2N4P6',
      };
      persistUpdate(updated);
      setIsProcessing(false);
      triggerConfetti();
    }, 1400);
  };

  // 3. Initiate Settlement
  const handleInitiateSettlement = () => {
    persistUpdate({
      ...vault,
      status: 'settlement_requested',
    });
  };

  // 4. Sign SEP-43 Auth Entry (Tenant)
  const handleTenantSign = () => {
    const signer = vault.tenantAddress || 'GBTYMDF3J7V5Y4U2K6N3W9D8R1T0P4Q7S5V2X8Z1B6C9F3H5J7L2N4P6';
    const sig = generateSEP43AuthSignature(signer, 'tenant_release');
    persistUpdate({
      ...vault,
      tenantSignature: sig,
    });
  };

  // 5. Co-Sign SEP-43 Auth Entry (Landlord)
  const handleLandlordCoSign = () => {
    const signer = vault.landlordAddress || 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
    const sig = generateSEP43AuthSignature(signer, 'landlord_release');
    persistUpdate({
      ...vault,
      landlordSignature: sig,
    });
  };

  // 6. Execute Final On-Chain Payout
  const handleExecutePayout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const yieldSplit = calculateYield(
        vault.depositAmount, 
        vault.selectedPool.apy, 
        vault.simulatedMonthsElapsed || 6
      );

      const txHash = generateStellarTestnetTxHash();
      const updated: LeaseVault = {
        ...vault,
        status: 'fully_settled',
        settlementTxHash: txHash,
        settlementTerms: {
          deductions: 0,
          deductionReason: 'Normal wear & tear - zero damages assessed.',
          finalTenantPayout: vault.depositAmount + yieldSplit.tenantShare,
          finalLandlordYield: yieldSplit.landlordShare,
          settledAt: new Date().toISOString(),
        },
      };
      persistUpdate(updated);
      setIsProcessing(false);
      triggerConfetti();
    }, 1600);
  };

  const yieldData = calculateYield(
    vault.depositAmount, 
    vault.selectedPool.apy, 
    vault.simulatedMonthsElapsed || 0
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Simulation Quick Bar */}
      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Vaults</span>
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 font-mono">Vault ID: {vault.id}</span>
        </div>

        {/* Demo Fast-Forward Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <FastForward className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Hackathon Simulator:</span>
          </span>
          <button
            onClick={() => handleFastForwardMonths(3)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
            title="Simulate 3 months of compounding yield"
          >
            +3 Mo
          </button>
          <button
            onClick={() => handleFastForwardMonths(6)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
            title="Simulate 6 months of compounding yield"
          >
            +6 Mo
          </button>
          <button
            onClick={() => handleFastForwardMonths(12)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all"
            title="Simulate 12 months full lease term"
          >
            Full Year
          </button>
          <button
            onClick={handleResetSimulation}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset Timeline to 0 Months"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={copyShareLink}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Vault Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                vault.status === 'earning_yield'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : vault.status === 'awaiting_deposit'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : vault.status === 'settlement_requested'
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  vault.status === 'earning_yield' ? 'bg-emerald-400 animate-ping' : 'bg-current'
                }`} />
                <span>
                  {vault.status === 'awaiting_deposit' && 'Awaiting Tenant Deposit'}
                  {vault.status === 'earning_yield' && 'Active & Earning Yield'}
                  {vault.status === 'settlement_requested' && 'Mutual Settlement Pending'}
                  {vault.status === 'fully_settled' && 'Lease Settled & Paid Out'}
                </span>
              </span>

              <span className="text-xs text-slate-400">
                Created {new Date(vault.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {vault.propertyName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {vault.propertyAddress}
            </p>
          </div>

          {/* Quick Party Summary */}
          <div className="flex items-center space-x-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <div className="text-slate-400">Landlord</div>
              <div className="font-semibold text-white mt-0.5">{vault.landlordName}</div>
              <div className="text-[10px] font-mono text-slate-400">{vault.landlordAddress.slice(0, 4)}...{vault.landlordAddress.slice(-4)}</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-slate-400">Tenant</div>
              <div className="font-semibold text-white mt-0.5">{vault.tenantName}</div>
              <div className="text-[10px] text-slate-400">{vault.tenantEmail}</div>
            </div>
          </div>
        </div>

        {/* 4 Financial Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {/* Principal */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Security Deposit Locked</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ${vault.depositAmount.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">USDC</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              100% Principal Protection
            </div>
          </div>

          {/* Live APY & Pool */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Yield Strategy (Stellar)</span>
              <Coins className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 font-mono">
              {vault.selectedPool.apy}%{' '}
              <span className="text-xs font-normal text-slate-400">APY</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {vault.selectedPool.name}
            </div>
          </div>

          {/* Accrued Yield (Compounding) */}
          <div className={`p-4 rounded-2xl border transition-all ${
            livePulse 
              ? 'bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-950/80 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Accrued Yield Earned</span>
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              +${yieldData.accrued.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">USDC</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Elapsed: {vault.simulatedMonthsElapsed} of {vault.leaseDurationMonths} Mo
            </div>
          </div>

          {/* Projected Payout */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Tenant Projected Return</span>
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ${(vault.depositAmount + yieldData.tenantShare).toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">USDC</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-medium">
              +{yieldData.tenantShare.toFixed(2)} USDC free yield ({vault.yieldSplitTenantPercent}%)
            </div>
          </div>
        </div>

        {/* Soroban Contract Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Stellar Soroban Contract:</span>
            <code className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[11px]">
              {vault.selectedPool.contractId}
            </code>
          </div>
          {vault.depositTxHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${vault.depositTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium underline decoration-emerald-500/30"
            >
              <span>View Deposit TX on Stellar Expert</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* WORKFLOW ACTION PANEL */}

      {/* STATE 1: Awaiting Deposit */}
      {vault.status === 'awaiting_deposit' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/30 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Next Step: Tenant Security Deposit</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Fund ${vault.depositAmount.toFixed(2)} USDC into Yield Escrow
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                As the tenant, fund the deposit. Pollar sponsors the Stellar transaction fees and routes the deposit directly into the {vault.selectedPool.name} to earn {vault.selectedPool.apy}% APY immediately.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExecuteDeposit}
                disabled={isProcessing}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Calling Pollar earnDeposit()...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Deposit & Activate Escrow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: Active & Earning Yield */}
      {vault.status === 'earning_yield' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Vault Active on Stellar Soroban</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Earning +${yieldData.accrued.toFixed(2)} USDC in Live Compounding Yield
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Funds are generating daily interest in the {vault.selectedPool.provider} vault. When move-out occurs, initiate mutual settlement to sign off and return deposit + yield.
              </p>
            </div>

            <button
              onClick={handleInitiateSettlement}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Initiate Move-Out Settlement</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: Mutual Settlement Dual-Sign (SEP-43 Showcase) */}
      {vault.status === 'settlement_requested' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>SEP-43 Soroban Dual Authorization Sign-Off</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Move-Out Settlement & Yield Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Both parties must cryptographically sign
            </span>
          </div>

          {/* Breakdown Table */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800 text-slate-300">
              <span>Principal Deposit Return (100% to Tenant)</span>
              <span className="font-mono font-bold text-white">${vault.depositAmount.toFixed(2)} USDC</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800 text-slate-300">
              <span>Total Accrued Yield Earned in Vault</span>
              <span className="font-mono font-bold text-emerald-400">+${yieldData.accrued.toFixed(2)} USDC</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800 text-slate-300">
              <span>Tenant Yield Share ({vault.yieldSplitTenantPercent}%)</span>
              <span className="font-mono font-bold text-emerald-400">+${yieldData.tenantShare.toFixed(2)} USDC</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800 text-slate-300">
              <span>Landlord Yield Share ({100 - vault.yieldSplitTenantPercent}%)</span>
              <span className="font-mono font-bold text-cyan-400">+${yieldData.landlordShare.toFixed(2)} USDC</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800 text-slate-300">
              <span>Damage Withholding / Deductions</span>
              <span className="font-mono font-bold text-slate-400">$0.00 USDC (Agreed by Landlord)</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-sm font-bold">
              <span className="text-white">Total Tenant Payout:</span>
              <span className="font-mono text-emerald-400 text-base">
                ${(vault.depositAmount + yieldData.tenantShare).toFixed(2)} USDC
              </span>
            </div>
          </div>

          {/* Dual Signature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tenant Sign Card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>🔑</span> Tenant Sign-off
                </span>
                {vault.tenantSignature ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Signed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                    Awaiting Signature
                  </span>
                )}
              </div>

              {vault.tenantSignature ? (
                <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-[10px] text-emerald-400 break-all border border-emerald-500/20">
                  {vault.tenantSignature}
                </div>
              ) : (
                <button
                  onClick={handleTenantSign}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all border border-slate-700"
                >
                  Sign with Pollar (`signAuthEntry`)
                </button>
              )}
            </div>

            {/* Landlord Co-Sign Card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>👔</span> Landlord Co-Sign
                </span>
                {vault.landlordSignature ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Co-Signed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                    Awaiting Co-Sign
                  </span>
                )}
              </div>

              {vault.landlordSignature ? (
                <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-[10px] text-emerald-400 break-all border border-emerald-500/20">
                  {vault.landlordSignature}
                </div>
              ) : (
                <button
                  onClick={handleLandlordCoSign}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all border border-slate-700"
                >
                  Co-Sign with Pollar (`signAuthEntry`)
                </button>
              )}
            </div>
          </div>

          {/* Release Execution Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleExecutePayout}
              disabled={!vault.tenantSignature || !vault.landlordSignature || isProcessing}
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xl shadow-emerald-500/25 transition-all flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span>Executing Pollar earnWithdraw() & transfer...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Execute Settlement Payout on Stellar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: Fully Settled Celebration Card */}
      {vault.status === 'fully_settled' && vault.settlementTerms && (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/50 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-white">
            Lease Vault Successfully Settled!
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            100% of the tenant security deposit plus accrued yield has been disbursed on Stellar without escrow middleman fees or landlord disputes.
          </p>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Disbursed to Tenant:</span>
              <span className="font-mono font-bold text-emerald-400">
                ${vault.settlementTerms.finalTenantPayout.toFixed(2)} USDC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bonus to Landlord:</span>
              <span className="font-mono font-bold text-cyan-400">
                ${vault.settlementTerms.finalLandlordYield.toFixed(2)} USDC
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Settled At:</span>
              <span className="text-slate-300">
                {new Date(vault.settlementTerms.settledAt || Date.now()).toLocaleString()}
              </span>
            </div>
          </div>

          {vault.settlementTxHash && (
            <div className="pt-2">
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${vault.settlementTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <span>Verify Settlement on Stellar Expert</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
