const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

async function testJson() {
    console.log('--- Testing if submit_order_v3 takes a JSON blob ---');
    const payload = {
        business_id: '22222222-2222-2222-2222-222222222222',
        customer_phone: '0500000000',
        items: []
    };

    const res = await supabase.rpc('submit_order_v3', { p_payload: payload });
    console.log('Result (p_payload):', res.error ? `Error ${res.error.code}: ${res.error.message}` : 'Success!');
    if (res.error?.hint) console.log('Hint:', res.error.hint);
}

testJson();
