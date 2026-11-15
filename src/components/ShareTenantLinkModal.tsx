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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white border-t sm:border border-stone-200/90 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4 text-left">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-200">
              <Share2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-950">
                Invite Tenant to Pay
              </h3>
              <p className="text-[10px] text-stone-500 font-medium">
                Share unique payment link with tenant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 hover:text-stone-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Property Brief Card */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-stone-950 truncate max-w-[200px]">
              {vault.propertyName}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 font-mono text-[10px] font-black">
              {vault.houseCode}
            </span>
          </div>
          <div className="flex justify-between text-stone-500 text-[11px]">
            <span>Tenant: <strong className="text-stone-900">{vault.tenantName}</strong></span>
            <span>Deposit: <strong className="text-stone-950">₦{ngnAmount}</strong></span>
          </div>
        </div>

        {/* Share Link Input Box */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 mb-1">
            Unique Tenant Payment Link
          </label>
          <div className="flex items-center space-x-1.5 bg-[#FAF7F2] border border-stone-200 p-2 rounded-xl">
            <input
              type="text"
              readOnly
              value={tenantLink}
              className="bg-transparent text-xs text-stone-800 font-mono flex-1 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 shrink-0 transition-colors shadow-sm"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
            </button>
          </div>
        </div>

        {/* Actions: WhatsApp & Copy */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleWhatsApp}
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 active:scale-98 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-3 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-orange-400" /> : <Copy className="w-4 h-4 text-stone-300" />}
            <span>{copied ? 'Link Copied!' : 'Copy Payment Link'}</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-stone-400">
          Tenant pays via Nigerian card, bank transfer, or USDC.
        </p>

      </div>
    </div>
  );
};
