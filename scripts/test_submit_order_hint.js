const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

async function testSubmit() {
    const params = {
        p_business_id: '22222222-2222-2222-2222-222222222222',
        p_customer_id: null,
        p_customer_name: 'Test',
        p_delivery_address: '',
        p_items: [],
        p_order_type: 'pickup',
        p_payment_method: 'cash',
        p_refund: false,
        p_refund_amount: 0,
        p_refund_method: null
    };

    const { error } = await supabase.rpc('submit_order', params);
    if (error) {
        console.log(`Error ${error.code}: ${error.message}`);
    } else {
        console.log('Success!');
    }
}

testSubmit();
