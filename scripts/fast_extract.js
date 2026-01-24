const { Pool } = require('pg');
const pool = new Pool({ connectionString: "postgres://postgres.gxzsxvbercpkgxraiaex:hackl2025!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" });

async function run() {
    try {
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("TABLES:", tables.rows.map(r => r.table_name).join(', '));

        const items = await pool.query("SELECT * FROM menu_items LIMIT 5");
        console.log("MENU_ITEMS:", JSON.stringify(items.rows, null, 2));

        const inventory = await pool.query("SELECT * FROM inventory LIMIT 5");
        console.log("INVENTORY:", JSON.stringify(inventory.rows, null, 2));

        const invCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'inventory'");
        console.log("INV_COLS:", JSON.stringify(invCols.rows, null, 2));

    } catch (e) { console.error(e); }
    finally { await pool.end(); }
}
run();
