import pg from "pg";
const { Pool } = pg;

const dbUrl = "postgres://postgres.gxzsxvbercpkgxraiaex:hackl2025!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString: dbUrl });

async function extractData() {
    try {
        console.log("--- Task 2: Data Extraction ---");

        // 1. List first 5 items from catalog_items (mentined in prompt) 
        // Wait, let's check if it's menu_items or catalog_items in Supabase
        console.log("\n1. Fetching first 5 menu_items/catalog_items...");
        const itemsResult = await pool.query("SELECT * FROM menu_items LIMIT 5");
        console.log(JSON.stringify(itemsResult.rows, null, 2));

        // 2. List schema of inventory_items / inventory
        console.log("\n2. Inspecting inventory table schema...");
        const schemaResult = await pool.query(
            "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'inventory' OR table_name = 'inventory_items'"
        );
        console.log(JSON.stringify(schemaResult.rows, null, 2));

        // 3. Fetching sample inventory data to see weight-to-unit mapping
        console.log("\n3. Fetching sample inventory records...");
        const invResult = await pool.query("SELECT * FROM inventory LIMIT 5");
        console.log(JSON.stringify(invResult.rows, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await pool.end();
    }
}

extractData();
