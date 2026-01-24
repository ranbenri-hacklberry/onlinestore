const { Pool } = require('pg');

const tests = [
    { connectionString: "postgres://postgres:hackl2025!@db.gxzsxvbercpkgxraiaex.supabase.co:5432/postgres", ssl: { rejectUnauthorized: false } }
];

async function test() {
    for (const config of tests) {
        console.log(`Testing: ${config.connectionString.replace(/:[^@]+@/, ':****@')}`);
        const pool = new Pool(config);
        try {
            const res = await pool.query('SELECT 1');
            console.log('SUCCESS');
            await pool.end();
            return;
        } catch (e) {
            console.log(`FAILED: ${e.message}`);
        }
        await pool.end();
    }
}

test();
