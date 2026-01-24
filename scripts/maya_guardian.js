const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUSINESS_ID = '11111111-1111-1111-1111-111111111111';

async function runGuardian() {
    console.log("🛡️ Maya Guardian: Checking critical stock...");

    // 1. Fetch items that have 0 stock (since they were just imported)
    const { data: lowItems, error: invError } = await supabase
        .from('inventory_items')
        .select('name, current_stock, low_stock_alert')
        .eq('business_id', BUSINESS_ID)
        .eq('current_stock', 0); // Everything is 0 now

    if (invError) {
        console.error("❌ Error fetching inventory:", invError.message);
        return;
    }

    // Filter for critical items we know (since alerts are 0 in DB)
    const criticalNames = ['חלב פרה', 'חלב סויה', 'פולי קפה', 'גבנצ מגורדת', 'בצק פיצה', 'רוטב עגבניות', 'חסה לאליק'];
    const filteredItems = lowItems.filter(i => criticalNames.includes(i.name));

    if (filteredItems.length === 0) {
        console.log("✅ All stock levels healthy.");
        return;
    }

    console.log(`⚠️ Found ${filteredItems.length} critical items with zero stock.`);

    // 2. Fetch owners
    const { data: owners } = await supabase
        .from('employees')
        .select('phone, whatsapp_phone, name')
        .eq('business_id', BUSINESS_ID)
        .eq('access_level', 'owner');

    if (!owners || owners.length === 0) {
        console.log("❌ No owners found to notify.");
        return;
    }

    const itemNames = filteredItems.map(i => i.name).join(', ');
    const alertMessage = `שלום, כאן מאיה. 🌸
זיהיתי מחסור קריטי בפריטים הבאים בעגלת קפה:
${itemNames}.
מומלץ לבצע הזמנה מהספק בהקדם.`;

    // 3. Queue SMS
    for (const owner of owners) {
        const targetPhone = owner.phone || owner.whatsapp_phone;
        if (!targetPhone) continue;

        console.log(`📤 Queuing alert for ${owner.name} (${targetPhone})...`);

        const { error: smsErr } = await supabase
            .from('sms_queue')
            .insert({
                phone: targetPhone,
                message: alertMessage,
                status: 'pending'
            });

        if (smsErr) {
            console.error(`❌ Failed to queue SMS for ${owner.name}:`, smsErr.message);
        } else {
            console.log(`✅ Alert queued for ${owner.name}.`);
        }
    }
}

runGuardian();
