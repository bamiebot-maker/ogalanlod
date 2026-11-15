import type { LeaseVault, YieldPool, UserProfile } from '../types';

export const DEFAULT_USER: UserProfile = {
  id: 'LND-88421',
  name: 'Landlord',
  email: 'landlord@ogalandlord.ng',
  role: 'landlord',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  stellarAddress: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
};

export const AVAILABLE_YIELD_POOLS: YieldPool[] = [
  {
    id: 'defindex-usdc-alpha',
    name: 'DeFindex USDC Alpha Vault',
    provider: 'DeFindex',
    apy: 8.42,
    asset: 'USDC',
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    riskScore: 'Low',
    description: 'Auto-compounding diversified yield vault on Stellar Soroban protocols.',
  },
  {
    id: 'blend-usdc-lending',
    name: 'Blend Protocol Fixed USDC Pool',
    provider: 'Blend',
    apy: 7.85,
    asset: 'USDC',
    contractId: 'CBLND7G24K7V9302KFMCV93KDMD0291KD0194JD92KFK0281JD92KF90',
    riskScore: 'Low',
    description: 'Decentralized liquidity market on Stellar with overcollateralized lending.',
  },
  {
    id: 'aquarius-stellar-yield',
    name: 'Aquarius Liquidity Yield Core',
    provider: 'Aquarius',
    apy: 6.90,
    asset: 'USDC',
    contractId: 'CAQUAR924JD81938FND918374ND918374ND918374ND918374ND918374N',
    riskScore: 'Medium',
    description: 'Automated market maker protocol providing steady transaction-fee yield.',
  },
];

export const INITIAL_VAULTS: LeaseVault[] = [];
