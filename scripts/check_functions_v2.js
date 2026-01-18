const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

async function checkFunctions() {
    console.log('--- Deep Checking RPC functions ---');

    // Test combinations of names and arguments
    const tests = [
        { name: 'submit_order_v3', params: {} },
        { name: 'submit_order_v3', params: { p_business_id: '...', p_customer_phone: '...', p_customer_name: '...', p_total_amount: 0, p_order_type: 'pickup', p_delivery_address: '', p_payment_method: 'cash', p_items: [] } },
        { name: 'submit_order', params: {} },
        { name: 'submit_order_v2', params: {} },
        { name: 'spawn_order', params: {} },
        { name: 'decrement_inventory', params: { item_id: '...', qty: 1 } },
        { name: 'decrement_inventory', params: { p_item_id: '...', p_qty: 1 } },
        { name: 'update_order_status_v3', params: {} },
        { name: 'lookup_customer', params: { p_phone: '0500000000' } }
    ];

    for (const test of tests) {
        const { error } = await supabase.rpc(test.name, test.params);
        if (error && error.code === 'PGRST202') {
            console.log(`❌ ${test.name}(${Object.keys(test.params).join(',') || ''}): 404 Not Found`);
        } else if (error) {
            console.log(`✅ ${test.name}(${Object.keys(test.params).join(',') || ''}): Found but error: ${error.message} (Code: ${error.code})`);
            if (error.hint) console.log(`   💡 Hint: ${error.hint}`);
        } else {
            console.log(`✅ ${test.name}(${Object.keys(test.params).join(',') || ''}): Success!`);
        }
    }
}

checkFunctions();
