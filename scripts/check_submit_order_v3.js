const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    console.log('🔍 Checking for submit_order functions...');

    // 1. Try to call a non-existent function to get the "Perhaps you meant..." hint with full details
    const { error: hintError } = await supabase.rpc('get_function_schema_hint_diagnostic', {});
    console.log('--- Hint Diagnostic ---');
    console.log(hintError?.details || hintError?.message);

    // 2. Search for submit_order patterns in the schema
    const { data, error } = await supabase.rpc('submit_order_v3', {
        p_business_id: 'test',
        p_customer_name: 'test',
        p_customer_phone: 'test',
        p_delivery_address: 'test',
        p_items: [],
        p_order_type: 'pickup',
        p_payment_method: 'test',
        p_total_amount: 0
    });

    if (error) {
        console.log('--- submit_order_v3 Error ---');
        console.log(error.message);
        console.log(error.details);
        console.log(error.hint);
    } else {
        console.log('✅ submit_order_v3 found with 8 params!');
    }
}

check();
