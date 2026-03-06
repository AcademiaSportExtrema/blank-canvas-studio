## Problem Diagnosis

There are **two issues** preventing the app from working after login:

### Issue 1: No role assigned to the user

The user `analistaadmsport@gmail.com` (id: `4242b925-f435-4ffb-9860-560ab4acbf7e`) successfully authenticates, but has **no row in `user_roles**`. The `useAuth` hook fetches the role, gets nothing back, logs "Failed to fetch user role: null", and sets `role = null`. The `Login` page's redirect `useEffect` only fires when `user && role` are both truthy -- so the user stays stuck on `/login`.

### Issue 2: Empty Supabase types file

The `src/integrations/supabase/types.ts` was regenerated with empty tables (`[_ in never]: never`), which causes 50+ TypeScript build errors across the codebase. Every `supabase.from('table_name')` call fails because TypeScript doesn't know any tables exist.

## Plan

### Step 1: Insert a user_role (super admin) for the existing user

Run a SQL migration to insert an admin role for the user, linked to the existing empresa:

```sql
INSERT INTO public.user_roles (user_id, role, empresa_id)
VALUES (
  '4242b925-f435-4ffb-9860-560ab4acbf7e',
  'admin',
  '00000000-0000-0000-0000-000000000001'
);
```

### Step 2: Regenerate `types.ts` from the actual database schema

The types file needs to reflect all 26 tables that exist in the database. This will be done by triggering a types regeneration so the Supabase client knows about `user_roles`, `empresas`, `lancamentos`, etc. This single change will fix all 50+ build errors at once.

### Step 3: Verify the login flow

After both fixes, login should: authenticate -> fetch role (admin) -> redirect to `/dashboard`.

## Technical Details

- The types file cannot be edited manually per project rules; it must be regenerated from the Supabase schema
- The empresa `00000000-0000-0000-0000-000000000001` ("Empresa Principal") is active with `subscription_status = 'active'`
- The `user_roles` table requires `empresa_id` (NOT NULL), so we must include it in the insert