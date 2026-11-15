import React, { useState } from 'react';
import { Shield, ArrowRight, Check, Fingerprint, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { registerPasskey } from '../services/passkeyService';

interface OnboardingHeroProps {
  onStartLandlord: () => void;
  onStartTenant: (codeOrUrl?: string) => void;
  initialVaultId?: string | null;
}

export const OnboardingHero: React.FC<OnboardingHeroProps> = ({
  onStartLandlord,
  onStartTenant,
  initialVaultId = null,
}) => {
  // Landlord verification state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tenant access & verification state
  const [showTenantModal, setShowTenantModal] = useState(Boolean(initialVaultId));
  const [tenantCode, setTenantCode] = useState(initialVaultId || '');
  const [isTenantVerifying, setIsTenantVerifying] = useState(false);
  const [isTenantSuccess, setIsTenantSuccess] = useState(false);
  const [tenantErrorMsg, setTenantErrorMsg] = useState<string | null>(null);

  const handleDeviceLogin = async () => {
    setShowAuthModal(true);
    setIsVerifying(true);
    setIsSuccess(false);
    setErrorMsg(null);

    try {
      // Triggers native Android/iOS WebAuthn prompt for Landlord Vault (no demo names!)
      const randomId = Math.floor(10000 + Math.random() * 90000);
      await registerPasskey(`LND-${randomId}`, 'Landlord Vault');
      setIsVerifying(false);
      setIsSuccess(true);
      setErrorMsg(null);
      setTimeout(() => {
        setShowAuthModal(false);
        onStartLandlord();
      }, 700);
    } catch (err: any) {
      console.warn('Native biometric verification cancelled or failed:', err);
      setIsVerifying(false);
      setIsSuccess(false);
      const message = err?.message || 'Device PIN or fingerprint verification was cancelled. Please confirm your phone PIN or fingerprint to proceed.';
      setErrorMsg(message);
      // STRICT: User must never be logged in on cancellation!
    }
  };

  const handleTenantDeviceLogin = async () => {
    setShowTenantModal(true);
    setIsTenantVerifying(true);
    setIsTenantSuccess(false);
    setTenantErrorMsg(null);

    try {
      // Triggers native Android/iOS WebAuthn prompt for Tenant Vault (no demo names!)
      const randomId = Math.floor(10000 + Math.random() * 90000);
      await registerPasskey(`TNT-${randomId}`, 'Tenant Vault');
      setIsTenantVerifying(false);
      setIsTenantSuccess(true);
      setTenantErrorMsg(null);
      setTimeout(() => {
        setShowTenantModal(false);
        onStartTenant(tenantCode.trim() || undefined);
      }, 700);
    } catch (err: any) {
      console.warn('Tenant biometric verification cancelled or failed:', err);
      setIsTenantVerifying(false);
      setIsTenantSuccess(false);
      const message = err?.message || 'Phone PIN or fingerprint verification was cancelled. Please confirm your phone PIN to proceed.';
      setTenantErrorMsg(message);
      // STRICT: User must never be logged in on cancellation!
    }
  };

  return (
    <div className="w-full h-full min-h-[100dvh] sm:min-h-0 flex-1 flex flex-col justify-between px-5 py-4 text-center text-stone-900 relative overflow-hidden select-none bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F5ECE0]">
      
      {/* Background Solar Glow Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar: Logo & Network Badge (Modeled after Ipin) */}
      <header className="flex items-center justify-between z-10 pt-0.5 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-extrabold text-stone-950 tracking-tight">
            OgaLandlord
          </span>
        </div>

        <div className="px-2.5 py-0.5 rounded-full bg-stone-200/60 text-stone-700 text-[10.5px] font-semibold tracking-tight">
          Stellar Escrow
        </div>
      </header>

      {/* 2. Visual Centerpiece: 3D Stack of Cards & Anchored Currency Coins (Modeled after Ipin) */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 relative z-10">
        
        {/* Elevated Stack of 3D Credit Cards with strictly anchored coins */}
        <div className="relative w-[264px] h-[156px] mx-auto mt-1 sm:mt-2 transition-transform hover:scale-105 duration-300">
          
          {/* Card 1: Bottom Blue/Indigo Card */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-[20px] transform rotate-[-8deg] translate-y-2.5 opacity-90 shadow-xl border border-white/20" />
          
          {/* Card 2: Middle Fuchsia/Magenta Card */}
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 rounded-[20px] transform rotate-[-4deg] translate-y-1.5 opacity-90 shadow-xl border border-white/20" />

          {/* Card 3: Top Front Card (Electric Solar Orange & Gold) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF5E00] via-[#FF6E00] to-[#FFA000] rounded-[20px] p-3.5 shadow-2xl shadow-orange-500/35 border border-white/30 flex flex-col justify-between text-white text-left">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                {/* Gold Card Chip */}
                <div className="w-7 h-5 rounded-md bg-[#FFE082] border border-amber-300 flex items-center justify-center shadow-sm">
                  <div className="w-3.5 h-2.5 border border-amber-400/60 rounded-xs" />
                </div>
                <div>
                  <span className="text-[9.5px] font-black text-white tracking-wider uppercase block">
                    OGALANDLORD
                  </span>
                  <span className="text-[7.5px] text-orange-100 font-medium">
                    SOROBAN • SEP-43
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-orange-100 font-bold">
                •••• 7821
              </span>
            </div>

            <div>
              <span className="text-[8px] font-bold text-orange-100 uppercase tracking-wider block">
                NON-CUSTODIAL ESCROW • 100% MATH FAIR
              </span>
              <div className="flex justify-between items-end mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                  8.42% APY
                </span>
                <span className="text-[9px] font-bold text-orange-950 bg-white px-2 py-0.5 rounded-full shadow-sm">
                  80/20 Yield Split
                </span>
              </div>
            </div>
          </div>

          {/* Small Floating Currency Coins (Anchored strictly to card corners only - Never overlaps text!) */}
          <div className="absolute -top-3 -left-4 w-6 h-6 rounded-full bg-[#FFB800] text-stone-950 font-black text-[11px] flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-200">
            ₦
          </div>
          <div className="absolute -top-2 -right-4 w-6 h-6 rounded-full bg-[#FFB800] text-stone-950 font-black text-[11px] flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-200">
            $
          </div>
          <div className="absolute top-[52%] -left-5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFB800] text-stone-950 font-black text-[10px] flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-200">
            €
          </div>
          <div className="absolute top-[52%] -right-5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFB800] text-stone-950 font-black text-[8.5px] flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-200">
            USDC
          </div>
        </div>

        {/* 3. Headline & Human Subtitle (Compact font size & balanced weight like Ipin, pushed down with mt-8) */}
        <div className="mt-8 sm:mt-9 px-2 max-w-[320px] mx-auto">
          <h1 className="text-[20px] sm:text-[22px] font-extrabold text-stone-950 tracking-tight leading-snug">
            The Smartest Way to Manage & Protect Rental Deposits
          </h1>
          <p className="text-[12px] sm:text-[13px] text-stone-600 mt-2 leading-relaxed max-w-[290px] mx-auto font-normal">
            Create a live lease escrow in seconds. Tenants lock caution deposits with zero dispute risk, while funds actively earn 8.42% APY in stable dollars on Stellar.
          </p>
        </div>
      </div>

      {/* 4. Action Buttons: Clean Capsule Pills (Modeled after Ipin) */}
      <div className="space-y-2 z-10 pt-2 pb-1 shrink-0">
        {/* Primary CTA (Landlord: Electric Solar Capsule Pill) */}
        <button
          onClick={handleDeviceLogin}
          className="w-full py-3 bg-gradient-to-r from-orange-500 via-[#FF6200] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-[13.5px] rounded-full shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
        >
          <span>Create Lease Vault</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Secondary CTA (Tenant: Pure White Capsule Pill) */}
        <button
          onClick={() => {
            setShowTenantModal(true);
            setTenantErrorMsg(null);
          }}
          className="w-full py-3 bg-white hover:bg-stone-50 text-stone-800 font-bold text-[13.5px] rounded-full border border-stone-200/90 shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
        >
          <span>Join as Tenant (Pay Deposit)</span>
          <ArrowRight className="w-4 h-4 text-stone-400 stroke-[2.5]" />
        </button>

        {/* Micro-copy */}
        <p className="text-[10px] text-center text-stone-500 font-normal pt-0.5">
          No sign-up or seed phrase needed • 100% Secured by Phone PIN & Fingerprint
        </p>
      </div>

      {/* 5. Real Phone Biometric / Screen PIN Verification Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border-t sm:border border-stone-200 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl text-center space-y-4 text-stone-900">
            
            {/* Biometric Shield Graphic */}
            <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto shadow-md shadow-orange-500/15 relative">
              <Fingerprint className="w-8 h-8 text-orange-600 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-stone-950">
                Phone Screen Lock & Biometrics
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-[260px] mx-auto">
                Authenticate using your phone's fingerprint, Face ID, or screen lock PIN.
              </p>
            </div>

            {/* Status & Error Display */}
            {errorMsg ? (
              <div className="py-3 px-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-1 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Verification Cancelled</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-snug">
                  {errorMsg}
                </p>
              </div>
            ) : (
              <div className="py-2.5 px-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 text-xs">
                {isVerifying ? (
                  <div className="flex items-center justify-center gap-2 text-orange-600 font-bold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Waiting for phone PIN / fingerprint...</span>
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Phone Identity Verified! Opening Vault...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-stone-700 font-medium">
                    <Smartphone className="w-4 h-4 text-orange-500" />
                    <span>Ready to verify with phone hardware</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={handleDeviceLogin}
              disabled={isVerifying || isSuccess}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-[#FF6200] to-amber-500 hover:from-orange-600 text-white font-bold text-sm rounded-full shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer disabled:opacity-75"
            >
              <Fingerprint className="w-4 h-4" />
              <span>
                {isVerifying 
                  ? 'Scanning on Phone...' 
                  : errorMsg 
                  ? 'Try Again with Phone PIN' 
                  : 'Authenticate with Phone PIN / Fingerprint'}
              </span>
            </button>

            <button
              onClick={() => {
                setShowAuthModal(false);
                setErrorMsg(null);
                setIsVerifying(false);
              }}
              className="text-xs text-stone-500 hover:text-stone-700 pt-0.5 font-medium underline cursor-pointer"
            >
              Dismiss & Go Back
            </button>
          </div>
        </div>
      )}

      {/* 6. Real Tenant Phone Biometric / Screen PIN Verification & House Code Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border-t sm:border border-stone-200 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl text-center space-y-4 text-stone-900 max-h-[92vh] overflow-y-auto">
            
            {/* Biometric Graphic */}
            <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto shadow-md shadow-orange-500/15 relative">
              <Smartphone className="w-8 h-8 text-orange-600 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-stone-950">
                Tenant Security & Vault Access
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-[270px] mx-auto">
                Protect your caution deposit with your phone's screen lock PIN or fingerprint.
              </p>
            </div>

            {/* House Code or Link Input */}
            <div className="text-left space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                House Code or Landlord Link (Optional)
              </label>
              <input
                type="text"
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value)}
                placeholder="e.g. LK-4B, HSE-7821 or paste link"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:border-orange-500 focus:bg-white placeholder-stone-400"
              />
              <p className="text-[10px] text-stone-500 leading-snug">
                Enter the code or link your landlord sent you via WhatsApp/SMS. If you don't have one, leave blank to explore.
              </p>
            </div>

            {/* Security Explanation */}
            <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/60 text-left text-[11px] text-stone-700 flex items-start gap-2">
              <Fingerprint className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <span className="leading-snug">
                <strong>Hardware Security:</strong> Whenever you check your deposit or claim your refund at move-out, only your phone PIN can authorize access.
              </span>
            </div>

            {/* Status & Error Display */}
            {tenantErrorMsg ? (
              <div className="py-2.5 px-3 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-1 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Verification Cancelled</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-snug">
                  {tenantErrorMsg}
                </p>
              </div>
            ) : (
              <div className="py-2.5 px-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 text-xs">
                {isTenantVerifying ? (
                  <div className="flex items-center justify-center gap-2 text-orange-600 font-bold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Waiting for phone PIN / fingerprint...</span>
                  </div>
                ) : isTenantSuccess ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Phone Identity Verified! Opening Vault...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-stone-700 font-medium">
                    <Smartphone className="w-4 h-4 text-orange-500" />
                    <span>Ready to verify with phone hardware</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={handleTenantDeviceLogin}
              disabled={isTenantVerifying || isTenantSuccess}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-[#FF6200] to-amber-500 hover:from-orange-600 text-white font-bold text-sm rounded-full shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer disabled:opacity-75"
            >
              <Fingerprint className="w-4 h-4" />
              <span>
                {isTenantVerifying 
                  ? 'Scanning on Phone...' 
                  : tenantErrorMsg 
                  ? 'Try Again with Phone PIN' 
                  : 'Verify Phone PIN & Access Vault'}
              </span>
            </button>

            <button
              onClick={() => {
                setShowTenantModal(false);
                setTenantErrorMsg(null);
                setIsTenantVerifying(false);
              }}
              className="text-xs text-stone-500 hover:text-stone-700 pt-0.5 font-medium underline cursor-pointer"
            >
              Dismiss & Go Back
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
