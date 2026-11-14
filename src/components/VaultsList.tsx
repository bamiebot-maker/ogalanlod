import React from 'react';
import type { LeaseVault } from '../types';
import { Building, ArrowRight } from 'lucide-react';
import { calculateYield } from '../services/pollarService';

interface VaultsListProps {
  vaults: LeaseVault[];
  onSelectVault: (vault: LeaseVault) => void;
  onOpenCreateModal: () => void;
}

export const VaultsList: React.FC<VaultsListProps> = ({
  vaults,
  onSelectVault,
  onOpenCreateModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Active Lease Escrow Vaults
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Transparent security deposit management powered by Pollar Stellar DeFi
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>+ Create New Vault</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vaults.map((vault) => {
          const yieldData = calculateYield(
            vault.depositAmount, 
            vault.selectedPool.apy, 
            vault.simulatedMonthsElapsed || 0
          );

          return (
            <div
              key={vault.id}
              onClick={() => onSelectVault(vault)}
              className="group cursor-pointer p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/5 relative overflow-hidden"
            >
              {/* Status Header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  vault.status === 'earning_yield'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : vault.status === 'awaiting_deposit'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    : vault.status === 'settlement_requested'
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                    : 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                }`}>
                  {vault.status === 'awaiting_deposit' && 'Awaiting Deposit'}
                  {vault.status === 'earning_yield' && 'Earning Yield (Active)'}
                  {vault.status === 'settlement_requested' && 'Settlement Pending'}
                  {vault.status === 'fully_settled' && 'Settled'}
                </span>

                <span className="text-xs font-mono text-slate-400">
                  {vault.id}
                </span>
              </div>

              {/* Property Details */}
              <div className="flex items-start space-x-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-slate-800/80 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {vault.propertyName}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {vault.propertyAddress}
                  </p>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center mb-4">
                <div>
                  <div className="text-[10px] text-slate-400">Deposit Locked</div>
                  <div className="text-sm font-mono font-bold text-white mt-0.5">
                    ${vault.depositAmount.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">USDC</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400">Strategy APY</div>
                  <div className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                    {vault.selectedPool.apy}%
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400">Yield Earned</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    +${yieldData.accrued.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="truncate max-w-[200px]">
                  Tenant: <strong className="text-slate-300">{vault.tenantName}</strong>
                </span>
                <span className="flex items-center space-x-1 text-emerald-400 group-hover:translate-x-1 transition-transform font-medium">
                  <span>Inspect Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
