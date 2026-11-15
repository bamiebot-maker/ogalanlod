import { useState, useEffect } from 'react';
import { MobileDashboard } from './components/MobileDashboard';
import { MobileHouseVaultView } from './components/MobileHouseVaultView';
import { MobileYieldTracker } from './components/MobileYieldTracker';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { CreateVaultModal } from './components/CreateVaultModal';
import { PollarInspectorModal } from './components/PollarInspectorModal';
import { INITIAL_VAULTS, DEFAULT_USER } from './data/mockData';
import type { LeaseVault, UserProfile } from './types';
import { saveVault, fetchAllVaults, fetchVaultById } from './services/supabase';
import { Shield, Sparkles, User, Building } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ogalandlord_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USER;
  });

  const [vaults, setVaults] = useState<LeaseVault[]>(() => {
    const saved = localStorage.getItem('ogalandlord_vaults');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_VAULTS;
  });

  const [selectedVault, setSelectedVault] = useState<LeaseVault | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'split' | 'yield' | 'inspector'>('home');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [roleToast, setRoleToast] = useState<string | null>(null);
  const [showJudgeTip, setShowJudgeTip] = useState(true);

  // Sync user & vaults to localStorage
  useEffect(() => {
    localStorage.setItem('ogalandlord_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ogalandlord_vaults', JSON.stringify(vaults));
  }, [vaults]);

  // Initial cloud sync from Supabase
  useEffect(() => {
    async function loadCloud() {
      const cloudVaults = await fetchAllVaults();
      if (cloudVaults && cloudVaults.length > 0) {
        setVaults(cloudVaults);
      }
    }
    loadCloud();
  }, []);

  // Handle URL parameters for direct shareable links (?vault=HSE-7821&role=tenant)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vaultId = params.get('vault');
    const roleParam = params.get('role');

    if (roleParam === 'tenant' || roleParam === 'landlord') {
      setUser((prev) => ({
        ...prev,
        role: roleParam,
      }));
    }

    if (vaultId) {
      const found = vaults.find((v) => v.id === vaultId);
      if (found) {
        setSelectedVault(found);
        setActiveTab('split');
      } else {
        fetchVaultById(vaultId).then((cloudVault) => {
          if (cloudVault) {
            setSelectedVault(cloudVault);
            setVaults((prev) => [cloudVault, ...prev.filter((v) => v.id !== cloudVault.id)]);
            setActiveTab('split');
          }
        });
      }
    }
  }, [vaults]);

  const handleCreateVault = (newVault: LeaseVault) => {
    setVaults([newVault, ...vaults]);
    setSelectedVault(newVault);
    setActiveTab('split');
    saveVault(newVault);
  };

  const handleUpdateVault = (updated: LeaseVault) => {
    setVaults(vaults.map((v) => (v.id === updated.id ? updated : v)));
    setSelectedVault(updated);
    saveVault(updated);
  };

  const handleToggleRole = () => {
    const nextRole = user.role === 'landlord' ? 'tenant' : 'landlord';
    setUser((prev) => ({
      ...prev,
      role: nextRole,
      id: nextRole === 'landlord' ? 'LND-88421' : 'TNT-33108',
      name: nextRole === 'landlord' ? 'Chief Babatunde Alabi' : 'Emeka Nwosu',
      avatarUrl: nextRole === 'landlord'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    }));
    setRoleToast(
      nextRole === 'landlord'
        ? 'Switched to Landlord View (Chief Babatunde Alabi — Managing Properties)'
        : 'Switched to Tenant View (Emeka Nwosu — Rental Escrow & Payout)'
    );
    setTimeout(() => setRoleToast(null), 3000);
  };

  const currentVaultToDisplay = selectedVault || vaults[0];

  return (
    <div className="min-h-screen bg-[#0d1117] sm:bg-gradient-to-tr sm:from-[#0b0f14] sm:via-[#111822] sm:to-[#081513] flex flex-col items-center justify-start sm:py-6 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Mobile-first App Container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] bg-slate-950 sm:rounded-[36px] sm:shadow-2xl sm:shadow-emerald-950/30 sm:border sm:border-slate-800/80 relative flex flex-col justify-between">
        
        {/* Real App Header Bar with Role Switcher & Pollar Badge */}
        <header className="px-4 pt-3 pb-2.5 flex items-center justify-between z-20 border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
                OgaLandlord
              </span>
              <span className="text-[9px] text-emerald-400/80 font-medium block -mt-0.5">
                Pollar Stellar DeFi
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Quick Role Switcher Pill (Great for Hackathon Judges & Testing) */}
            <button
              onClick={handleToggleRole}
              className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                user.role === 'landlord'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
              title="Click to toggle between Landlord View and Tenant View"
            >
              {user.role === 'landlord' ? (
                <>
                  <Building className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Landlord View</span>
                </>
              ) : (
                <>
                  <User className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Tenant View</span>
                </>
              )}
            </button>

            {/* Pollar Inspector Modal Button */}
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 font-mono transition-colors"
              title="Inspect Pollar SDK Integration"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </header>

        {/* Role Switch Feedback Toast */}
        {roleToast && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-3 py-1.5 text-center text-[10px] font-bold text-emerald-300 animate-fadeIn">
            {roleToast}
          </div>
        )}

        {/* Hackathon Judge Interactive Guide Banner */}
        {showJudgeTip && (
          <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-cyan-950/90 border-b border-emerald-500/30 px-3.5 py-1.5 flex items-center justify-between text-[10px] text-slate-300">
            <span className="truncate">
              <strong className="text-emerald-400">💡 Judge Tip:</strong> Tap the top pill to switch between Landlord and Tenant to test on-ramp payment.
            </span>
            <button
              onClick={() => setShowJudgeTip(false)}
              className="text-slate-400 hover:text-white ml-2 text-[10px] font-bold px-1"
              title="Dismiss Tip"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Screen Content with Safe Bottom Margin for Floating Nav */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-32">
          {activeTab === 'split' ? (
            <MobileHouseVaultView
              vault={currentVaultToDisplay}
              onBack={() => {
                setSelectedVault(null);
                setActiveTab('home');
              }}
              onUpdateVault={handleUpdateVault}
              currentRole={user.role}
            />
          ) : activeTab === 'yield' ? (
            <MobileYieldTracker
              user={user}
              vaults={vaults}
              onOpenCreate={() => setIsCreateOpen(true)}
              onOpenProfile={() => setIsOnboardingOpen(true)}
            />
          ) : (
            <MobileDashboard
              user={user}
              vaults={vaults}
              onSelectVault={(v) => {
                setSelectedVault(v);
                setActiveTab('split');
              }}
              onOpenCreate={() => setIsCreateOpen(true)}
              onOpenProfile={() => setIsOnboardingOpen(true)}
              onSwitchTab={(t) => {
                if (t === 'yield') setActiveTab('yield');
                if (t === 'vault') setActiveTab('split');
              }}
            />
          )}
        </main>

        {/* Floating Bottom Nav */}
        <MobileBottomNav
          activeTab={activeTab}
          userRole={user.role}
          onSelectTab={(tab) => {
            if (tab === 'inspector') {
              setIsInspectorOpen(true);
            } else {
              if (tab === 'home') setSelectedVault(null);
              setActiveTab(tab);
            }
          }}
          onOpenCreate={() => setIsCreateOpen(true)}
        />
      </div>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={(newProfile) => {
          setUser(newProfile);
          setIsOnboardingOpen(false);
        }}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <CreateVaultModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateVault={handleCreateVault}
      />

      <PollarInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </div>
  );
}

export default App;