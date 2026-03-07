-- 🚀 JAMALISO OS SQUASHED SCHEMA MIGRATION
-- Generated on: 2026-03-07T00:54:02.810Z

CREATE TABLE IF NOT EXISTS public.prep_stations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid,
  name character varying(255) NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid,
  name character varying(255) NOT NULL,
  logo_url text,
  primary_color character varying(20) DEFAULT '#FF6B6B'::character varying,
  domain character varying(255),
  subscription_plan character varying(50) DEFAULT 'partner_standard'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  guest_info jsonb,
  status text DEFAULT 'pending'::text,
  total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  table_id uuid,
  delivery_address jsonb DEFAULT '{}'::jsonb,
  payment_method text DEFAULT 'cash'::text,
  payment_status text DEFAULT 'pending'::text,
  subtotal numeric DEFAULT 0,
  delivery_fee numeric DEFAULT 0,
  notes text,
  order_type text DEFAULT 'delivery'::text,
  preparation_started_at timestamp with time zone,
  preparation_finished_at timestamp with time zone,
  waiter_id uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  restaurant_id uuid,
  deleted_at timestamp with time zone,
  tip_amount numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  service_charge numeric DEFAULT 0,
  priority boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.tables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_number integer NOT NULL,
  table_name character varying(50),
  capacity integer DEFAULT 4,
  qr_code text,
  status character varying(20) DEFAULT 'available'::character varying,
  location character varying(100),
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  parent_table_id uuid,
  is_merged boolean DEFAULT false,
  x_pos integer DEFAULT 0,
  y_pos integer DEFAULT 0,
  width integer DEFAULT 120,
  height integer DEFAULT 120,
  rotation integer DEFAULT 0,
  shape text DEFAULT 'rectangle'::text,
  restaurant_id uuid,
  deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.cash_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cashbox_session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  movement_type text NOT NULL,
  amount numeric NOT NULL,
  description text,
  reference_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  restaurant_id uuid,
  payment_method text
);

CREATE TABLE IF NOT EXISTS public.petty_cash_vouchers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  voucher_number integer NOT NULL DEFAULT nextval('petty_cash_vouchers_voucher_number_seq'::regclass),
  date date NOT NULL DEFAULT CURRENT_DATE,
  beneficiary_name text NOT NULL,
  amount numeric NOT NULL,
  concept text NOT NULL,
  category text DEFAULT 'Otros'::text,
  created_at timestamp with time zone DEFAULT now(),
  status character varying(20) DEFAULT 'draft'::character varying,
  accounting_code character varying(100),
  amount_in_words text,
  cargo text,
  signature_data text,
  restaurant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE TABLE IF NOT EXISTS public.delivery_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  delivery_fee_enabled boolean DEFAULT true,
  delivery_fee numeric DEFAULT 5000,
  free_delivery_threshold numeric,
  max_delivery_radius_km numeric DEFAULT 3,
  estimated_delivery_time_min integer DEFAULT 30,
  estimated_delivery_time_max integer DEFAULT 45,
  restaurant_address text,
  restaurant_lat numeric,
  restaurant_lng numeric,
  restaurant_phone text,
  business_hours jsonb DEFAULT '[]'::jsonb,
  delivery_active boolean DEFAULT true,
  pickup_active boolean DEFAULT true,
  notes text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.order_deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  driver_id uuid,
  assigned_at timestamp with time zone,
  assigned_by uuid,
  picked_up_at timestamp with time zone,
  on_route_at timestamp with time zone,
  delivered_at timestamp with time zone,
  delivery_status text DEFAULT 'pending'::text,
  delivery_address jsonb,
  customer_phone text,
  delivery_notes text,
  customer_location_lat numeric,
  customer_location_lng numeric,
  distance_km numeric,
  estimated_arrival timestamp with time zone,
  actual_arrival timestamp with time zone,
  proof_of_delivery jsonb,
  failure_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL,
  image_url text,
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  description text,
  sort_order integer DEFAULT 0,
  restaurant_id uuid,
  deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  is_available boolean DEFAULT true,
  options jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  available boolean DEFAULT true,
  preparation_time integer DEFAULT 15,
  restaurant_id uuid,
  deleted_at timestamp with time zone,
  station_id uuid
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid,
  product_id uuid,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  customizations jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status text DEFAULT 'pending'::text
);

