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
    <div className="min-h-full flex flex-col justify-between p-5 text-left text-stone-900 relative overflow-hidden select-none bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F5ECE0]">
      
      {/* Background Solar Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-300/25 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar: Logo & Network Badge */}
      <header className="flex items-center justify-between z-10 pt-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-black text-stone-950 tracking-tight block">
              OgaLandlord
            </span>
            <span className="text-[10px] text-orange-600 font-bold block -mt-0.5">
              Stellar Soroban Escrow
            </span>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-[10px] font-black text-orange-600 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>Yield Escrow</span>
        </div>
      </header>

      {/* 2. Visual Centerpiece: Floating Escrow Cards with Floating Currency Badges */}
      <div className="my-auto py-5 flex flex-col items-center justify-center relative z-10">
        
        {/* Floating Currency Orbs */}
        <div className="absolute -top-2 left-6 w-9 h-9 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-xs font-black animate-bounce shadow-md">
          ₦
        </div>
        <div className="absolute top-4 right-6 w-9 h-9 rounded-full bg-orange-100 border border-orange-300 text-orange-700 flex items-center justify-center text-xs font-black animate-pulse shadow-md">
          $
        </div>
        <div className="absolute bottom-6 left-5 w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-xs font-black shadow-md">
          €
        </div>
        <div className="absolute bottom-4 right-8 w-10 h-10 rounded-full bg-purple-100 border border-purple-300 text-purple-800 flex items-center justify-center text-[10px] font-black shadow-md">
          USDC
        </div>

        {/* Stack of Angled 3D Cards */}
        <div className="relative w-72 h-44 transition-transform hover:scale-105 duration-300">
          
          {/* Bottom Card (Deep Navy) */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl transform rotate-[-8deg] translate-y-3 opacity-50 shadow-xl border border-slate-700/40" />
          
          {/* Middle Card (Coral / Rose) */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-amber-600 rounded-3xl transform rotate-[-3deg] translate-y-1.5 opacity-70 shadow-xl border border-rose-400/40" />

          {/* Top Front Card (Electric Solar Orange & Gold Gradient) */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-5 shadow-2xl shadow-orange-500/40 border border-orange-300/60 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-black/20 border border-white/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-white tracking-wider uppercase block">
                    Lease Escrow
                  </span>
                  <span className="text-[9px] text-orange-100 font-mono font-semibold">
                    SOROBAN • SEP-43
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-orange-100 font-black">
                •••• 7821
              </span>
            </div>

            <div>
              <span className="text-[9px] font-bold text-orange-100 tracking-wider uppercase block">
                Non-Custodial Escrow
              </span>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  8.42% APY
                </span>
                <span className="text-[10px] font-black text-orange-950 bg-white px-2.5 py-0.5 rounded-full shadow-sm">
                  80/20 Yield Split
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Headline & Human Subtitle */}
        <div className="mt-8 text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight leading-tight">
            The Smartest Way to Lock & Grow Rental Deposits
          </h1>
          <p className="text-xs text-stone-600 mt-2.5 leading-relaxed max-w-xs mx-auto">
            Say goodbye to move-out deposit fights. Caution funds are held in non-custodial smart escrow, actively earning <strong className="text-orange-600 font-bold">8.4% APY in stable dollars</strong> on Stellar.
          </p>
        </div>
      </div>

      {/* 4. Action Buttons (High-Contrast Energy) */}
      <div className="space-y-3 z-10 pt-2 pb-1">
        {/* Primary CTA (Landlord: Bold Electric Solar) */}
        <button
          onClick={() => setShowPinModal(true)}
          className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-orange-500/35 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
        >
          <span>Create Lease Vault</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Secondary CTA (Tenant: Pure White with Crisp Border) */}
        <button
          onClick={onStartTenant}
          className="w-full py-3.5 bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs rounded-2xl border border-stone-200/90 shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
        >
          <span>I am a Tenant (Pay Deposit)</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </button>

        {/* Micro-copy */}
        <p className="text-[10px] text-center text-stone-500 font-medium pt-1">
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
