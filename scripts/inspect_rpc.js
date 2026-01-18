const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectFunction() {
    console.log('🔍 Inspecting submit_order_v3 signature...\n');

    const { data, error } = await supabase.rpc('inspect_function_signature_v2', { fn_name: 'submit_order_v3' });

    if (error) {
        console.error('❌ Error inspecting function:', error.message);
        console.log('Trying alternative inspection...');

        // Alternative: Query pg_proc via RPC if available, or just try a dummy call to forced error
        const { error: dummyError } = await supabase.rpc('submit_order_v3', { dummy: 1 });
        console.log('\n--- SERVER HINT ---');
        console.log(dummyError?.details || dummyError?.message || 'No hint available');
    } else {
        console.log('✅ Function Signature:');
        console.log(JSON.stringify(data, null, 2));
    }
}

inspectFunction();
