import { createClient } from '@supabase/supabase-js';
import type { LeaseVault } from '../types';

const DEFAULT_SUPABASE_URL = 'https://leghmjhrtosdfobblwdj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_0PVwMRc_8szcNI_BzgiEyA_COVlORci';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = true;

const TABLE_NAME = 'lease_vaults';

export async function saveVault(vault: LeaseVault): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        id: vault.id,
        property_name: vault.propertyName,
        property_address: vault.propertyAddress,
        landlord_name: vault.landlordName,
        landlord_address: vault.landlordAddress,
        tenant_name: vault.tenantName,
        tenant_email: vault.tenantEmail,
        tenant_address: vault.tenantAddress || null,
        deposit_amount: vault.depositAmount,
        lease_duration_months: vault.leaseDurationMonths,
        yield_split_tenant_percent: vault.yieldSplitTenantPercent,
        selected_pool: vault.selectedPool,
        status: vault.status,
        accrued_yield: vault.accruedYield,
        simulated_months_elapsed: vault.simulatedMonthsElapsed,
        tenant_signature: vault.tenantSignature || null,
        landlord_signature: vault.landlordSignature || null,
        deposit_tx_hash: vault.depositTxHash || null,
        settlement_tx_hash: vault.settlementTxHash || null,
        settlement_terms: vault.settlementTerms || null,
        data: vault,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('[Supabase Upsert Warning]:', error.message);
      // Also cache in localStorage as safety net
      const local = JSON.parse(localStorage.getItem('ogalandlord_vaults') || '[]');
      const updated = [vault, ...local.filter((v: LeaseVault) => v.id !== vault.id)];
      localStorage.setItem('ogalandlord_vaults', JSON.stringify(updated));
      return false;
    }
    console.log(`[Supabase]: Vault ${vault.id} persisted to PostgreSQL successfully.`);
    return true;
  } catch (err) {
    console.error('[Supabase Save Exception]:', err);
    return false;
  }
}

export async function fetchAllVaults(): Promise<LeaseVault[] | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('data')
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[Supabase Fetch Warning]:', error?.message);
      const saved = localStorage.getItem('ogalandlord_vaults');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
      return null;
    }

    console.log(`[Supabase]: Loaded ${data.length} vaults from remote database.`);
    return data.map((row: { data: LeaseVault }) => row.data);
  } catch (err) {
    console.error('[Supabase Fetch Exception]:', err);
    return null;
  }
}

export async function fetchVaultsByLandlord(landlordAddress: string): Promise<LeaseVault[] | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('data')
      .eq('landlord_address', landlordAddress)
      .order('updated_at', { ascending: false });

    if (error || !data) return null;
    return data.map((row: { data: LeaseVault }) => row.data);
  } catch (err) {
    console.error('Failed to fetch vaults by landlord:', err);
    return null;
  }
}

export async function fetchVaultsByTenant(tenantEmail: string): Promise<LeaseVault[] | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('data')
      .eq('tenant_email', tenantEmail)
      .order('updated_at', { ascending: false });

    if (error || !data) return null;
    return data.map((row: { data: LeaseVault }) => row.data);
  } catch (err) {
    console.error('Failed to fetch vaults by tenant:', err);
    return null;
  }
}

export async function fetchVaultById(id: string): Promise<LeaseVault | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('data')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data.data as LeaseVault;
  } catch (err) {
    console.error('Failed to fetch vault by ID:', err);
    return null;
  }
}

export function subscribeToVault(
  vaultId: string, 
  onUpdate: (updatedVault: LeaseVault) => void
) {
  const channel = supabase
    .channel(`vault-${vaultId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
        filter: `id=eq.${vaultId}`,
      },
      (payload) => {
        if (payload.new && (payload.new as { data: LeaseVault }).data) {
          onUpdate((payload.new as { data: LeaseVault }).data);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
