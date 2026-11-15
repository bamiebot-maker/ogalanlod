import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Share2 } from 'lucide-react';
import type { LeaseVault } from '../types';

interface ShareTenantLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: LeaseVault | null;
}

export const ShareTenantLinkModal: React.FC<ShareTenantLinkModalProps> = ({
  isOpen,
  onClose,
  vault,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !vault) return null;

  const tenantLink = `${window.location.origin}?vault=${vault.id}&role=tenant`;
  const ngnAmount = (vault.depositAmount * 1500).toLocaleString();

  const handleCopy = () => {
    navigator.clipboard.writeText(tenantLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello ${vault.tenantName},\n\nYour caution deposit for *${vault.propertyName}* is ready to be locked in non-custodial escrow on OgaLandlord.\n\n• Amount: ₦${ngnAmount} ($${vault.depositAmount} USDC)\n• Yield: 8.42% APY (You earn 80% of all interest!)\n• Protected by Stellar Soroban smart contracts.\n\nPlease open this link on your phone to complete your payment:\n${tenantLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4 text-left">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Share2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Invite Tenant to Pay
              </h3>
              <p className="text-[10px] text-slate-400">
                Share unique payment link with tenant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Property Brief Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white truncate max-w-[200px]">
              {vault.propertyName}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[10px] font-bold">
              {vault.houseCode}
            </span>
          </div>
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Tenant: <strong className="text-white">{vault.tenantName}</strong></span>
            <span>Deposit: <strong className="text-emerald-400">₦{ngnAmount}</strong></span>
          </div>
        </div>

        {/* Share Link Input Box */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">
            Unique Tenant Payment Link
          </label>
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-850 p-2 rounded-xl">
            <input
              type="text"
              readOnly
              value={tenantLink}
              className="bg-transparent text-xs text-slate-300 font-mono flex-1 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white shrink-0 transition-colors"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Actions: WhatsApp & Copy */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleWhatsApp}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 active:scale-98 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            <span>{copied ? 'Link Copied!' : 'Copy Payment Link'}</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-500">
          Tenant pays via Nigerian card, bank transfer, or USDC.
        </p>

      </div>
    </div>
  );
};
