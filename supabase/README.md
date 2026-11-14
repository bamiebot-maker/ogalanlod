# 🗄️ OgaLandlord Supabase Database Setup

This database architecture is designed to support **multiple landlords** and **multiple tenants** simultaneously, ensuring that houses, leases, deposits, and signatures are permanently preserved and synchronized across all devices in real time.

---

## 🚀 Quick Setup Instructions

1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** on the left menu.
3. Click **New Query**, paste the contents of [`schema.sql`](./schema.sql), and click **Run**.
4. That's it! Your `lease_vaults` table is ready with:
   - Indexes on `landlord_address` (to query all houses owned by a landlord).
   - Indexes on `tenant_email` (to query all leases rented by a tenant).
   - Realtime replication enabled (cross-device sync).

---

## 🔑 Environment Configuration

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Table Architecture: `lease_vaults`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | Unique Vault ID (e.g. `VL-7821`) |
| `property_name` | `TEXT` | Property Name (e.g. "Lekki Luxury Penthouse") |
| `property_address`| `TEXT` | Physical address of the rental unit |
| `landlord_name` | `TEXT` | Full name of the landlord |
| `landlord_address`| `TEXT` | Stellar wallet address of the landlord (indexed) |
| `tenant_name` | `TEXT` | Full name of the tenant |
| `tenant_email` | `TEXT` | Tenant email address (indexed) |
| `tenant_address` | `TEXT` | Stellar wallet address of the tenant |
| `deposit_amount` | `NUMERIC` | Security deposit locked in USDC |
| `selected_pool` | `JSONB` | Stellar DeFi pool (DeFindex / Blend APY details) |
| `status` | `TEXT` | `awaiting_deposit` \| `earning_yield` \| `settlement_requested` \| `fully_settled` |
| `accrued_yield` | `NUMERIC` | Real-time compounding interest earned |
| `tenant_signature`| `TEXT` | SEP-43 cryptographic authorization from tenant |
| `landlord_signature`| `TEXT` | SEP-43 cryptographic co-sign from landlord |
| `data` | `JSONB` | Complete JSON payload for zero data loss |

