-- ========================================================
-- ICAFFE OS - FULL DATABASE SCHEMA DUMP
-- Generated: 2026-01-27
-- Version: 1.10.4 (Consolidated from local & remote metadata)
-- ========================================================
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Core Business & Identity
CREATE TABLE IF NOT EXISTS public.businesses (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    settings jsonb DEFAULT '{}'::jsonb,
    last_active_at timestamp with time zone,
    opening_tasks_start_time time DEFAULT '07:30:00',
    closing_tasks_start_time time DEFAULT '15:00:00'
);
CREATE TABLE IF NOT EXISTS public.employees (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    name text NOT NULL,
    nfc_id text,
    pin_code text,
    access_level text NOT NULL DEFAULT 'Worker',
    is_admin boolean NOT NULL DEFAULT false,
    is_super_admin boolean DEFAULT false,
    phone text,
    whatsapp_phone text,
    email text,
    auth_user_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
-- Menu System
CREATE TABLE IF NOT EXISTS public.menu_items (
    id serial PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    name text NOT NULL,
    price numeric NOT NULL,
    category text NOT NULL,
    image_url text,
    description text,
    is_prep_required boolean NOT NULL DEFAULT true,
    is_hot_drink boolean DEFAULT false,
    is_in_stock boolean DEFAULT true,
    allow_notes boolean DEFAULT true,
    kds_routing_logic text DEFAULT 'GRAB_AND_GO',
    sale_price numeric,
    sale_start_date timestamp with time zone,
    sale_end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.optiongroups (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    name text NOT NULL,
    display_order integer DEFAULT 0,
    is_required boolean DEFAULT false,
    is_multiple_select boolean DEFAULT false,
    is_food boolean DEFAULT true,
    is_drink boolean DEFAULT true,
    menu_item_id integer -- Optional: for single-item specific groups
);
CREATE TABLE IF NOT EXISTS public.optionvalues (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id uuid REFERENCES public.optiongroups(id) ON DELETE CASCADE,
    business_id uuid REFERENCES public.businesses(id),
    value_name text NOT NULL,
    price_adjustment numeric DEFAULT 0.00,
    display_order integer DEFAULT 0,
    is_default boolean DEFAULT false,
    inventory_item_id integer,
    quantity numeric DEFAULT 0,
    is_replacement boolean DEFAULT false
);
CREATE TABLE IF NOT EXISTS public.menuitemoptions (
    item_id integer REFERENCES public.menu_items(id) ON DELETE CASCADE,
    group_id uuid REFERENCES public.optiongroups(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, group_id)
);
-- Order System
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    phone_number text NOT NULL,
    name text,
    loyalty_coffee_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at date
);
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    customer_id uuid REFERENCES public.customers(id),
    order_number bigint,
    customer_phone text,
    customer_name text,
    order_status text NOT NULL DEFAULT 'new',
    is_paid boolean NOT NULL DEFAULT false,
    payment_method text,
    total_amount numeric DEFAULT 0,
    paid_amount numeric DEFAULT 0,
    is_refund boolean DEFAULT false,
    refund_amount numeric DEFAULT 0,
    fired_at timestamp with time zone,
    ready_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    business_id uuid REFERENCES public.businesses(id),
    menu_item_id integer REFERENCES public.menu_items(id),
    quantity integer NOT NULL DEFAULT 1,
    price numeric DEFAULT 0,
    mods jsonb,
    item_status text NOT NULL DEFAULT 'new',
    course_stage integer DEFAULT 1,
    notes text,
    is_early_delivered boolean DEFAULT false,
    item_fired_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- Inventory & Suppliers
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id serial PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    name text NOT NULL,
    category text NOT NULL,
    unit text NOT NULL,
    current_stock numeric DEFAULT 0,
    cost_per_unit numeric DEFAULT 0,
    low_stock_alert numeric DEFAULT 5,
    supplier_id bigint,
    catalog_item_id uuid,
    case_quantity integer DEFAULT 1,
    quantity_step numeric DEFAULT 1,
    weight_per_unit numeric,
    units_per_kg numeric,
    last_updated timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.suppliers (
    id serial PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    name text NOT NULL,
    contact_person text,
    phone_number text,
    email text,
    delivery_days text,
    notes text
);
CREATE TABLE IF NOT EXISTS public.supplier_orders (
    id serial PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    supplier_id integer REFERENCES public.suppliers(id),
    order_date date NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date date,
    order_status text NOT NULL DEFAULT 'PENDING',
    delivery_status text DEFAULT 'pending',
    total_amount numeric,
    invoice_image_url text,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.supplier_order_items (
    id serial PRIMARY KEY,
    supplier_order_id integer REFERENCES public.supplier_orders(id) ON DELETE CASCADE,
    inventory_item_id integer REFERENCES public.inventory_items(id),
    quantity numeric DEFAULT 1,
    unit_price numeric,
    line_item_status text DEFAULT 'EXPECTED',
    created_at timestamp with time zone DEFAULT now()
);
-- Loyalty System
CREATE TABLE IF NOT EXISTS public.loyalty_cards (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    customer_phone text NOT NULL,
    points_balance integer DEFAULT 0,
    free_coffees integer DEFAULT 0,
    total_coffees_purchased integer DEFAULT 0,
    total_free_coffees_redeemed integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    card_id uuid REFERENCES public.loyalty_cards(id) ON DELETE CASCADE,
    order_id uuid REFERENCES public.orders(id),
    change_amount integer NOT NULL,
    transaction_type text NOT NULL,
    -- 'Earn', 'Redeem', 'Adjustment'
    points_earned integer DEFAULT 0,
    points_redeemed integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);
-- Tasks & Recipes (KDS Production)
CREATE TABLE IF NOT EXISTS public.tasks (
    id serial PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    description text NOT NULL,
    category text,
    status text NOT NULL DEFAULT 'Pending',
    due_date timestamp with time zone,
    menu_item_id integer,
    quantity integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.recipes (
    id serial PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    menu_item_id integer REFERENCES public.menu_items(id),
    task_id integer REFERENCES public.tasks(id),
    instructions text,
    preparation_quantity real NOT NULL,
    quantity_unit text
);
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id serial PRIMARY KEY,
    recipe_id integer REFERENCES public.recipes(id) ON DELETE CASCADE,
    inventory_item_id integer REFERENCES public.inventory_items(id),
    quantity_used numeric NOT NULL,
    unit_of_measure text NOT NULL,
    cost_per_unit numeric DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
-- Music & Atmosphere
CREATE TABLE IF NOT EXISTS public.music_songs (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    title text NOT NULL,
    album_id uuid,
    artist_id uuid,
    file_path text NOT NULL,
    duration_seconds integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);
-- Discounts
CREATE TABLE IF NOT EXISTS public.discounts (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED', 'FREE_ITEM')),
    value numeric DEFAULT 0,
    configuration jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);
-- Infrastructure
CREATE TABLE IF NOT EXISTS public.device_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    device_id text NOT NULL,
    device_type text NOT NULL,
    device_name text,
    last_seen_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.time_clock_events (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES public.businesses(id),
    employee_id uuid REFERENCES public.employees(id),
    event_type text NOT NULL,
    -- 'clock_in', 'clock_out'
    event_time timestamp with time zone NOT NULL DEFAULT now()
);
-- Views & Helper Functions (Summary)
-- Note: Real SQL Dump would include many more PL/pgSQL functions.
COMMENT ON DATABASE postgres IS 'iCaffe OS Consolidated Schema Dump';