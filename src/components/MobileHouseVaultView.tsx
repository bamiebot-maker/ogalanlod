import React, { useState } from 'react';
import { 
  ArrowLeft, FileText, Link2, Sparkles, 
  ExternalLink, Check, RotateCcw, ShieldCheck, 
  Building, CreditCard, Landmark, ScanFace,
  AlertCircle
} from 'lucide-react';
import type { LeaseVault } from '../types';
import { 
  calculateYield, 
  getLiveStellarTestnetTxHash, 
  generateCryptographicSEP43Signature 
} from '../services/pollarService';
import { authenticatePasskey } from '../services/passkeyService';
import { BankSetupModal } from './BankSetupModal';
import { TenantPaymentCheckoutModal } from './TenantPaymentCheckoutModal';
import { getLandlordBankAccount } from '../services/bankService';
import confetti from 'canvas-confetti';

interface MobileHouseVaultViewProps {
  vault: LeaseVault;
  onBack: () => void;
  onUpdateVault: (updated: LeaseVault) => void;
  currentRole?: 'landlord' | 'tenant';
}

export const MobileHouseVaultView: React.FC<MobileHouseVaultViewProps> = ({
  vault,
  onBack,
  onUpdateVault,
  currentRole = 'landlord',
}) => {
  const [activeTab, setActiveTab] = useState<'signatories' | 'percentages'>('signatories');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [biometricFeedback, setBiometricFeedback] = useState<string | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const savedBank = getLandlordBankAccount();

  const yieldData = calculateYield(
    vault.depositAmount, 
    vault.selectedPool.apy, 
    vault.simulatedMonthsElapsed || 0
  );

  const copyShareLink = () => {
    const url = `${window.location.origin}?vault=${vault.id}&role=tenant`;
    navigator.clipboard.writeText(url);
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

  const handleFastForward = (months: number) => {
    const newMonths = (vault.simulatedMonthsElapsed || 0) + months;
    const { accrued } = calculateYield(vault.depositAmount, vault.selectedPool.apy, newMonths);
    onUpdateVault({
      ...vault,
      simulatedMonthsElapsed: newMonths,
      accruedYield: accrued,
    });
  };

  const handleResetTimeline = () => {
    const { accrued } = calculateYield(vault.depositAmount, vault.selectedPool.apy, 0);
    onUpdateVault({
      ...vault,
      simulatedMonthsElapsed: 0,
      accruedYield: accrued,
      status: 'earning_yield',
      tenantSignature: undefined,
      landlordSignature: undefined,
      settlementTxHash: undefined,
    });
  };

  // Called when Tenant finishes real on-ramp checkout
  const handleCheckoutSuccess = (txHash: string) => {
    const updated: LeaseVault = {
      ...vault,
      status: 'earning_yield',
      depositTxHash: txHash,
      startDate: new Date().toISOString(),
    };
    onUpdateVault(updated);
    triggerConfetti();
  };

  // Landlord Initiates Move-Out Inspection
  const handleInitiateSettlement = () => {
    onUpdateVault({
      ...vault,
      status: 'settlement_requested',
    });
  };

  // Tenant Signs Release with their Own Biometric Passkey
  const handleTenantSignWithPasskey = async () => {
    setIsProcessing(true);
    setBiometricFeedback('Tenant authorizing release with Face ID / Fingerprint...');

    await authenticatePasskey(vault.tenantId);
    setBiometricFeedback('Generating SEP-43 cryptographic signature...');

    const sig = await generateCryptographicSEP43Signature(
      vault.tenantAddress || 'GBTYMDF3J7V5Y4U2K6N3W9D8R1T0P4Q7S5V2X8Z1B6C9F3H5J7L2N4P6',
      'tenant_payout',
      vault.id,
      vault.depositAmount
    );

    const updated: LeaseVault = {
      ...vault,
      tenantSignature: sig,
    };
    onUpdateVault(updated);
    setIsProcessing(false);
    setBiometricFeedback(null);
  };

  // Landlord Co-Signs with their Own Biometric Passkey
  const handleLandlordCoSignWithPasskey = async () => {
    setIsProcessing(true);
    setBiometricFeedback('Landlord co-signing release with Face ID / Fingerprint...');

    await authenticatePasskey(vault.landlordId);
    setBiometricFeedback('Generating SEP-43 cryptographic signature...');

    const sig = await generateCryptographicSEP43Signature(
      vault.landlordAddress || 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      'landlord_release',
      vault.id,
      vault.depositAmount
    );

    const updated: LeaseVault = {
      ...vault,
      landlordSignature: sig,
    };
    onUpdateVault(updated);
    setIsProcessing(false);
    setBiometricFeedback(null);
  };

  // Final Execution & Off-Ramp to Bank Accounts
  const handleExecutePayout = async () => {
    setIsProcessing(true);
    setBiometricFeedback('Broadcasting settlement to Stellar Soroban...');

    const tx = await getLiveStellarTestnetTxHash();
    const updated: LeaseVault = {
      ...vault,
      status: 'fully_settled',
      settlementTxHash: tx,
      settlementTerms: {
        deductions: 0,
        deductionReason: 'Move-out inspection passed with zero damage deductions.',
        finalTenantPayout: vault.depositAmount + yieldData.tenantShare,
        finalLandlordYield: yieldData.landlordShare,
        settledAt: new Date().toISOString(),
      },
    };

    onUpdateVault(updated);
    setIsProcessing(false);
    setBiometricFeedback(null);
    triggerConfetti();
  };

  const isTenantView = currentRole === 'tenant';

  return (
    <div className="bg-white text-stone-900 rounded-[32px] p-5 shadow-xl border border-stone-200/90 space-y-4 text-left transition-all pb-8">
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-200 transition-colors"
          title="Back to Properties"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            {isTenantView ? 'Tenant View' : 'Landlord View'}
          </span>
          <button
            onClick={() => handleFastForward(6)}
            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-bold shadow-sm shadow-orange-500/20 hover:opacity-95 transition-opacity"
            title="Fast forward 6 months of compounding yield"
          >
            +6M Yield
          </button>
          <button
            onClick={handleResetTimeline}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
            title="Reset Timeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Title Header: Property & Vault Identity */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 font-mono">
            {vault.id}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
            vault.status === 'earning_yield' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : vault.status === 'awaiting_deposit'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              vault.status === 'earning_yield' ? 'bg-emerald-500 animate-pulse' : 'bg-current'
            }`} />
            {vault.status === 'earning_yield' ? 'Earning Yield (Active)' : vault.status === 'awaiting_deposit' ? 'Awaiting Deposit' : 'Settlement Mode'}
          </span>
        </div>
        <h1 className="text-xl font-black text-stone-950 tracking-tight">
          Security Deposit Vault
        </h1>
        <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
          <Building className="w-3 h-3 text-stone-400" />
          <span>{vault.propertyName}</span>
        </p>
      </div>

      {/* 3. Escrow Deposit Balance Card */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 text-lg shadow-sm">
            🛡️
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-medium block">Protected Escrow Principal</span>
            <div className="text-2xl font-black text-stone-950 font-mono tracking-tight">
              ${vault.depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs font-bold text-orange-600 ml-1">USDC</span>
            </div>
            <span className="text-[10px] text-stone-500">≈ ₦{(vault.depositAmount * 1500).toLocaleString()} NGN</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-stone-500 font-medium block">
            {vault.simulatedMonthsElapsed ? `Month ${vault.simulatedMonthsElapsed} of ${vault.leaseDurationMonths}` : '12 Mo. Lease'}
          </span>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-700">
            {vault.selectedPool.apy}% APY
          </span>
        </div>
      </div>

      {/* 4. Quick Action Buttons */}
      <div className="grid grid-cols-5 gap-2 text-center pt-0.5">
        {/* Button 1: Bank Account Settings */}
        <div className="flex flex-col items-center space-y-1">
          <button 
            onClick={() => setIsBankModalOpen(true)}
            className="w-11 h-11 rounded-full bg-[#18120C] text-white flex items-center justify-center hover:bg-stone-900 transition-all shadow-md active:scale-95"
            title="Set Verified Payout Bank Account"
          >
            <Landmark className="w-4 h-4 text-orange-400" />
          </button>
          <span className="text-[10px] text-stone-600 font-semibold">{savedBank ? 'Bank Set' : 'Bank'}</span>
        </div>

        {/* Button 2: Contract */}
        <div className="flex flex-col items-center space-y-1">
          <button 
            onClick={() => setShowContractDetails(!showContractDetails)}
            className="w-11 h-11 rounded-full bg-[#18120C] text-white flex items-center justify-center hover:bg-stone-900 transition-all shadow-md active:scale-95"
            title="View Stellar Soroban Contract Details"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
          </button>
          <span className="text-[10px] text-stone-600 font-semibold">Contract</span>
        </div>

        {/* Button 3: Terms */}
        <div className="flex flex-col items-center space-y-1">
          <button 
            onClick={() => alert(`Lease Escrow Rules:\n• Principal ($${vault.depositAmount} USDC) is locked in Pollar Yield Vault.\n• ${vault.yieldSplitTenantPercent}% of all yield goes to Tenant (${vault.tenantName}).\n• ${100 - vault.yieldSplitTenantPercent}% goes to Landlord (${vault.landlordName}).\n• Mutual SEP-43 sign-off required for damage deductions.`)}
            className="w-11 h-11 rounded-full bg-[#18120C] text-white flex items-center justify-center hover:bg-stone-900 transition-all shadow-md active:scale-95"
            title="View Tenancy Agreement Terms"
          >
            <FileText className="w-4 h-4 text-white" />
          </button>
          <span className="text-[10px] text-stone-600 font-semibold">Terms</span>
        </div>

        {/* Button 4: Invite / Share */}
        <div className="flex flex-col items-center space-y-1">
          <button 
            onClick={copyShareLink}
            className="w-11 h-11 rounded-full bg-[#18120C] text-white flex items-center justify-center hover:bg-stone-900 transition-all shadow-md active:scale-95"
            title="Share Vault Invite Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-orange-400" /> : <Link2 className="w-4 h-4 text-white" />}
          </button>
          <span className="text-[10px] text-stone-600 font-semibold">{copiedLink ? 'Copied' : 'Invite'}</span>
        </div>

        {/* Button 5: Explorer */}
        <div className="flex flex-col items-center space-y-1">
          <button 
            onClick={() => window.open(`https://stellar.expert/explorer/testnet/contract/${vault.selectedPool.contractId}`, '_blank')}
            className="w-11 h-11 rounded-full bg-[#18120C] text-white flex items-center justify-center hover:bg-stone-900 transition-all shadow-md active:scale-95"
            title="View Soroban Contract on Stellar Expert"
          >
            <ExternalLink className="w-4 h-4 text-white" />
          </button>
          <span className="text-[10px] text-stone-600 font-semibold">Explorer</span>
        </div>
      </div>

      {/* Contract Details Drawer (if clicked) */}
      {showContractDetails && (
        <div className="p-3 bg-stone-900 text-stone-200 rounded-2xl text-[11px] space-y-1.5 border border-stone-800 animate-fadeIn">
          <div className="flex justify-between items-center text-stone-400 font-semibold">
            <span>Stellar Soroban Contract</span>
            <span className="text-orange-400 font-mono text-[10px]">Testnet</span>
          </div>
          <div className="font-mono text-[10px] text-stone-300 break-all bg-stone-950 p-2 rounded-lg border border-stone-800">
            {vault.selectedPool.contractId}
          </div>
          <div className="flex justify-between text-stone-400 text-[10px] pt-1">
            <span>Protocol: <strong className="text-white">{vault.selectedPool.provider}</strong></span>
            <span>Asset: <strong className="text-white">USDC</strong></span>
          </div>
        </div>
      )}

      {/* 5. Lease Signatories Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
              Lease Parties & Escrow
            </h2>
            <p className="text-[11px] text-stone-500">
              SEP-43 co-signers for deposit lock & release
            </p>
          </div>

          <div className="flex bg-stone-100 p-0.5 rounded-full text-xs">
            <button
              onClick={() => setActiveTab('signatories')}
              className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition-all ${
                activeTab === 'signatories' ? 'bg-[#18120C] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Signatories
            </button>
            <button
              onClick={() => setActiveTab('percentages')}
              className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition-all ${
                activeTab === 'percentages' ? 'bg-[#18120C] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Yield Split %
            </button>
          </div>
        </div>

        {activeTab === 'signatories' ? (
          <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
            {/* Landlord */}
            <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 flex flex-col items-center space-y-1.5 relative group">
              <div className="relative">
                <img
                  src={vault.landlordAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                  alt={vault.landlordName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-500"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[9px] font-black ring-2 ring-white">
                  ✓
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-stone-950 block truncate max-w-[85px]">
                  {vault.landlordName}
                </span>
                <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                  Landlord
                </span>
              </div>
              <span className="text-[9px] text-stone-400 font-mono">
                {vault.landlordId || 'LND-88421'}
              </span>
            </div>

            {/* Tenant */}
            <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 flex flex-col items-center space-y-1.5 relative group">
              <div className="relative">
                <img
                  src={vault.tenantAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
                  alt={vault.tenantName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-500"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[9px] font-black ring-2 ring-white">
                  ✓
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-stone-950 block truncate max-w-[85px]">
                  {vault.tenantName}
                </span>
                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                  Tenant
                </span>
              </div>
              <span className="text-[9px] text-stone-400 font-mono">
                {vault.tenantId || 'TNT-33108'}
              </span>
            </div>

            {/* Smart Contract */}
            <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 flex flex-col items-center space-y-1.5 relative group">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-[#18120C] text-orange-400 flex items-center justify-center ring-2 ring-orange-500 font-bold">
                  <ShieldCheck className="w-5 h-5 text-orange-400" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[9px] font-black ring-2 ring-white">
                  ✓
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-stone-950 block truncate max-w-[85px]">
                  Pollar Vault
                </span>
                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                  Soroban
                </span>
              </div>
              <span className="text-[9px] text-stone-400 font-mono">
                SEP-43 Auth
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between text-stone-700">
              <span className="font-semibold">Tenant Principal Guarantee:</span>
              <span className="font-mono font-bold text-stone-950">100% (${vault.depositAmount.toFixed(2)})</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span className="font-semibold">Tenant Yield Split ({vault.yieldSplitTenantPercent}%):</span>
              <span className="font-mono font-bold text-emerald-600">+${yieldData.tenantShare.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span className="font-semibold">Landlord Bonus Split ({100 - vault.yieldSplitTenantPercent}%):</span>
              <span className="font-mono font-bold text-orange-600">+${yieldData.landlordShare.toFixed(2)} USDC</span>
            </div>
            <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-200">
              Protected by non-custodial Soroban smart escrow. Funds cannot be diverted without mutual authorization.
            </p>
          </div>
        )}
      </div>

      {/* 6. Live Compounding DeFi Yield Card */}
      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="text-[11px] text-emerald-900 font-bold block">Compounding DeFi Yield</span>
            <span className="text-[10px] text-emerald-700">{vault.selectedPool.name}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-emerald-700 font-mono">
            +${yieldData.accrued.toFixed(2)} USDC
          </span>
          <span className="text-[10px] text-emerald-600 block">≈ ₦{(yieldData.accrued * 1500).toFixed(0)}</span>
        </div>
      </div>

      {/* Biometric Scanning Feedback Prompt */}
      {biometricFeedback && (
        <div className="p-3 bg-emerald-950 text-emerald-300 rounded-2xl text-xs flex items-center justify-center space-x-2 animate-pulse border border-emerald-500/40">
          <ScanFace className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">{biometricFeedback}</span>
        </div>
      )}

      {/* 7. Action Area: Role-Separated & Biometric-Secured */}
      <div className="pt-2">

        {/* STATE A: Awaiting Deposit */}
        {vault.status === 'awaiting_deposit' && (
          <div className="space-y-3">
            {isTenantView ? (
              // TENANT SEES REAL ON-RAMP CHECKOUT TRIGGER
              <div className="space-y-2.5">
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 active:scale-98"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    Pay ₦{(vault.depositAmount * 1500).toLocaleString()} Deposit via On-Ramp
                  </span>
                </button>
                <p className="text-[10px] text-center text-stone-500">
                  Supports Nigerian Debit Cards, Bank Transfer & Direct USDC
                </p>
              </div>
            ) : (
              // LANDLORD SEES WAITING STATE & SHARE LINK
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-2 text-amber-900 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Waiting for <strong>{vault.tenantName}</strong> to deposit via link.</span>
                </div>
                <button
                  onClick={copyShareLink}
                  className="w-full py-3 bg-[#18120C] hover:bg-stone-900 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-stone-900/10"
                >
                  <Link2 className="w-4 h-4 text-orange-400" />
                  <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Payment Link for Tenant'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STATE B: Earning Yield */}
        {vault.status === 'earning_yield' && (
          <div className="space-y-2">
            {!isTenantView ? (
              // LANDLORD CAN INITIATE MOVE-OUT SETTLEMENT
              <button
                onClick={handleInitiateSettlement}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center active:scale-98"
              >
                <span>Initiate Move-Out Settlement</span>
              </button>
            ) : (
              // TENANT SEES ACTIVE ESCROW PROTECTION
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Security Deposit Actively Compounding</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Your funds are locked in non-custodial Soroban escrow. When you move out, both you and the landlord will co-sign for full refund + 80% yield payout.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STATE C: Settlement Requested (Mutual Co-Signing) */}
        {vault.status === 'settlement_requested' && (
          <div className="space-y-2.5">
            <div className="p-3 bg-[#FAF7F2] border border-stone-200 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-stone-800 block">Move-Out Settlement Terms:</span>
              <div className="flex justify-between text-stone-600">
                <span>Tenant Refund (Principal + 80% Yield):</span>
                <strong className="text-stone-900 font-mono">${(vault.depositAmount + yieldData.tenantShare).toFixed(2)} USDC</strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Landlord Yield Bonus (20%):</span>
                <strong className="text-orange-600 font-mono">+${yieldData.landlordShare.toFixed(2)} USDC</strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Damage Deductions:</span>
                <strong className="text-emerald-700 font-mono">$0.00 (Zero Damages)</strong>
              </div>
            </div>

            {/* Strict Role Separation */}
            {isTenantView ? (
              <div>
                {!vault.tenantSignature ? (
                  <button
                    onClick={handleTenantSignWithPasskey}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <ScanFace className="w-4 h-4" />
                    <span>Approve Refund with Face ID / Fingerprint</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Tenant Biometric Authorization Verified!</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {!vault.landlordSignature ? (
                  <button
                    onClick={handleLandlordCoSignWithPasskey}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <ScanFace className="w-4 h-4" />
                    <span>Co-Sign Release with Face ID / Fingerprint</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Landlord Biometric Authorization Verified!</span>
                  </div>
                )}
              </div>
            )}

            {/* When both have signed: Execute payout & off-ramp */}
            {vault.tenantSignature && vault.landlordSignature ? (
              <button
                onClick={handleExecutePayout}
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#18120C] hover:bg-black text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-98"
              >
                <span>Execute On-Chain Payout & Off-Ramp to Bank</span>
              </button>
            ) : (
              <p className="text-[10px] text-center text-stone-500 italic">
                {vault.tenantSignature && !vault.landlordSignature 
                  ? 'Tenant approved! Awaiting Landlord co-signature.'
                  : !vault.tenantSignature && vault.landlordSignature
                  ? 'Landlord co-signed! Awaiting Tenant biometric confirmation.'
                  : 'Both parties must co-sign with device biometrics to unlock escrow.'}
              </p>
            )}
          </div>
        )}

        {/* STATE D: Fully Settled & Off-Ramped */}
        {vault.status === 'fully_settled' && (
          <div className="space-y-2">
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-center text-xs text-emerald-900 space-y-1">
              <span className="font-bold flex items-center justify-center gap-1 text-emerald-700">
                <Check className="w-4 h-4 stroke-[3]" />
                Escrow Settled & Off-Ramped to Bank!
              </span>
              <p className="text-[10px] text-slate-600">
                Principal and yield successfully liquidated to bank accounts via Pollar off-ramp.
              </p>
            </div>

            <a
              href={`https://stellar.expert/explorer/testnet/tx/${vault.settlementTxHash || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-slate-100 text-emerald-800 font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-1.5 hover:bg-slate-200"
            >
              <span>View Verified On-Chain Transaction on Stellar Expert</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

      </div>

      {/* Modals */}
      <BankSetupModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        landlordName={vault.landlordName}
        onSaveAccount={(saved) => {
          if (saved.accountName && saved.accountName.toLowerCase() !== 'landlord') {
            onUpdateVault({ ...vault, landlordName: saved.accountName });
          }
        }}
      />

      <TenantPaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        vault={vault}
        onPaymentSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};