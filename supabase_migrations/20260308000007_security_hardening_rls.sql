-- 🛡️ JAMALISO SECURITY HARDENING: MULTI-TENANT ISOLATION (RLS)
-- Target: Fix leaks where any authenticated user can see data from other restaurants.

-- 1. Helper function to get current user's restaurant_id
-- We use SECURITY DEFINER to bypass RLS during the lookup in the profiles table.
CREATE OR REPLACE FUNCTION public.get_my_restaurant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT restaurant_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. HARDENING: Orders Policy
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON public.orders;
CREATE POLICY "Staff can view own restaurant orders" 
ON public.orders FOR SELECT 
USING (restaurant_id = public.get_my_restaurant_id());

DROP POLICY IF EXISTS "Staff can manage orders" ON public.orders;
CREATE POLICY "Staff can manage own restaurant orders"
ON public.orders FOR ALL
USING (restaurant_id = public.get_my_restaurant_id())
WITH CHECK (restaurant_id = public.get_my_restaurant_id());

-- 3. HARDENING: Shifts Policy
DROP POLICY IF EXISTS "Anyone authenticated can view shifts" ON public.shifts;
CREATE POLICY "Staff can view own restaurant shifts" 
ON public.shifts FOR SELECT 
USING (restaurant_id = public.get_my_restaurant_id());

DROP POLICY IF EXISTS "Users can manage own shifts" ON public.shifts;
CREATE POLICY "Staff can manage own shifts" 
ON public.shifts FOR ALL 
USING (restaurant_id = public.get_my_restaurant_id());

-- 4. HARDENING: Cashbox Sessions & Movements
DROP POLICY IF EXISTS "Users can view their sessions" ON public.cashbox_sessions;
CREATE POLICY "Users can view own restaurant sessions" 
ON public.cashbox_sessions FOR SELECT 
USING (restaurant_id = public.get_my_restaurant_id());

DROP POLICY IF EXISTS "Staff can open sessions" ON public.cashbox_sessions;
CREATE POLICY "Staff can open own restaurant sessions" 
ON public.cashbox_sessions FOR INSERT 
WITH CHECK (restaurant_id = public.get_my_restaurant_id());

DROP POLICY IF EXISTS "Staff can insert movements" ON public.cash_movements;
CREATE POLICY "Staff can insert own restaurant movements" 
ON public.cash_movements FOR INSERT 
WITH CHECK (restaurant_id = public.get_my_restaurant_id());

-- 5. HARDENING: Tables (Staff management)
DROP POLICY IF EXISTS "Staff can manage tables" ON public.tables;
CREATE POLICY "Staff can manage own restaurant tables" 
ON public.tables FOR ALL 
USING (restaurant_id = public.get_my_restaurant_id());

-- 6. HARDENING: Profiles (Self & Restaurant Coworkers)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view same restaurant profiles" 
ON public.profiles FOR SELECT 
USING (restaurant_id = public.get_my_restaurant_id() OR id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 7. HARDENING: Inventory & Recipes
DROP POLICY IF EXISTS "Staff can view inventory movements" ON public.inventory_movements;
CREATE POLICY "Staff can view own restaurant inventory" 
ON public.inventory_movements FOR SELECT 
USING (restaurant_id = public.get_my_restaurant_id());

-- 8. HARDENING: Reservations (Security Fix)
DROP POLICY IF EXISTS "Staff can manage reservations" ON public.reservations;
CREATE POLICY "Staff can manage own restaurant reservations" 
ON public.reservations FOR ALL 
USING (restaurant_id = public.get_my_restaurant_id());

-- 9. Secure Search Indices for Multi-Tenant performance
CREATE INDEX IF NOT EXISTS idx_security_audit_restaurant_lookup ON public.security_audit(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_lookup ON public.orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_lookup ON public.profiles(restaurant_id);

-- 10. Force Reload Schema
NOTIFY pgrst, 'reload schema';