CREATE TABLE IF NOT EXISTS public.payroll_concepts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid,
  name character varying(100) NOT NULL,
  type character varying(20),
  category character varying(50),
  percentage numeric,
  is_legal boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.payroll_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid,
  name character varying(100),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status character varying(20) DEFAULT 'OPEN'::character varying,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  period_id uuid NOT NULL,
  restaurant_id uuid,
  run_date date DEFAULT CURRENT_DATE,
  total_earnings numeric DEFAULT 0,
  total_deductions numeric DEFAULT 0,
  net_total numeric DEFAULT 0,
  status character varying(20) DEFAULT 'DRAFT'::character varying,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payroll_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  run_id uuid,
  employee_id uuid NOT NULL,
  concept_id uuid,
  amount numeric NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payroll_novelties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  restaurant_id uuid,
  type character varying(50) NOT NULL,
  start_date date,
  end_date date,
  amount numeric,
  notes text,
  status character varying(20) DEFAULT 'PENDING'::character varying,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  phone text,
  role text DEFAULT 'customer'::text,
  loyalty_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  role_id uuid,
  address text,
  restaurant_id uuid,
  document_id text,
  hire_date date DEFAULT CURRENT_DATE,
  waiter_pin text,
  food_discount_pct numeric DEFAULT 0,
  max_credit numeric DEFAULT 0,
  current_credit_spent numeric DEFAULT 0,
  hourly_rate numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.ingredients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(255) NOT NULL,
  description text,
  unit character varying(50) NOT NULL,
  current_stock numeric DEFAULT 0,
  min_stock numeric DEFAULT 0,
  max_stock numeric,
  cost_per_unit numeric DEFAULT 0,
  supplier character varying(255),
  category character varying(100),
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  restaurant_id uuid,
  deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id uuid,
  shift_type text,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  status text DEFAULT 'OPEN'::text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  shift_definition_id uuid,
  overtime_hours numeric DEFAULT 0,
  regular_hours numeric DEFAULT 0,
  restaurant_id uuid,
  deleted_at timestamp with time zone,
  total_hours numeric DEFAULT 0,
  hourly_rate numeric DEFAULT 0,
  total_payment numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.employee_liquidations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  restaurant_id uuid,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_amount numeric NOT NULL,
  status character varying(20) DEFAULT 'pending'::character varying,
  signature_url text,
  voucher_id uuid,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pos_sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cashbox_session_id uuid NOT NULL,
  shift_id uuid NOT NULL,
  user_id uuid NOT NULL,
  order_id uuid,
  customer_id uuid,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_status text DEFAULT 'PENDING'::text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sale_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL,
  cashbox_session_id uuid NOT NULL,
  payment_method text NOT NULL,
  amount numeric NOT NULL,
  reference_code text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  receipt_number character varying(50) NOT NULL,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_name character varying(255),
  customer_tax_id character varying(50),
  subtotal numeric NOT NULL,
  tax numeric DEFAULT 0,
  total numeric NOT NULL,
  payment_method character varying(50),
  notes text,
  pdf_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  order_id uuid,
  type character varying(50) NOT NULL,
  title character varying(255) NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cashbox_audits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cashbox_session_id uuid,
  user_id uuid,
  counted_amount numeric NOT NULL,
  system_amount numeric NOT NULL,
  difference_amount numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  granted_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  order_id uuid NOT NULL,
  driver_id uuid,
  status text NOT NULL DEFAULT 'assigned'::text,
  assigned_at timestamp with time zone DEFAULT now(),
  picked_up_at timestamp with time zone,
  delivered_at timestamp with time zone,
  delivery_proof_url text,
  notes text
);

CREATE TABLE IF NOT EXISTS public.cashbox_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cashbox_id uuid NOT NULL,
  shift_id uuid NOT NULL,
  user_id uuid NOT NULL,
  opening_amount numeric NOT NULL DEFAULT 0,
  opening_time timestamp with time zone DEFAULT now(),
  opening_notes text,
  closing_amount numeric,
  system_amount numeric,
  difference_amount numeric,
  closing_time timestamp with time zone,
  closing_notes text,
  status text DEFAULT 'OPEN'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  restaurant_id uuid
);

CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  ingredient_id uuid,
  quantity numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  restaurant_id uuid,
  deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.shift_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(50) NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  restaurant_id uuid
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  restaurant_id uuid
);

