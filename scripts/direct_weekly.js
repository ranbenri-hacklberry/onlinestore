const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgres://postgres.gxzsxvbercpkgxraiaex:hackl2025!@db.gxzsxvbercpkgxraiaex.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const businessId = '11111111-1111-1111-1111-111111111111';
    try {
        console.log("Fetching orders from direct DB...");
        const res = await pool.query(`
      SELECT o.id, o.created_at, o.total_amount, 
             oi.quantity, oi.price, mi.name, mi.category
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE mi.business_id = $1
      AND o.created_at >= '2026-01-11' AND o.created_at < '2026-01-17'
    `, [businessId]);

        console.log('DATA:', JSON.stringify(res.rows));
    } catch (e) { console.error(e); }
    finally { await pool.end(); }
}
run();
