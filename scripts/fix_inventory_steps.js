const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUSINESS_ID = '11111111-1111-1111-1111-111111111111';

// Rules for updating count_step
const RULES = [
    {
        filter: (i) => ['מלח', 'פלפל שחור', 'אורגנו', 'אגוז מוסקט', 'פרלינים', 'זיתים', 'ערמונים', 'ג\'עלה'].some(k => i.name.includes(k)),
        step: 100
    },
    {
        filter: (i) => ['מיץ', 'לימונדה', 'שמן זית', 'תרכיז'].some(k => i.name.includes(k)) && i.unit === 'מ"ל',
        step: 1000 // 1 Liter
    },
    {
        filter: (i) => ['סוכר', 'אבקת סוכר', 'שוקולית', 'אבקת אייס קפה'].some(k => i.name.includes(k)),
        step: 1000 // 1 Kg
    },
    {
        filter: (i) => (i.unit === 'גרם' || i.unit === 'מ"ל'), // Default for all other weight/vol items
        step: 500
    }
];

async function fixSteps() {
    console.log("🔧 Fixing inventory count steps...");

    // 1. Fetch current items
    const { data: items, error } = await supabase
        .from('inventory_items')
        .select('id, name, unit, count_step')
        .eq('business_id', BUSINESS_ID)
        .in('unit', ['גרם', 'מ"ל']);

    if (error) {
        console.error("❌ Error fetching items:", error);
        return;
    }

    console.log(`Found ${items.length} items to check.`);

    for (const item of items) {
        let newStep = 500; // Default fallback

        // Find matching rule
        for (const rule of RULES) {
            if (rule.filter(item)) {
                newStep = rule.step;
                break; // Stop after first match (specific rules first)
            }
        }

        // Update if needed
        if (item.count_step !== newStep) {
            console.log(`Updating ${item.name}: ${item.count_step} -> ${newStep}`);
            await supabase
                .from('inventory_items')
                .update({ count_step: newStep, order_step: newStep, min_order: newStep })
                .eq('id', item.id);
        }
    }

    console.log("✅ Done.");
}

fixSteps();