CREATE TABLE IF NOT EXISTS public.delivery_drivers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  vehicle_type text,
  license_plate text,
  is_active boolean DEFAULT true,
  is_available boolean DEFAULT true,
  current_location_lat numeric,
  current_location_lng numeric,
  location_updated_at timestamp with time zone,
  total_deliveries integer DEFAULT 0,
  rating numeric DEFAULT 5.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_system_role boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  tax_id text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  restaurant_id uuid,
  deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.waste_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid,
  ingredient_id uuid,
  quantity numeric NOT NULL,
  reason text,
  cost_at_waste numeric,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid,
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  category text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tax_id text,
  address text,
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid,
  supplier_id uuid,
  invoice_number text,
  total_amount numeric DEFAULT 0,
  status text DEFAULT 'pending'::text,
  received_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  purchase_id uuid,
  ingredient_id uuid,
  quantity numeric NOT NULL,
  unit_cost numeric NOT NULL,
  subtotal numeric,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipes_new (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid,
  product_id uuid,
  name text NOT NULL,
  description text,
  is_sub_recipe boolean DEFAULT false,
  portions numeric DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipe_id uuid,
  ingredient_id uuid,
  sub_recipe_id uuid,
  quantity numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subdomain text,
  logo_url text,
  primary_color text DEFAULT '#ef4444'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  apply_service_charge boolean DEFAULT false,
  service_charge_percentage numeric DEFAULT 10,
  loyalty_points_per_1000 integer DEFAULT 1,
  currency_symbol character varying(10) DEFAULT '$'::character varying,
  tax_percentage numeric DEFAULT 0,
  whatsapp_number character varying(20),
  enable_whatsapp_receipts boolean DEFAULT false,
  landing_page_config jsonb DEFAULT '{"hero": {"tagline": "Gran Rafa | Experiencia Gastronómica de Mar", "est_year": "2012", "image_url": "/premium_seafood_hero_1769294804705.png", "title_part1": "PARGO", "title_part2": "ROJO", "location_city": "Caucasia, Antioquia"}, "essence": [{"desc": "Seleccionamos diariamente la pesca más fresca y los cortes de carne más exclusivos de la región.", "icon": "Award", "title": "Ingredientes Premium"}, {"desc": "Nuestra técnica de asado tradicional resalta los sabores naturales con el toque único del Gran Rafa.", "icon": "ChefHat", "title": "Maestría en Brasa"}, {"desc": "Más que un restaurante, somos una tradición que celebra el sabor auténtico del Cauca.", "icon": "Heart", "title": "Legado Familiar"}], "experience": {"image_url": "/premium_restaurant_interior_1769294818416.png", "tour_link": "#", "description": "Cada rincón cuenta una historia. Hemos creado una atmósfera que combina la calidez tropical con la sofisticación moderna.", "title_part1": "Un espacio diseñado para", "title_part2": "Celebrar"}}'::jsonb,
  tenant_id uuid
);

CREATE TABLE IF NOT EXISTS public.settings (
  key text NOT NULL,
  value text,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  restaurant_id uuid
);

CREATE TABLE IF NOT EXISTS public.cashboxes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  current_status text DEFAULT 'CLOSED'::text,
  assigned_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  restaurant_id uuid
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ingredient_id uuid,
  movement_type character varying(50) NOT NULL,
  quantity numeric NOT NULL,
  previous_stock numeric,
  new_stock numeric,
  cost numeric,
  reference_id uuid,
  reference_type character varying(50),
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  restaurant_id uuid
);

CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  content text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.table_transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  source_table_id uuid NOT NULL,
  target_table_id uuid NOT NULL,
  order_id uuid NOT NULL,
  transferred_by uuid NOT NULL,
  reason text,
  transferred_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  phone text,
  template_slug text,
  content text,
  status text DEFAULT 'pending'::text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time without time zone NOT NULL,
  num_people integer NOT NULL,
  status text DEFAULT 'pending'::text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  restaurant_id uuid,
  deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  fingerprint text,
  last_ip text,
  is_active boolean DEFAULT true,
  last_seen_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  permission USER-DEFINED NOT NULL,
  granted_by uuid,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.prep_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petty_cash_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_novelties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_liquidations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashbox_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashbox_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
