const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

async function testSubmit() {
    console.log('--- Testing submit_order signatures ---');

    // Test with p_ prefix
    const withPrefix = {
        p_business_id: '22222222-2222-2222-2222-222222222222',
        p_customer_phone: '0500000000',
        p_customer_name: 'Test',
        p_total_amount: 0,
        p_order_type: 'pickup',
        p_delivery_address: '',
        p_payment_method: 'cash',
        p_items: []
    };

    // Test without p_ prefix
    const withoutPrefix = {
        business_id: '22222222-2222-2222-2222-222222222222',
        customer_phone: '0500000000',
        customer_name: 'Test',
        total_amount: 0,
        order_type: 'pickup',
        delivery_address: '',
        payment_method: 'cash',
        items: []
    };

    console.log('Testing submit_order_v3 with p_ prefix...');
    const res1 = await supabase.rpc('submit_order_v3', withPrefix);
    console.log('Result:', res1.error ? `Error ${res1.error.code}: ${res1.error.message}` : 'Success!');

    console.log('\nTesting submit_order_v3 without p_ prefix...');
    const res2 = await supabase.rpc('submit_order_v3', withoutPrefix);
    console.log('Result:', res2.error ? `Error ${res2.error.code}: ${res2.error.message}` : 'Success!');

    console.log('\nTesting submit_order_v2 with p_ prefix...');
    const res3 = await supabase.rpc('submit_order_v2', withPrefix);
    console.log('Result:', res3.error ? `Error ${res3.error.code}: ${res3.error.message}` : 'Success!');
}

testSubmit();
