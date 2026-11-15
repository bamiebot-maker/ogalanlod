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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white border-t sm:border border-stone-200/90 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl relative text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-200">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-black text-stone-950 tracking-tight">
                Secure Deposit Checkout
              </h2>
              <p className="text-[10px] text-stone-500 font-medium">
                Pollar On-Ramp • Non-Custodial Escrow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deposit Summary Card */}
        <div className="my-3.5 p-3.5 bg-[#FAF7F2] rounded-2xl border border-stone-200 text-xs">
          <span className="text-[10px] text-stone-500 font-bold block">
            Escrow Deposit Amount:
          </span>
          <div className="text-xl font-black font-mono text-stone-950 mt-0.5">
            ₦{ngnAmount} <span className="text-xs text-orange-600 font-black">(${vault.depositAmount} USDC)</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Property: <strong className="text-stone-900">{vault.propertyName}</strong>
          </p>
        </div>

        {step === 'select' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-stone-700">
              Select Payment Method
            </label>

            {/* Method 1: Debit / Credit Card */}
            <div
              onClick={() => setMethod('card')}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                method === 'card'
                  ? 'border-orange-500 bg-orange-50/60 shadow-sm'
                  : 'border-stone-200 bg-[#FAF7F2] hover:border-stone-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-stone-950 block">Nigerian Debit / Credit Card</span>
                <span className="text-[10px] text-stone-500 font-medium">Mastercard, Visa, Verve (Instant lock)</span>
              </div>
              {method === 'card' && <Check className="w-4 h-4 text-orange-600" />}
            </div>

            {/* Method 2: Direct Bank Transfer */}
            <div
              onClick={() => setMethod('transfer')}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                method === 'transfer'
                  ? 'border-orange-500 bg-orange-50/60 shadow-sm'
                  : 'border-stone-200 bg-[#FAF7F2] hover:border-stone-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Landmark className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-stone-950 block">Bank Transfer (NUBAN / USSD)</span>
                <span className="text-[10px] text-stone-500 font-medium">Pay via GTBank, Zenith, OPay, Kuda</span>
              </div>
              {method === 'transfer' && <Check className="w-4 h-4 text-orange-600" />}
            </div>

            {/* Method 3: Direct Crypto USDC on Stellar */}
            <div
              onClick={() => setMethod('crypto')}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                method === 'crypto'
                  ? 'border-orange-500 bg-orange-50/60 shadow-sm'
                  : 'border-stone-200 bg-[#FAF7F2] hover:border-stone-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4 text-purple-700" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-stone-950 block">Direct USDC (Stellar Soroban)</span>
                <span className="text-[10px] text-stone-500 font-medium">Freighter / Lobstr / Web3 Wallet</span>
              </div>
              {method === 'crypto' && <Check className="w-4 h-4 text-orange-600" />}
            </div>

            {method === 'crypto' && (
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-stone-200 text-[10px] space-y-1">
                <span className="text-stone-500 block font-bold">Stellar Escrow Contract Address:</span>
                <div className="flex items-center justify-between gap-1 font-mono text-stone-800">
                  <span className="truncate">{stellarEscrowAddress}</span>
                  <button onClick={handleCopy} className="p-1 text-stone-500 hover:text-stone-900">
                    {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-1.5 transition-all active:scale-98"
            >
              <span>Pay ₦{ngnAmount} & Lock Deposit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
            <h3 className="text-sm font-black text-stone-950">
              Processing On-Ramp Transaction...
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Converting fiat to USDC and depositing into Stellar Soroban Escrow.
            </p>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-7 h-7 text-emerald-600 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-stone-950">
              Payment Confirmed & Locked!
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Your security deposit is now earning 8.42% APY in the Pollar yield vault.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};