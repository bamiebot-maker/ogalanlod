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
    <div className="w-full h-full flex-1 flex flex-col justify-between p-6 text-center text-stone-900 relative overflow-hidden select-none bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F5ECE0]">
      
      {/* Background Solar Glow Accents */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar: Logo & Network Badge (Modeled after Ipin) */}
      <header className="flex items-center justify-between z-10 pt-1">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-extrabold text-stone-950 tracking-tight">
            OgaLandlord
          </span>
        </div>

        <div className="px-3 py-1 rounded-full bg-stone-200/60 text-stone-700 text-[11px] font-semibold tracking-tight">
          Stellar Escrow
        </div>
      </header>

      {/* 2. Visual Centerpiece: 3D Stack of Cards & Small Floating Coins (Modeled after Ipin) */}
      <div className="my-auto py-2 flex flex-col items-center justify-center relative z-10">
        
        {/* Small, Delicate Floating Currency Coins */}
        <div className="absolute -top-1 left-7 w-7 h-7 rounded-full bg-[#FFB800] text-stone-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-200 animate-bounce">
          ₦
        </div>
        <div className="absolute top-5 right-7 w-7 h-7 rounded-full bg-[#FFB800] text-stone-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-200 animate-pulse">
          $
        </div>
        <div className="absolute bottom-6 left-6 w-6 h-6 rounded-full bg-[#FFB800] text-stone-950 font-black text-[10px] flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-200">
          €
        </div>
        <div className="absolute bottom-5 right-8 w-7 h-7 rounded-full bg-[#FFB800] text-stone-950 font-black text-[10px] flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-200">
          USDC
        </div>

        {/* Stack of 3D Credit Cards */}
        <div className="relative w-[276px] h-[165px] transition-transform hover:scale-105 duration-300">
          
          {/* Card 1: Bottom Blue/Indigo Card */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-[22px] transform rotate-[-8deg] translate-y-3 opacity-90 shadow-xl border border-white/20" />
          
          {/* Card 2: Middle Fuchsia/Magenta Card */}
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 rounded-[22px] transform rotate-[-4deg] translate-y-1.5 opacity-90 shadow-xl border border-white/20" />

          {/* Card 3: Top Front Card (Electric Solar Orange & Gold) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF5E00] via-[#FF6E00] to-[#FFA000] rounded-[22px] p-4 shadow-2xl shadow-orange-500/35 border border-white/30 flex flex-col justify-between text-white text-left">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                {/* Gold Card Chip */}
                <div className="w-8 h-6 rounded-md bg-[#FFE082] border border-amber-300 flex items-center justify-center shadow-sm">
                  <div className="w-4 h-3 border border-amber-400/60 rounded-xs" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-white tracking-wider uppercase block">
                    OGALANDLORD
                  </span>
                  <span className="text-[8px] text-orange-100 font-medium">
                    SOROBAN • SEP-43
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-orange-100 font-bold">
                •••• 7821
              </span>
            </div>

            <div>
              <span className="text-[8.5px] font-bold text-orange-100 uppercase tracking-wider block">
                NON-CUSTODIAL ESCROW • 100% MATH FAIR
              </span>
              <div className="flex justify-between items-end mt-0.5">
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  8.42% APY
                </span>
                <span className="text-[9.5px] font-bold text-orange-950 bg-white px-2.5 py-0.5 rounded-full shadow-sm">
                  80/20 Yield Split
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Headline & Human Subtitle (Refined Font Size & Weight like Ipin) */}
        <div className="mt-7 px-1">
          <h1 className="text-[23px] sm:text-[25px] font-bold text-stone-950 tracking-tight leading-[1.22]">
            The Smartest Way to Manage & Protect Rental Deposits
          </h1>
          <p className="text-[12.5px] text-stone-600 mt-2.5 leading-relaxed max-w-[315px] mx-auto font-normal">
            Create a live lease escrow in seconds. Tenants lock caution deposits with zero dispute risk, while funds actively earn 8.42% APY in stable dollars on Stellar.
          </p>
        </div>
      </div>

      {/* 4. Action Buttons: Clean Capsule Pills (Modeled after Ipin) */}
      <div className="space-y-2.5 z-10 pt-1 pb-0.5">
        {/* Primary CTA (Landlord: Electric Solar Capsule Pill) */}
        <button
          onClick={() => setShowPinModal(true)}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-[#FF6200] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-[14px] rounded-full shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
        >
          <span>Create Lease Vault</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Secondary CTA (Tenant: Pure White Capsule Pill) */}
        <button
          onClick={onStartTenant}
          className="w-full py-3.5 bg-white hover:bg-stone-50 text-stone-800 font-bold text-[14px] rounded-full border border-stone-200/90 shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
        >
          <span>Join as Tenant (Pay Deposit)</span>
          <ArrowRight className="w-4 h-4 text-stone-400 stroke-[2.5]" />
        </button>

        {/* Micro-copy */}
        <p className="text-[11px] text-center text-stone-500 font-normal pt-0.5">
          No sign-up or seed phrase needed • 100% Secured by Device PIN
        </p>
      </div>

      {/* 5. 3-Second Device Security PIN Modal (Light Theme) */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border-t sm:border border-stone-200 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl text-center space-y-4 text-stone-900">
            
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-6 h-6 text-orange-600" />
            </div>

            <div>
              <h3 className="text-base font-black text-stone-950">
                Set Device Security PIN
              </h3>
              <p className="text-xs text-stone-500 mt-1">
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
                      ? 'bg-orange-500 scale-110 shadow-md shadow-orange-500/50'
                      : 'bg-stone-200 border border-stone-300'
                  }`}
                />
              ))}
            </div>

            {isVerifying ? (
              <div className="py-2 text-xs font-bold text-orange-600 flex items-center justify-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4 text-orange-600" />
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
                    className={`h-11 rounded-2xl font-black text-sm transition-all flex items-center justify-center ${
                      item === 'Bio'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold'
                        : item === '⌫'
                        ? 'bg-stone-100 text-stone-500 hover:text-stone-900'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-900 active:scale-95 shadow-sm'
                    }`}
                  >
                    {item === 'Bio' ? <Sparkles className="w-4 h-4 text-orange-600" /> : item}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowPinModal(false)}
              className="text-xs text-stone-400 hover:text-stone-600 pt-1 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
