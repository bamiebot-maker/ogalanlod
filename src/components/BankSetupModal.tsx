import React, { useState, useEffect } from 'react';
import { Landmark, Check, X, AlertCircle, Loader2, ShieldCheck, User } from 'lucide-react';
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
  onSaveAccount?: (details: BankVerificationResult) => void;
}

export const BankSetupModal: React.FC<BankSetupModalProps> = ({
  isOpen,
  onClose,
  landlordName = '',
  onSaveAccount,
}) => {
  const [banks, setBanks] = useState<NigerianBank[]>(POPULAR_NIGERIAN_BANKS);
  const [selectedBankCode, setSelectedBankCode] = useState('058'); // GTBank default
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
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
      setAccountName(existing.accountName);
    } else if (landlordName && landlordName.toLowerCase() !== 'landlord') {
      setAccountName(landlordName);
    }

    getLiveNigerianBanks().then((list) => {
      if (list && list.length > 0) {
        setBanks(list);
      }
    });
  }, [isOpen, landlordName]);

  // Auto-verify when 10 digits and/or name are entered
  useEffect(() => {
    const clean = accountNumber.replace(/\D/g, '');
    if (clean.length === 10) {
      const timer = setTimeout(() => {
        handleVerify(clean, selectedBankCode, accountName);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setVerifiedResult(null);
      setErrorMsg(null);
    }
  }, [accountNumber, selectedBankCode, accountName]);

  const handleVerify = async (accNum: string, bCode: string, nameInput: string) => {
    setIsVerifying(true);
    setErrorMsg(null);

    const result = await resolveBankAccount(accNum, bCode, nameInput);
    setIsVerifying(false);

    if (result.success) {
      setVerifiedResult(result);
      if (result.accountName && result.accountName !== 'LANDLORD' && result.accountName !== accountName.toUpperCase()) {
        setAccountName(result.accountName);
      }
    } else {
      setVerifiedResult(null);
      if (result.error) {
        setErrorMsg(result.error);
      }
    }
  };

  const handleSave = () => {
    if (verifiedResult) {
      saveLandlordBankAccount(verifiedResult);
      if (onSaveAccount) {
        onSaveAccount(verifiedResult);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white border-t sm:border border-stone-200/90 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-200">
              <Landmark className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-black text-stone-950 tracking-tight">
                Payout Bank Account
              </h2>
              <p className="text-[10px] text-stone-500 font-medium">
                Direct NGN off-ramp for rental yields & deposits
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

        {/* Body */}
        <div className="py-4 space-y-3.5">
          {/* Bank Select */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Select Bank
            </label>
            <select
              value={selectedBankCode}
              onChange={(e) => setSelectedBankCode(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-stone-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
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
            <label className="block text-xs font-bold text-stone-700 mb-1">
              10-Digit NUBAN Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-950 tracking-wider focus:outline-none focus:border-orange-500 focus:bg-white"
                placeholder="0123456789"
              />
              {isVerifying && (
                <Loader2 className="w-4 h-4 text-orange-500 animate-spin absolute right-3 top-3" />
              )}
            </div>
          </div>

          {/* Account Holder Full Name Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Account Holder Full Name
              </label>
              <span className="text-[10px] text-stone-400 font-medium">
                (as registered on bank/BVN)
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Ibrahim Sobur Bamidele"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs font-bold text-stone-950 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
              <User className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Verification Status Card */}
          {verifiedResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-black text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Verified via NUBAN Network</span>
              </div>
              <div className="text-sm font-black text-stone-950 tracking-tight">
                {verifiedResult.accountName}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">
                {verifiedResult.bankName} • {verifiedResult.accountNumber}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!verifiedResult}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md ${
              verifiedResult
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-98'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none'
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
