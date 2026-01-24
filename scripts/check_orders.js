const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgres://postgres.gxzsxvbercpkgxraiaex:hackl2025!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Checking samples from orders...");
        const res = await pool.query("SELECT created_at FROM orders LIMIT 10");
        console.log("SAMPLES:", JSON.stringify(res.rows, null, 2));

        const count = await pool.query("SELECT COUNT(*) FROM orders");
        console.log("TOTAL_ORDERS:", count.rows[0].count);

    } catch (e) { console.error(e); }
    finally { await pool.end(); }
}
run();
