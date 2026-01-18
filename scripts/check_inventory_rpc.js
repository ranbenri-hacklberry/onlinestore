const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

async function checkInventory() {
    const { error: error1 } = await supabase.rpc('decrement_inventory', { item_id: '550e8400-e29b-41d4-a716-446655440000', qty: 1 });
    console.log('decrement_inventory (item_id, qty):', error1?.code);

    const { error: error2 } = await supabase.rpc('decrement_inventory', { p_item_id: '550e8400-e29b-41d4-a716-446655440000', p_qty: 1 });
    console.log('decrement_inventory (p_item_id, p_qty):', error2?.code);

    const { error: error3 } = await supabase.rpc('reduce_stock', { p_item_id: '550e8400-e29b-41d4-a716-446655440000', p_qty: 1 });
    console.log('reduce_stock:', error3?.code);
}

checkInventory();
