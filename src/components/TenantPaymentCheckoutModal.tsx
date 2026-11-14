import React, { useState } from 'react';
import { 
  CreditCard, Landmark, Coins, X, Check, ShieldCheck, 
  ArrowRight, Copy, Loader2 
} from 'lucide-react';
import type { LeaseVault } from '../types';
import { getLiveStellarTestnetTxHash } from '../services/pollarService';
import confetti from 'canvas-confetti';

interface TenantPaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: LeaseVault;
  onPaymentSuccess: (txHash: string) => void;
}

export const TenantPaymentCheckoutModal: React.FC<TenantPaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  vault,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'card' | 'transfer' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [step, setStep] = useState<'select' | 'processing' | 'confirmed'>('select');

  if (!isOpen) return null;

  const ngnAmount = (vault.depositAmount * 1500).toLocaleString();
  const stellarEscrowAddress = vault.selectedPool.contractId || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

  const handlePay = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      // Connect to Stellar Testnet Horizon to record live on-chain deposit
      const txHash = await getLiveStellarTestnetTxHash();
      
      // Simulate real bank/card processing window (2 seconds)
      await new Promise((r) => setTimeout(r, 2000));

      setStep('confirmed');
      setIsProcessing(false);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onPaymentSuccess(txHash);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
      setStep('select');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stellarEscrowAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl relative text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Secure Deposit Checkout
              </h2>
              <p className="text-[10px] text-slate-400">
                Pollar On-Ramp • Non-Custodial Escrow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deposit Summary Card */}
        <div className="my-3.5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 font-medium block">
            Escrow Deposit Amount:
          </span>
          <div className="text-xl font-bold font-mono text-white mt-0.5">
            ₦{ngnAmount} <span className="text-xs text-emerald-400">(${vault.depositAmount} USDC)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Property: <strong className="text-slate-200">{vault.propertyName}</strong>
          </p>
        </div>

        {step === 'select' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Select Payment Method
            </label>

            {/* Method 1: Debit / Credit Card */}
            <div
              onClick={() => setMethod('card')}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                method === 'card'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">Nigerian Debit / Credit Card</span>
                <span className="text-[10px] text-slate-400">Mastercard, Visa, Verve (Instant lock)</span>
              </div>
              {method === 'card' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>

            {/* Method 2: Direct Bank Transfer */}
            <div
              onClick={() => setMethod('transfer')}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                method === 'transfer'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Landmark className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">Bank Transfer (NUBAN / USSD)</span>
                <span className="text-[10px] text-slate-400">Pay via GTBank, Zenith, OPay, Kuda</span>
              </div>
              {method === 'transfer' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>

            {/* Method 3: Direct Crypto USDC on Stellar */}
            <div
              onClick={() => setMethod('crypto')}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                method === 'crypto'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">Direct USDC (Stellar Soroban)</span>
                <span className="text-[10px] text-slate-400">Freighter / Lobstr / Web3 Wallet</span>
              </div>
              {method === 'crypto' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>

            {method === 'crypto' && (
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] space-y-1">
                <span className="text-slate-400 block font-semibold">Stellar Escrow Contract Address:</span>
                <div className="flex items-center justify-between gap-1 font-mono text-emerald-400">
                  <span className="truncate">{stellarEscrowAddress}</span>
                  <button onClick={handleCopy} className="p-1 text-slate-300 hover:text-white">
                    {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all active:scale-98"
            >
              <span>Pay ₦{ngnAmount} & Lock Deposit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-white">
              Processing On-Ramp Transaction...
            </h3>
            <p className="text-xs text-slate-400">
              Converting fiat to USDC and depositing into Stellar Soroban Escrow.
            </p>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <Check className="w-7 h-7 text-emerald-400 stroke-[3]" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Payment Confirmed & Locked!
            </h3>
            <p className="text-xs text-slate-400">
              Your security deposit is now earning 8.42% APY in the Pollar yield vault.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};