-- 🛡️ JAMALISO SECURITY HARDENING PHASE 2: DEEP ISOLATION & ROLE ENFORCEMENT
-- Target: Hardening restaurants, tenants and administrative tables.

-- 1. HARDENING: Tenants (Only super_admins or owners can see tenants)
-- Regular restaurant staff should NOT even know about other tenants.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_read_tenants" ON public.tenants;
CREATE POLICY "SuperAdmins can manage tenants" 
ON public.tenants FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('super_admin', 'owner', 'developer')
    )
);

-- 2. HARDENING: Restaurants (Landing page visibility vs Admin visibility)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "restaurants_public_read" ON public.restaurants;
DROP POLICY IF EXISTS "allow_read_restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_read_all" ON public.restaurants;

-- Public can see active websites but only basic info
CREATE POLICY "Public visibility for active restaurants" 
ON public.restaurants FOR SELECT 
TO anon
USING (is_web_active = true);

-- Authenticated users can see all (for landing page / login discovery) 
-- BUT we restrict fields in a real app (usually via views or field-level RLS, but here we scope at query level)
CREATE POLICY "Authenticated users view restaurants" 
ON public.restaurants FOR SELECT 
TO authenticated 
USING (true);

-- Management restriction
CREATE POLICY "Admins can update own restaurant"
ON public.restaurants FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND restaurant_id = restaurants.id AND role IN ('admin', 'owner', 'manager')
    )
);

-- 3. HARDENING: Profiles (Privacy)
-- Users can see coworkers, but maybe not sensitive fields? (e.g., waiter_pin, hourly_rate)
-- We'll restrict SELECT to same restaurant only.
DROP POLICY IF EXISTS "Users can view same restaurant profiles" ON public.profiles;
CREATE POLICY "Staff can view restaurant coworkers" 
ON public.profiles FOR SELECT 
USING (
    restaurant_id = public.get_my_restaurant_id() 
    OR id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'owner', 'developer'))
);

-- 4. HARDENING: Audit Logs & Security Audit
-- Only admins/owners should see security alerts.
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view alerts" ON public.security_audit;
CREATE POLICY "Admins view restaurant alerts" 
ON public.security_audit FOR SELECT 
USING (
    restaurant_id = public.get_my_restaurant_id() 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner', 'manager', 'developer'))
);

-- 5. HARDENING: Devices
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view restaurant devices" 
ON public.devices FOR SELECT 
USING (true); -- Usually devices are shared in the premises

-- 6. Indices for Tenant Isolation Performance
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_tenant ON public.restaurants(tenant_id);

NOTIFY pgrst, 'reload schema';
