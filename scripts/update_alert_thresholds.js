const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUSINESS_ID = '11111111-1111-1111-1111-111111111111';

const alerts = [
    { name: 'חלב פרה', alert: 24 },
    { name: 'חלב סויה', alert: 6 },
    { name: 'חלב שיבולת שועל', alert: 6 },
    { name: 'פולי קפה', alert: 10 },
    { name: 'גבנצ מגורדת', alert: 4000 }, // in grams
    { name: 'גבינה צהובה מגורדת', alert: 4000 },
    { name: 'לחם טוסט', alert: 5 },
    { name: 'כוסות חד"פ', alert: 100 }
];

async function updateAlerts() {
    console.log("🔔 Updating low stock alert thresholds...");

    for (const a of alerts) {
        // We use the run_sql equivalent or just directly update via REST if RLS allows 
        // (Usually updates are more restricted than RPCs)
        // Let's try direct update first
        const { error } = await supabase
            .from('inventory_items')
            .update({ low_stock_alert: a.alert })
            .eq('business_id', BUSINESS_ID)
            .eq('name', a.name);

        if (error) {
            console.error(`❌ Failed for ${a.name}:`, error.message);
        } else {
            console.log(`✅ Set alert for ${a.name} to ${a.alert}`);
        }
    }
}

updateAlerts();
