import React, { useState } from 'react';
import { Shield, ArrowRight, KeyRound, Check, Sparkles } from 'lucide-react';

interface OnboardingHeroProps {
  onStartLandlord: () => void;
  onStartTenant: () => void;
}

export const OnboardingHero: React.FC<OnboardingHeroProps> = ({
  onStartLandlord,
  onStartTenant,
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        setIsVerifying(true);
        setTimeout(() => {
          setIsVerifying(false);
          setShowPinModal(false);
          onStartLandlord();
        }, 600);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-5 text-left text-white relative overflow-hidden select-none">
      
      {/* Background Glow Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar: Logo & Network Badge (Inspired by Image 1) */}
      <header className="flex items-center justify-between z-10 pt-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight block">
              OgaLandlord
            </span>
            <span className="text-[10px] text-emerald-400/90 font-semibold block -mt-0.5">
              Stellar Soroban Escrow
            </span>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Yield Escrow</span>
        </div>
      </header>

      {/* 2. Visual Centerpiece: Floating Escrow Cards with Floating Currency Badges */}
      <div className="my-auto py-6 flex flex-col items-center justify-center relative z-10">
        
        {/* Floating Currency Orbs */}
        <div className="absolute -top-1 left-8 w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xs font-bold animate-bounce shadow-md">
          ₦
        </div>
        <div className="absolute top-6 right-8 w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 text-xs font-bold animate-pulse shadow-md">
          $
        </div>
        <div className="absolute bottom-8 left-6 w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-xs font-bold shadow-md">
          €
        </div>
        <div className="absolute bottom-4 right-10 w-9 h-9 rounded-full bg-purple-400/20 border border-purple-400/40 flex items-center justify-center text-purple-300 text-[11px] font-black shadow-md">
          USDC
        </div>

        {/* Stack of Angled 3D Cards */}
        <div className="relative w-72 h-44 transition-transform hover:scale-105 duration-300">
          
          {/* Bottom Card (Blue accent) */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl transform rotate-[-8deg] translate-y-3 opacity-60 shadow-xl border border-blue-400/30" />
          
          {/* Middle Card (Purple / Magenta accent) */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl transform rotate-[-3deg] translate-y-1.5 opacity-80 shadow-xl border border-purple-400/30" />

          {/* Top Front Card (Dark Emerald Fintech Luxury) */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-5 shadow-2xl border border-emerald-400/50 flex flex-col justify-between backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-black/30 border border-emerald-300/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-emerald-200 tracking-wider uppercase block">
                    Lease Escrow
                  </span>
                  <span className="text-[9px] text-emerald-100/70 font-mono">
                    SOROBAN • SEP-43
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-200/90 font-bold">
                •••• 7821
              </span>
            </div>

            <div>
              <span className="text-[9px] font-bold text-emerald-300 tracking-wider uppercase block">
                Non-Custodial Escrow
              </span>
              <div className="flex justify-between items-end">
                <span className="text-xl font-black text-white font-mono tracking-tight">
                  8.42% APY
                </span>
                <span className="text-[10px] font-semibold text-emerald-200 bg-black/30 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  80/20 Yield Split
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Headline & Human Subtitle */}
        <div className="mt-8 text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            The Smartest Way to Lock & Grow Rental Deposits
          </h1>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed max-w-xs mx-auto">
            Say goodbye to move-out deposit fights. Caution funds are held in non-custodial smart escrow, actively earning <strong className="text-emerald-400">8.4% APY in stable dollars</strong> on Stellar.
          </p>
        </div>
      </div>

      {/* 4. Action Buttons (Matching Image 1 Hierarchy) */}
      <div className="space-y-3 z-10 pt-2 pb-1">
        {/* Primary CTA (Landlord) */}
        <button
          onClick={() => setShowPinModal(true)}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
        >
          <span>Create Lease Vault</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Secondary CTA (Tenant) */}
        <button
          onClick={onStartTenant}
          className="w-full py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl border border-slate-800/80 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
        >
          <span>I am a Tenant (Pay Deposit)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Micro-copy */}
        <p className="text-[10px] text-center text-slate-500 pt-1">
          No sign-up or seed phrase needed • 100% Secured by Device PIN
        </p>
      </div>

      {/* 5. 3-Second Device Security PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl text-center space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <KeyRound className="w-6 h-6 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Set Device Security PIN
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Used to authorize your vault actions and landlord co-sign releases.
              </p>
            </div>

            {/* 4 PIN Dots */}
            <div className="flex justify-center items-center space-x-4 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    pin.length > idx
                      ? 'bg-emerald-400 scale-110 shadow-md shadow-emerald-400/50'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>

            {isVerifying ? (
              <div className="py-2 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Device Security Activated! Opening Dashboard...</span>
              </div>
            ) : (
              /* Numeric Keypad */
              <div className="grid grid-cols-3 gap-2.5 pt-2 max-w-[260px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Bio', '0', '⌫'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      if (item === '⌫') handleBackspace();
                      else if (item === 'Bio') {
                        setIsVerifying(true);
                        setTimeout(() => {
                          setIsVerifying(false);
                          setShowPinModal(false);
                          onStartLandlord();
                        }, 500);
                      } else {
                        handleNumClick(item);
                      }
                    }}
                    className={`h-11 rounded-2xl font-bold text-sm transition-all flex items-center justify-center ${
                      item === 'Bio'
                        ? 'bg-emerald-500/20 text-emerald-300 text-xs font-semibold'
                        : item === '⌫'
                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-white active:scale-95 shadow-sm'
                    }`}
                  >
                    {item === 'Bio' ? <Sparkles className="w-4 h-4 text-emerald-400" /> : item}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowPinModal(false)}
              className="text-xs text-slate-500 hover:text-slate-400 pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
