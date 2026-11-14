import React, { useState } from 'react';
import { 
  ArrowRight, Building, User, ScanFace, 
  Fingerprint, Lock, Check, X, Sparkles, Smartphone 
} from 'lucide-react';
import type { UserProfile } from '../types';
import { registerPasskey } from '../services/passkeyService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'landlord' | 'tenant'>('landlord');
  const [name, setName] = useState('Chief Babatunde Alabi');
  const [phone, setPhone] = useState('+234 803 123 4567');
  const [backupPin, setBackupPin] = useState('7429');
  const [isScanning, setIsScanning] = useState(false);
  const [isBiometricSuccess, setIsBiometricSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivateBiometrics = async () => {
    setIsScanning(true);
    const tempId = role === 'landlord' 
      ? `LND-${Math.floor(10000 + Math.random() * 90000)}` 
      : `TNT-${Math.floor(10000 + Math.random() * 90000)}`;

    await registerPasskey(tempId, name);

    setTimeout(() => {
      setIsScanning(false);
      setIsBiometricSuccess(true);

      setTimeout(() => {
        const newProfile: UserProfile = {
          id: tempId,
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@ogalandlord.io`,
          role,
          avatarUrl: role === 'landlord'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
          stellarAddress: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
        };
        onComplete(newProfile);
      }, 700);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl relative overflow-hidden text-center animate-slideUp">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-1.5 mb-5">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700'}`} />
        </div>

        {/* STEP 1: Select Role */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Welcome to OgaLandlord
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Zero passwords. Zero seed phrases. Instant passkey security.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-left">
              <div
                onClick={() => setRole('landlord')}
                className={`cursor-pointer p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                  role === 'landlord'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-white block">Oga Landlord (Owner)</span>
                  <span className="text-[11px] text-slate-400">Lock deposit safely, earn passive DeFi yields</span>
                </div>
                {role === 'landlord' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>

              <div
                onClick={() => setRole('tenant')}
                className={`cursor-pointer p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                  role === 'tenant'
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-white block">Tenant (Payer)</span>
                  <span className="text-[11px] text-slate-400">Deposit protected by smart escrow, earn 80% yield</span>
                </div>
                {role === 'tenant' && <Check className="w-4 h-4 text-cyan-400" />}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Name & Phone */}
        {step === 2 && (
          <div className="space-y-4 text-left">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Profile Information
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your profile is verified on the Stellar Soroban network
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {role === 'landlord' ? 'Landlord Name' : 'Tenant Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Babatunde Alabi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone / WhatsApp Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+234 803 123 4567"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Used for instant escrow link sharing & move-out alerts
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-slate-800 text-slate-300 font-semibold text-xs rounded-2xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20"
              >
                Next: Passkey Setup
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Passkey / Biometric Setup (Face ID / Fingerprint / PIN) */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Activate Biometrics</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your device hardware key secures your rental deposits
              </p>
            </div>

            {/* Big Biometric Action Button */}
            <div className="py-2">
              <button
                type="button"
                onClick={handleActivateBiometrics}
                disabled={isScanning || isBiometricSuccess}
                className={`w-28 h-28 mx-auto rounded-3xl border flex flex-col items-center justify-center transition-all ${
                  isBiometricSuccess
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-xl shadow-emerald-500/20 scale-105'
                    : isScanning
                    ? 'bg-slate-800 border-emerald-400 text-emerald-300 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-emerald-500 hover:text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isBiometricSuccess ? (
                  <>
                    <Check className="w-10 h-10 text-emerald-400 stroke-[3]" />
                    <span className="text-[10px] font-bold text-emerald-400 mt-1.5">Verified!</span>
                  </>
                ) : isScanning ? (
                  <>
                    <ScanFace className="w-10 h-10 animate-bounce text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-300 mt-1.5">Scanning...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-10 h-10 text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-300 mt-1.5">Face ID / Touch ID</span>
                  </>
                )}
              </button>
            </div>

            {/* 4-Digit Backup PIN */}
            <div className="text-left bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span className="flex items-center gap-1 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Backup 4-Digit Emergency PIN</span>
                </span>
                <span className="text-[10px] text-slate-500">Device loss recovery</span>
              </div>
              <input
                type="password"
                maxLength={4}
                value={backupPin}
                onChange={(e) => setBackupPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[1em] text-lg font-mono font-bold py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                placeholder="••••"
              />
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              By continuing, a hardware-grade Passkey is created in your device's Secure Enclave. Neither OgaLandlord nor counterparty can access your private key.
            </p>

            <button
              type="button"
              onClick={handleActivateBiometrics}
              disabled={isScanning || isBiometricSuccess}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-bold text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <ScanFace className="w-4 h-4" />
              <span>{isScanning ? 'Verifying with Device...' : isBiometricSuccess ? 'Ready!' : 'Confirm with Face ID / Fingerprint'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};