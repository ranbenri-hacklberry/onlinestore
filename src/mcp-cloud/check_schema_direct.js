
const { Pool } = require('pg');

const connectionString = "postgres://postgres.gxzsxvbercpkgxraiaex:af8e1af12588e6e075528afc7a292f8b1e1b9e24468da9128dd962d0ae6e77df@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log("🔌 Connecting to DB directly...");
        const client = await pool.connect();
        console.log("✅ Connected!");

        // List Tables
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        console.log(`\n📚 Found ${res.rows.length} Tables:`);
        res.rows.forEach(r => console.log(` - ${r.table_name}`));

        // Detailed Schema for a few key tables
        const keyTables = ['orders', 'inventory_items', 'menu_items', 'employees'];

        for (const table of keyTables) {
            if (res.rows.find(r => r.table_name === table)) {
                console.log(`\n📋 Schema for '${table}':`);
                const cols = await client.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = $1 
                    ORDER BY ordinal_position
                `, [table]);

                cols.rows.forEach(c => {
                    console.log(`   ${c.column_name.padEnd(25)} | ${c.data_type.padEnd(15)} | ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
                });
            }
        }

        client.release();
    } catch (e) {
        console.error("❌ DB Error:", e);
    } finally {
        await pool.end();
    }
}

main();
