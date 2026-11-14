import React, { useState, useEffect } from 'react';
import { Landmark, Check, X, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { 
  POPULAR_NIGERIAN_BANKS, 
  getLiveNigerianBanks, 
  resolveBankAccount, 
  saveLandlordBankAccount, 
  getLandlordBankAccount,
  type NigerianBank, 
  type BankVerificationResult 
} from '../services/bankService';

interface BankSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  landlordName?: string;
}

export const BankSetupModal: React.FC<BankSetupModalProps> = ({
  isOpen,
  onClose,
  landlordName = 'Chief Babatunde Alabi',
}) => {
  const [banks, setBanks] = useState<NigerianBank[]>(POPULAR_NIGERIAN_BANKS);
  const [selectedBankCode, setSelectedBankCode] = useState('058'); // GTBank default
  const [accountNumber, setAccountNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<BankVerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load existing bank account on mount
  useEffect(() => {
    const existing = getLandlordBankAccount();
    if (existing) {
      setVerifiedResult(existing);
      setAccountNumber(existing.accountNumber);
      setSelectedBankCode(existing.bankCode);
    }

    getLiveNigerianBanks().then((list) => {
      if (list && list.length > 0) {
        setBanks(list);
      }
    });
  }, []);

  // Auto-verify when 10 digits are reached
  useEffect(() => {
    const clean = accountNumber.replace(/\D/g, '');
    if (clean.length === 10) {
      handleVerify(clean, selectedBankCode);
    } else {
      setVerifiedResult(null);
      setErrorMsg(null);
    }
  }, [accountNumber, selectedBankCode]);

  const handleVerify = async (accNum: string, bCode: string) => {
    setIsVerifying(true);
    setErrorMsg(null);
    setVerifiedResult(null);

    const result = await resolveBankAccount(accNum, bCode, landlordName);
    setIsVerifying(false);

    if (result.success) {
      setVerifiedResult(result);
    } else {
      setErrorMsg(result.error || 'Failed to verify account number.');
    }
  };

  const handleSave = () => {
    if (verifiedResult) {
      saveLandlordBankAccount(verifiedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Payout Bank Account
              </h2>
              <p className="text-[10px] text-slate-400">
                Direct NGN off-ramp for rental yields & deposits
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

        {/* Body */}
        <div className="py-4 space-y-3.5">
          {/* Bank Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Bank
            </label>
            <select
              value={selectedBankCode}
              onChange={(e) => setSelectedBankCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {banks.map((b) => (
                <option key={`${b.code}-${b.name}`} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              10-Digit NUBAN Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white tracking-wider focus:outline-none focus:border-emerald-500"
                placeholder="0123456789"
              />
              {isVerifying && (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-3" />
              )}
            </div>
          </div>

          {/* Verification Status Card */}
          {verifiedResult && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Account Verified via NUBAN Network</span>
              </div>
              <div className="text-sm font-black text-white tracking-tight">
                {verifiedResult.accountName}
              </div>
              <div className="text-[10px] text-slate-400">
                {verifiedResult.bankName} • {verifiedResult.accountNumber}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!verifiedResult}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              verifiedResult
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Save Verified Payout Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};