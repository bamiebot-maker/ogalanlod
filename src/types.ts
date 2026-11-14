export type VaultStatus = 
  | 'awaiting_deposit' 
  | 'earning_yield' 
  | 'settlement_requested' 
  | 'fully_settled';

export interface YieldPool {
  id: string;
  name: string;
  provider: 'DeFindex' | 'Blend' | 'Aquarius';
  apy: number;
  asset: string;
  contractId: string;
  riskScore: 'Low' | 'Medium';
  description: string;
}

export interface SettlementTerms {
  deductions: number;
  deductionReason?: string;
  finalTenantPayout: number;
  finalLandlordYield: number;
  settledAt?: string;
}

export interface UserProfile {
  id: string; // e.g. LND-88421 or TNT-33019
  name: string;
  email: string;
  role: 'landlord' | 'tenant';
  avatarUrl: string;
  stellarAddress: string;
}

export interface LeaseVault {
  id: string; // e.g. HSE-7821
  houseCode: string; // e.g. LK-4B
  propertyName: string;
  propertyAddress: string;
  landlordId: string; // e.g. LND-88421
  landlordName: string;
  landlordAddress: string;
  landlordAvatar?: string;
  tenantId: string; // e.g. TNT-33019
  tenantName: string;
  tenantEmail: string;
  tenantAddress?: string;
  tenantAvatar?: string;
  depositAmount: number; // in USDC
  leaseDurationMonths: number;
  yieldSplitTenantPercent: number; // e.g. 80%
  selectedPool: YieldPool;
  status: VaultStatus;
  createdAt: string;
  startDate?: string;
  depositTxHash?: string;
  settlementTxHash?: string;
  accruedYield: number;
  simulatedMonthsElapsed: number;
  tenantSignature?: string;
  landlordSignature?: string;
  settlementTerms?: SettlementTerms;
}
