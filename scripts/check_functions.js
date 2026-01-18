const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

async function checkFunctions() {
    console.log('--- Checking available RPC functions ---');
    // Note: We can only check functions that are exposed via API or by guessing names if we don't have superuser/postgres access
    // Since we are using anon key, we probably can't query information_schema easily via rest api
    // But let's try a few names
    const commonNames = [
        'submit_order',
        'submit_order_v2',
        'submit_order_v3',
        'decrement_inventory',
        'update_order_status_v3',
        'lookup_customer'
    ];

    for (const name of commonNames) {
        const { error } = await supabase.rpc(name, {});
        if (error && error.code === 'PGRST202') {
            console.log(`❌ ${name}: Not found (404)`);
        } else if (error) {
            console.log(`✅ ${name}: Exists, but returned error (expected since we sent empty args): ${error.message}`);
        } else {
            console.log(`✅ ${name}: Exists and worked!`);
        }
    }
}

checkFunctions();
