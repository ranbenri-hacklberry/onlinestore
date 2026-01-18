const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

async function checkV3() {
    // Try to trigger an error that reveals the signature if it exists
    const { error } = await supabase.rpc('submit_order_v3', { nonexistent: 1 });
    if (error) {
        console.log('Error:', error.message);
        if (error.hint) console.log('Hint:', error.hint);
    } else {
        console.log('Success (which is weird)');
    }
}

checkV3();
