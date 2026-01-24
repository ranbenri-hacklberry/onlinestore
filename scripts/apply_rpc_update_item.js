const { Pool } = require('pg');

const connectionString = "postgres://postgres:hackl2025!@db.gxzsxvbercpkgxraiaex.supabase.co:5432/postgres";

const sql = `
CREATE OR REPLACE FUNCTION update_inventory_item_details(
    p_item_id BIGINT,
    p_name TEXT,
    p_unit TEXT,
    p_cost_per_unit NUMERIC,
    p_count_step NUMERIC,
    p_weight_per_unit NUMERIC,
    p_min_order NUMERIC,
    p_order_step NUMERIC,
    p_low_stock_alert NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_item JSONB;
BEGIN
    UPDATE inventory_items
    SET
        name = p_name,
        unit = p_unit,
        cost_per_unit = p_cost_per_unit,
        count_step = p_count_step,
        weight_per_unit = p_weight_per_unit,
        min_order = p_min_order,
        order_step = p_order_step,
        low_stock_alert = p_low_stock_alert
        -- updated_at is handled by trigger if exists, or ignored if not in schema
    WHERE id = p_item_id
    RETURNING to_jsonb(inventory_items.*) INTO v_updated_item;

    RETURN v_updated_item;
END;
$$;
`;

async function run() {
    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
        console.log("Connecting...");
        await pool.query(sql);
        console.log("✅ RPC function 'update_inventory_item_details' created successfully.");
    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await pool.end();
    }
}

run();
