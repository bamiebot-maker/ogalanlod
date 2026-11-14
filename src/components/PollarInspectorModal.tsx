import React, { useState } from 'react';
import { X, Check, Copy, Cpu } from 'lucide-react';

interface PollarInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PollarInspectorModal: React.FC<PollarInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    {
      title: '1. Pollar Provider & Sponsored Gas Setup',
      desc: 'Configures Stellar Testnet with sponsored fee-bumps and social auth in main.tsx',
      code: `import { PollarProvider } from '@pollar/react';

<PollarProvider
  client={{
    apiKey: 'pk_test_ogalandlord_stellar',
    stellarNetwork: 'testnet',
  }}
  appConfig={{
    application: {
      name: 'OgaLandlord',
      network: 'testnet',
      chains: ['STELLAR'],
      walletProvisioning: 'AT_LOGIN',
      walletCustodyMode: 'INTERNAL', // Embedded wallet
    },
    styles: {
      theme: 'dark',
      accentColor: '#10b981',
      emailEnabled: true,
      embeddedWallets: true,
    },
  }}
>
  <App />
</PollarProvider>`,
    },
    {
      title: '2. Querying Yield Opportunities (`getEarnOpportunities`)',
      desc: 'Retrieves live APY from DeFindex vaults & Blend liquidity pools on Stellar Soroban',
      code: `import { usePollar } from '@pollar/react';

const { getEarnOpportunities, getEarnPosition } = usePollar();

// Fetch opportunities from DeFindex / Blend
const opportunities = await getEarnOpportunities('defindex');
console.log('Active Stellar Yield Vaults:', opportunities);`,
    },
    {
      title: '3. Locking Deposit into Yield Vault (`earnDeposit`)',
      desc: 'Automatically sets up USDC trustline and deposits security deposit into the pool',
      code: `const { earnDeposit } = usePollar();

// Execute deposit into DeFindex Alpha Vault on Stellar
const depositOutcome = await earnDeposit({
  opportunity: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  amount: '500.00', // USDC
  asset: 'USDC',
});
console.log('Stellar Tx Hash:', depositOutcome.hash);`,
    },
    {
      title: '4. SEP-43 Soroban Dual Authorization (`signAuthEntry`)',
      desc: 'Tenant and Landlord cryptographically co-sign the release terms before funds unlock',
      code: `import { signAuthEntry } from '@pollar/core';

// Sign Soroban authorization entry for mutual release
const authEntryXdr = buildEscrowReleaseXdr({
  vaultId: 'VL-7821',
  tenantPayout: '516.84', // Principal + 80% yield
  landlordBonus: '4.21',   // 20% yield
});

// Each party signs via Pollar smart account
const signedEntry = await signAuthEntry(authEntryXdr, {
  signer: wallet.address,
});`,
    },
    {
      title: '5. End-of-Lease Withdraw & Distribution (`earnWithdraw`)',
      desc: 'Unwinds the yield position and disburses funds to both parties on Stellar',
      code: `const { earnWithdraw, sendPayment } = usePollar();

// 1. Withdraw principal + yield from vault
await earnWithdraw({
  opportunity: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  amount: '521.05',
});

// 2. Disburse principal + 80% yield to Tenant
await sendPayment({
  destination: tenantAddress,
  amount: '516.84',
  asset: 'USDC',
});

// 3. Disburse 20% yield performance bonus to Landlord
await sendPayment({
  destination: landlordAddress,
  amount: '4.21',
  asset: 'USDC',
});`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Pollar SDK Technical Architecture</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  v0.12.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official primitives powering OgaLandlord on Stellar Soroban
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Runtime Badge Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Chain</div>
              <div className="text-xs font-bold text-white mt-1">Stellar Testnet</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Gas Fee Model</div>
              <div className="text-xs font-bold text-emerald-400 mt-1">Pollar Sponsored ($0.00)</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Wallet Custody</div>
              <div className="text-xs font-bold text-indigo-400 mt-1">Internal (No Seed Phrases)</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">DeFi Engine</div>
              <div className="text-xs font-bold text-cyan-400 mt-1">DeFindex & Blend</div>
            </div>
          </div>

          {/* Snippets */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Integrated Pollar Primitives:
            </h3>

            {codeSnippets.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => copyCode(item.code, idx)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
                  <code>{item.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Stellar Soroban Escrow & DeFi Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
