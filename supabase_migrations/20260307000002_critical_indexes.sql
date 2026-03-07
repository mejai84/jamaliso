-- 20260307000002_critical_indexes.sql
-- Índices críticos para performance en tablas de alta consulta
-- Sin estos, cualquier filtro por restaurant_id, status, created_at hace full table scan

-- ══════════════════════════════════════════════
-- ORDERS (tabla más consultada del sistema)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON public.orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON public.orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON public.orders(restaurant_id, created_at DESC);

-- ══════════════════════════════════════════════
-- ORDER_ITEMS (JOIN con orders en KDS, POS, reportes)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON public.order_items(status);

-- ══════════════════════════════════════════════
-- PRODUCTS & CATEGORIES (menú digital, POS)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_products_restaurant_id ON public.products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(restaurant_id, is_available);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(restaurant_id, is_active);

-- ══════════════════════════════════════════════
-- POS_SALES & SALE_PAYMENTS (flujo de caja)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_pos_sales_session ON public.pos_sales(cashbox_session_id);
CREATE INDEX IF NOT EXISTS idx_pos_sales_created ON public.pos_sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_sales_shift ON public.pos_sales(shift_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_sale_id ON public.sale_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_session ON public.sale_payments(cashbox_session_id);

-- ══════════════════════════════════════════════
-- CASH_MOVEMENTS & CASHBOX_SESSIONS (auditoría financiera)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_cash_movements_session ON public.cash_movements(cashbox_session_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_restaurant ON public.cash_movements(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_cashbox_sessions_restaurant ON public.cashbox_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_cashbox_sessions_status ON public.cashbox_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cashbox_sessions_shift ON public.cashbox_sessions(shift_id);

-- ══════════════════════════════════════════════
-- SHIFTS (nómina, reportes de personal)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON public.shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_restaurant ON public.shifts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON public.shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_started ON public.shifts(started_at DESC);

-- ══════════════════════════════════════════════
-- INGREDIENTS & INVENTORY (control de stock)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_ingredients_restaurant ON public.ingredients(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_active ON public.ingredients(restaurant_id, active);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_ingredient ON public.inventory_movements(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON public.inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_restaurant ON public.inventory_movements(restaurant_id);

-- ══════════════════════════════════════════════
-- DELIVERY (asignación y tracking)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_delivery_drivers_active ON public.delivery_drivers(is_active, is_available);
CREATE INDEX IF NOT EXISTS idx_order_deliveries_order ON public.order_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_order_deliveries_driver ON public.order_deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_order_deliveries_status ON public.order_deliveries(delivery_status);

-- ══════════════════════════════════════════════
-- RESERVATIONS (filtro por fecha)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON public.reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date, status);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_date ON public.reservations(restaurant_id, reservation_date);

-- ══════════════════════════════════════════════
-- CUSTOMERS (CRM)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_customers_restaurant ON public.customers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customers_active ON public.customers(restaurant_id, is_active);

-- ══════════════════════════════════════════════
-- AUDIT_LOGS (trazabilidad forense)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_audit_logs_restaurant ON public.audit_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);

-- ══════════════════════════════════════════════
-- PROFILES (auth, permisos, multi-tenant)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_profiles_restaurant ON public.profiles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ══════════════════════════════════════════════
-- PAYROLL (nómina)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON public.payroll_runs(period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_restaurant ON public.payroll_runs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON public.payroll_items(run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON public.payroll_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_novelties_employee ON public.payroll_novelties(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_novelties_restaurant ON public.payroll_novelties(restaurant_id);

-- ══════════════════════════════════════════════
-- PURCHASES & SUPPLIERS (proveedores)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_purchases_restaurant ON public.purchases(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON public.purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON public.purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_restaurant ON public.suppliers(restaurant_id);

-- ══════════════════════════════════════════════
-- RECIPES (costeo de platos)
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_recipes_restaurant ON public.recipes_new(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_product ON public.recipes_new(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_items_recipe ON public.recipe_items(recipe_id);

-- ══════════════════════════════════════════════
-- MISC
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_petty_cash_restaurant ON public.petty_cash_vouchers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_waste_reports_restaurant ON public.waste_reports(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waste_reports_ingredient ON public.waste_reports(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON public.tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_settings_restaurant ON public.settings(restaurant_id);
