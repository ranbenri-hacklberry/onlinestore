const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getHint() {
    // Calling with an empty object often triggers the "Perhaps you meant..." hint
    const { error } = await supabase.rpc('submit_order_v3', {});
    console.log('--- ERROR MESSAGE ---');
    console.log(error?.message);
    console.log('\n--- ERROR DETAILS ---');
    console.log(error?.details);
    console.log('\n--- ERROR HINT ---');
    console.log(error?.hint);
}

getHint();
