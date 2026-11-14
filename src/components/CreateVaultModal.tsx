import React, { useState } from 'react';
import { 
  X, Building, Calendar, Percent, 
  Sparkles, Check, Share2, Copy, ArrowRight, ShieldCheck, Smartphone
} from 'lucide-react';
import { AVAILABLE_YIELD_POOLS } from '../data/mockData';
import type { LeaseVault, YieldPool } from '../types';
import { calculateYield, getLiveStellarTestnetTxHash } from '../services/pollarService';
import { usePollar } from '@pollar/react';
import confetti from 'canvas-confetti';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVault: (vault: LeaseVault) => void;
}

export const CreateVaultModal: React.FC<CreateVaultModalProps> = ({
  isOpen,
  onClose,
  onCreateVault,
}) => {
  const { wallet } = usePollar();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [propertyName, setPropertyName] = useState('Lekki Phase 1 Penthouse - Flat 4B');
  const [propertyAddress, setPropertyAddress] = useState('14 Admiralty Way, Lekki Phase 1, Lagos');
  const [landlordName, setLandlordName] = useState('Chief Babatunde Alabi');
  const [tenantName, setTenantName] = useState('Emeka Nwosu');
  const [tenantPhone, setTenantPhone] = useState('+234 803 987 6543');
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'NGN'>('USD');
  const [leaseDurationMonths, setLeaseDurationMonths] = useState<number>(12);
  const [yieldSplitTenantPercent, setYieldSplitTenantPercent] = useState<number>(80);
  const [selectedPool, setSelectedPool] = useState<YieldPool>(AVAILABLE_YIELD_POOLS[0]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [createdVault, setCreatedVault] = useState<LeaseVault | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const yieldProjection = calculateYield(depositAmount, selectedPool.apy, leaseDurationMonths);
  const ngnRate = 1500; // 1 USDC = ₦1,500
  const displayDeposit = currencyMode === 'NGN' ? depositAmount * ngnRate : depositAmount;

  const handleDepositChange = (val: number) => {
    if (currencyMode === 'NGN') {
      setDepositAmount(Math.round(val / ngnRate));
    } else {
      setDepositAmount(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);

    try {
      const code = propertyName.slice(0, 2).toUpperCase() + '-' + Math.floor(10 + Math.random() * 90);
      const testnetTx = await getLiveStellarTestnetTxHash();

      const newVault: LeaseVault = {
        id: `HSE-${Math.floor(1000 + Math.random() * 9000)}`,
        houseCode: code,
        propertyName,
        propertyAddress,
        landlordId: 'LND-88421',
        landlordName,
        landlordAddress: wallet?.address || 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
        landlordAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        tenantId: `TNT-${Math.floor(10000 + Math.random() * 90000)}`,
        tenantName,
        tenantEmail: `${tenantName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        tenantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        depositAmount,
        leaseDurationMonths,
        yieldSplitTenantPercent,
        selectedPool,
        status: 'awaiting_deposit',
        createdAt: new Date().toISOString(),
        accruedYield: 0,
        simulatedMonthsElapsed: 0,
        depositTxHash: testnetTx,
      };

      onCreateVault(newVault);
      setCreatedVault(newVault);
      setIsDeploying(false);
      setStep(3); // Success Screen
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to create vault:', err);
      setIsDeploying(false);
    }
  };

  const shareUrl = createdVault 
    ? `${window.location.origin}?vault=${createdVault.id}&role=tenant` 
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello ${tenantName}, your security deposit vault for ${propertyName} is ready on OgaLandlord. Deposit $${depositAmount} USDC into escrow and earn 8.4% APY here: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?phone=${tenantPhone.replace(/\D/g, '')}&text=${text}`, '_blank');
  };

  const handleCloseAll = () => {
    setStep(1);
    setCreatedVault(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative overflow-hidden text-left flex flex-col max-h-[90vh]">
        
        {/* Drag Indicator (Mobile) */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Building className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {step === 3 ? 'Vault Deployed!' : 'New Lease Escrow Vault'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {step === 3 ? 'Share link with tenant' : 'Protected by Stellar Soroban Escrow'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* STEP 1: Property & Tenant Details */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Property Name & Unit
                </label>
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Lekki Phase 1 - Flat 4B"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Property Physical Address
                </label>
                <input
                  type="text"
                  required
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Landlord Name
                  </label>
                  <input
                    type="text"
                    required
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tenant Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tenant WhatsApp / Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+234 803 987 6543"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  The payment link will be sent to this WhatsApp contact.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Next: Deposit & Yield Strategy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 2: Escrow Amount, Duration & Yield Strategy */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Deposit Amount with Currency Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Security Deposit Principal
                  </label>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCurrencyMode('USD')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        currencyMode === 'USD' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrencyMode('NGN')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        currencyMode === 'NGN' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      NGN (₦)
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                    {currencyMode === 'NGN' ? '₦' : '$'}
                  </span>
                  <input
                    type="number"
                    min={50}
                    required
                    value={displayDeposit}
                    onChange={(e) => handleDepositChange(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Equivalent: ${depositAmount} USDC</span>
                  <span>≈ ₦{(depositAmount * ngnRate).toLocaleString()} NGN</span>
                </div>
              </div>

              {/* Lease Duration & Yield Split */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lease Duration
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <select
                      value={leaseDurationMonths}
                      onChange={(e) => setLeaseDurationMonths(Number(e.target.value))}
                      className="w-full pl-8 pr-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months (1 Year)</option>
                      <option value={24}>24 Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Yield Split
                  </label>
                  <div className="relative">
                    <Percent className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <select
                      value={yieldSplitTenantPercent}
                      onChange={(e) => setYieldSplitTenantPercent(Number(e.target.value))}
                      className="w-full pl-8 pr-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value={80}>80% Tenant / 20% Landlord</option>
                      <option value={70}>70% Tenant / 30% Landlord</option>
                      <option value={100}>100% Tenant Reward</option>
                      <option value={50}>50% / 50% Even Split</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stellar Yield Strategy Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Escrow Yield Strategy
                </label>
                <div className="space-y-1.5">
                  {AVAILABLE_YIELD_POOLS.map((pool) => (
                    <div
                      key={pool.id}
                      onClick={() => setSelectedPool(pool)}
                      className={`cursor-pointer p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        selectedPool.id === pool.id
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{pool.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            {pool.apy}% APY
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{pool.description}</p>
                      </div>
                      {selectedPool.id === pool.id && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Compounding Yield Projected Reward */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    <span>Projected Compound Return</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{leaseDurationMonths} Mo. Horizon</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center pt-1 border-t border-slate-800 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Total Yield</span>
                    <span className="text-emerald-400 font-mono font-bold">+${yieldProjection.accrued} USDC</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tenant ({yieldSplitTenantPercent}%)</span>
                    <span className="text-white font-mono font-bold">+${yieldProjection.tenantShare} USDC</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Landlord Bonus</span>
                    <span className="text-white font-mono font-bold">+${yieldProjection.landlordShare} USDC</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isDeploying}
                  className="w-2/3 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isDeploying ? 'Deploying to Stellar...' : 'Deploy & Lock Vault'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Screen (Share Link with Tenant) */}
          {step === 3 && createdVault && (
            <div className="space-y-4 text-center py-2 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Lease Escrow Vault Live!
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Vault ID: <span className="font-mono text-emerald-400 font-bold">{createdVault.id}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Send this link to <strong className="text-white">{tenantName}</strong> to pay the deposit via Card, Bank, or USDC.
                </p>
              </div>

              {/* Link Box */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                  Tenant Payment & Escrow Link:
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-emerald-400 truncate flex-1">
                    {shareUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Share2 className="w-4 h-4 text-slate-950" />
                  <span>Send via WhatsApp to {tenantName}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
                >
                  Done & View Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};