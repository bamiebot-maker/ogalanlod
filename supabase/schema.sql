-- ==============================================================================
-- OgaLandlord: Production Database Schema & Realtime Setup
-- Built for Build with Pollar Hackathon on Boundless
-- ==============================================================================

-- 1. Create the lease_vaults table
CREATE TABLE IF NOT EXISTS public.lease_vaults (
  id TEXT PRIMARY KEY,
  property_name TEXT NOT NULL,
  property_address TEXT NOT NULL,
  landlord_name TEXT NOT NULL,
  landlord_address TEXT NOT NULL,
  tenant_name TEXT NOT NULL,
  tenant_email TEXT NOT NULL,
  tenant_address TEXT,
  deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
  lease_duration_months INTEGER NOT NULL DEFAULT 12,
  yield_split_tenant_percent INTEGER NOT NULL DEFAULT 80,
  selected_pool JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'awaiting_deposit',
  accrued_yield NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  simulated_months_elapsed INTEGER NOT NULL DEFAULT 0,
  tenant_signature TEXT,
  landlord_signature TEXT,
  deposit_tx_hash TEXT,
  settlement_tx_hash TEXT,
  settlement_terms JSONB,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes for high performance querying across different landlords and tenants
CREATE INDEX IF NOT EXISTS idx_lease_vaults_landlord ON public.lease_vaults (landlord_address);
CREATE INDEX IF NOT EXISTS idx_lease_vaults_tenant ON public.lease_vaults (tenant_email);
CREATE INDEX IF NOT EXISTS idx_lease_vaults_status ON public.lease_vaults (status);
CREATE INDEX IF NOT EXISTS idx_lease_vaults_updated_at ON public.lease_vaults (updated_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.lease_vaults ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for seamless hackathon demonstration
DROP POLICY IF EXISTS "Public full access for lease_vaults" ON public.lease_vaults;
CREATE POLICY "Public full access for lease_vaults" 
ON public.lease_vaults 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Enable Supabase Realtime so changes on a tenant phone appear on landlord screen instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.lease_vaults;

-- 5. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_lease_vaults_updated_at ON public.lease_vaults;
CREATE TRIGGER set_lease_vaults_updated_at
BEFORE UPDATE ON public.lease_vaults
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 6. Insert initial test houses so new databases are not empty
INSERT INTO public.lease_vaults (
  id, property_name, property_address, landlord_name, landlord_address,
  tenant_name, tenant_email, tenant_address, deposit_amount, lease_duration_months,
  yield_split_tenant_percent, selected_pool, status, accrued_yield, simulated_months_elapsed,
  deposit_tx_hash, data
) VALUES (
  'VL-7821',
  'Lekki Phase 1 Luxury Penthouse - Flat 4B',
  '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  'Chief Babatunde Alabi',
  'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  'Emeka Nwosu',
  'emeka.nwosu@example.com',
  'GBTYMDF3J7V5Y4U2K6N3W9D8R1T0P4Q7S5V2X8Z1B6C9F3H5J7L2N4P6',
  500.00,
  12,
  80,
  '{"id": "defindex-usdc-alpha", "name": "DeFindex USDC Alpha Vault", "provider": "DeFindex", "apy": 8.42, "asset": "USDC", "contractId": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", "riskScore": "Low", "description": "Auto-compounding diversified yield vault on Stellar Soroban protocols."}'::jsonb,
  'earning_yield',
  21.05,
  6,
  '3a88fc009d784a32bfba91739c9f28d89e512479f6d1dcb75f28c24cf745199e',
  '{"id": "VL-7821", "propertyName": "Lekki Phase 1 Luxury Penthouse - Flat 4B", "propertyAddress": "14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria", "landlordName": "Chief Babatunde Alabi", "landlordAddress": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", "tenantName": "Emeka Nwosu", "tenantEmail": "emeka.nwosu@example.com", "tenantAddress": "GBTYMDF3J7V5Y4U2K6N3W9D8R1T0P4Q7S5V2X8Z1B6C9F3H5J7L2N4P6", "depositAmount": 500, "leaseDurationMonths": 12, "yieldSplitTenantPercent": 80, "status": "earning_yield", "accruedYield": 21.05, "simulatedMonthsElapsed": 6, "depositTxHash": "3a88fc009d784a32bfba91739c9f28d89e512479f6d1dcb75f28c24cf745199e", "createdAt": "2026-05-18T10:00:00.000Z", "selectedPool": {"id": "defindex-usdc-alpha", "name": "DeFindex USDC Alpha Vault", "provider": "DeFindex", "apy": 8.42, "asset": "USDC", "contractId": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", "riskScore": "Low", "description": "Auto-compounding diversified yield vault on Stellar Soroban protocols."}}'::jsonb
) ON CONFLICT (id) DO NOTHING;

