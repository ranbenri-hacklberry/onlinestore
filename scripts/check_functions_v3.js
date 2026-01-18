const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

async function checkFunctions() {
    console.log('--- Checking EVERY possible function name ---');

    // We can try to query information_schema.routines via a generic RPC if one exists that allows it
    // But failing that, let's just guess more
    const names = [
        'submit_order', 'submit_order_v1', 'submit_order_v2', 'submit_order_v3', 'submit_order_v4',
        'create_order', 'insert_order', 'place_order',
        'decrement_inventory', 'decrement_stock', 'reduce_inventory', 'update_inventory',
        'lookup_customer', 'get_customer', 'find_customer',
        'get_orders_history', 'get_orders', 'sync_orders',
        'update_order_status', 'update_order_status_v2', 'update_order_status_v3'
    ];

    for (const name of names) {
        const { error } = await supabase.rpc(name, {});
        if (error && error.code === 'PGRST202') {
            // 404
        } else if (error) {
            console.log(`✅ ${name}: Found (Error: ${error.message})`);
            if (error.hint) console.log(`   💡 ${error.hint}`);
        } else {
            console.log(`✅ ${name}: Found (Success!)`);
        }
    }
}

checkFunctions();
