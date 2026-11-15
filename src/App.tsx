import { useState, useEffect } from 'react';
import { OnboardingHero } from './components/OnboardingHero';
import { LandlordDashboardView } from './components/LandlordDashboardView';
import { ActivePropertiesView } from './components/ActivePropertiesView';
import { MobileHouseVaultView } from './components/MobileHouseVaultView';
import { MobileYieldTracker } from './components/MobileYieldTracker';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ShareTenantLinkModal } from './components/ShareTenantLinkModal';
import { BankSetupModal } from './components/BankSetupModal';
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

  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('vault') || params.get('role')) return true;
    return localStorage.getItem('ogalandlord_onboarded') === 'true';
  });

  const [selectedVault, setSelectedVault] = useState<LeaseVault | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'properties' | 'split' | 'yield' | 'inspector'>('home');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetVault, setShareTargetVault] = useState<LeaseVault | null>(null);
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
        name: roleParam === 'tenant' ? 'Emeka Nwosu' : 'Chief Babatunde Alabi',
      }));
      setHasOnboarded(true);
    }

    if (vaultId) {
      setHasOnboarded(true);
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

  const handleOpenShare = (vault: LeaseVault) => {
    setShareTargetVault(vault);
    setIsShareModalOpen(true);
  };

  const currentVaultToDisplay = selectedVault || vaults[0];

  // ==========================================
  // VIEW 1: FIRST-TIME ONBOARDING (Modeled after Image 1)
  // ==========================================
  if (!hasOnboarded) {
    return (
      <div className="h-[100dvh] w-full bg-[#F4EFE6] sm:bg-gradient-to-tr sm:from-[#F0EBE1] sm:via-[#FAF7F2] sm:to-[#F5EFE6] flex flex-col items-center justify-center sm:py-6 antialiased selection:bg-orange-500/20 selection:text-orange-900 overflow-hidden">
        <div className="w-full max-w-md h-full sm:h-[844px] sm:max-h-[92vh] bg-[#FAF7F2] sm:rounded-[36px] sm:shadow-2xl sm:shadow-orange-950/10 sm:border sm:border-stone-200/80 relative flex flex-col overflow-hidden">
          <OnboardingHero
            onStartLandlord={() => {
              setUser((prev) => ({
                ...prev,
                role: 'landlord',
                name: 'Chief Babatunde Alabi',
              }));
              localStorage.setItem('ogalandlord_onboarded', 'true');
              setHasOnboarded(true);
              setActiveTab('home');
            }}
            onStartTenant={() => {
              setUser((prev) => ({
                ...prev,
                role: 'tenant',
                name: 'Emeka Nwosu',
              }));
              localStorage.setItem('ogalandlord_onboarded', 'true');
              setHasOnboarded(true);
              setSelectedVault(vaults[0]);
              setActiveTab('split');
            }}
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED APP (Modeled after Image 2)
  // ==========================================
  return (
    <div className="h-[100dvh] w-full bg-[#F4EFE6] sm:bg-gradient-to-tr sm:from-[#F0EBE1] sm:via-[#FAF7F2] sm:to-[#F5EFE6] flex flex-col items-center justify-center sm:py-6 antialiased selection:bg-orange-500/20 selection:text-orange-900 overflow-hidden">
      
      {/* Mobile-first App Container with Fixed Height on Mobile */}
      <div className="w-full max-w-md h-full sm:h-[850px] sm:max-h-[92vh] bg-[#FAF7F2] sm:rounded-[36px] sm:shadow-2xl sm:shadow-orange-950/10 sm:border sm:border-stone-200/80 relative flex flex-col overflow-hidden">
        
        {/* Strictly Fixed Header Bar: Never moves during scroll */}
        <header className="sticky top-0 z-30 shrink-0 px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-stone-200/80 bg-[#FAF7F2]/95 backdrop-blur-md shadow-xs">
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-black text-stone-950 tracking-tight flex items-center gap-1">
                OgaLandlord
              </span>
              <span className="text-[9px] text-orange-600 font-bold block -mt-0.5">
                Pollar Stellar DeFi
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Quick Role Switcher Pill */}
            <button
              onClick={handleToggleRole}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm ${
                user.role === 'landlord'
                  ? 'bg-orange-500 text-white border border-orange-600 shadow-orange-500/20'
                  : 'bg-white text-stone-800 border border-stone-300'
              }`}
              title="Click to toggle between Landlord View and Tenant View"
            >
              {user.role === 'landlord' ? (
                <>
                  <Building className="w-2.5 h-2.5 text-white" />
                  <span>Landlord View</span>
                </>
              ) : (
                <>
                  <User className="w-2.5 h-2.5 text-orange-500" />
                  <span>Tenant View</span>
                </>
              )}
            </button>

            {/* Pollar Inspector Modal Button */}
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="p-1 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 transition-colors shadow-sm"
              title="Inspect Pollar SDK Integration"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            </button>
          </div>
        </header>

        {/* Role Switch Feedback Toast (Stationary) */}
        {roleToast && (
          <div className="bg-orange-500 text-white px-3 py-1.5 text-center text-[10px] font-bold shadow-sm animate-fadeIn shrink-0 z-20">
            {roleToast}
          </div>
        )}

        {/* Hackathon Judge Interactive Guide Banner (Stationary) */}
        {showJudgeTip && (
          <div className="bg-orange-50 border-b border-orange-200/80 px-3.5 py-1.5 flex items-center justify-between text-[10px] text-stone-800 shrink-0 z-20">
            <span className="truncate">
              <strong className="text-orange-600 font-bold">💡 Judge Tip:</strong> Tap top pill to switch roles. In Tenant view, test the on-ramp checkout!
            </span>
            <button
              onClick={() => setShowJudgeTip(false)}
              className="text-stone-400 hover:text-stone-700 ml-2 text-[10px] font-bold px-1"
              title="Dismiss Tip"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Screen Content: Only this scrolls underneath the immovable header */}
        <main className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-32">
          {activeTab === 'properties' ? (
            <ActivePropertiesView
              vaults={vaults}
              onSelectVault={(v) => {
                setSelectedVault(v);
                setActiveTab('split');
              }}
              onOpenCreate={() => setIsCreateOpen(true)}
              onOpenShare={handleOpenShare}
            />
          ) : activeTab === 'split' ? (
            <MobileHouseVaultView
              vault={currentVaultToDisplay}
              onBack={() => {
                setSelectedVault(null);
                setActiveTab(user.role === 'landlord' ? 'properties' : 'home');
              }}
              onUpdateVault={handleUpdateVault}
              currentRole={user.role}
            />
          ) : activeTab === 'yield' ? (
            <MobileYieldTracker
              user={user}
              vaults={vaults}
              onOpenCreate={() => setIsCreateOpen(true)}
              onOpenProfile={() => setIsBankModalOpen(true)}
            />
          ) : (
            // HOME TAB: Modeled directly after Attached Image 2
            user.role === 'landlord' ? (
              <LandlordDashboardView
                user={user}
                vaults={vaults}
                selectedVault={currentVaultToDisplay}
                onSelectVault={(v) => {
                  setSelectedVault(v);
                  setActiveTab('split');
                }}
                onOpenCreate={() => setIsCreateOpen(true)}
                onOpenBank={() => setIsBankModalOpen(true)}
                onOpenShare={handleOpenShare}
                onSwitchTab={(t) => {
                  if (t === 'yield') setActiveTab('yield');
                  if (t === 'properties') setActiveTab('properties');
                  if (t === 'vault') setActiveTab('split');
                }}
                onOpenInspector={() => setIsInspectorOpen(true)}
              />
            ) : (
              <MobileHouseVaultView
                vault={currentVaultToDisplay}
                onBack={() => {
                  setSelectedVault(null);
                  setActiveTab('home');
                }}
                onUpdateVault={handleUpdateVault}
                currentRole={user.role}
              />
            )
          )}
        </main>

        {/* Floating Bottom Nav (With Multi-Property Support) */}
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
          onOpenBank={() => setIsBankModalOpen(true)}
        />
      </div>

      {/* MODALS */}
      
      {/* 1. Share Tenant Link / WhatsApp Modal */}
      <ShareTenantLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        vault={shareTargetVault}
      />

      {/* 2. My Bank Setup Modal (NUBAN Verification) */}
      <BankSetupModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        landlordName={user.name}
      />

      {/* 3. Create New House Vault Modal */}
      <CreateVaultModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateVault={handleCreateVault}
      />

      {/* 4. Pollar SDK Inspector Modal */}
      <PollarInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </div>
  );
}

export default App;
