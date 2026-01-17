const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

const BUSINESS_ID = '22222222-2222-2222-2222-222222222222';

async function checkModifiers() {
    console.log('--- Checking item_category ---');
    const { data: cats } = await supabase.from('item_category').select('*').eq('business_id', BUSINESS_ID);
    console.log('Categories:', cats?.map(c => c.name_he || c.name));

    console.log('\n--- Checking menu_items ---');
    const { data: items } = await supabase.from('menu_items')
        .select('id, name')
        .eq('business_id', BUSINESS_ID)
        .limit(5);
    console.log('Sample items:', items);

    if (items && items.length > 0) {
        const itemId = items[0].id;
        console.log(`\n--- Checking modifiers for item: ${items[0].name} (${itemId}) ---`);

        // Try different common table names
        const tables = ['item_modifiers', 'menu_item_modifiers', 'modifiers', 'modifier_groups'];
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*').limit(5);
            if (!error) {
                console.log(`Table '${table}' exists. Sample:`, data);
            } else {
                // console.log(`Table '${table}' error:`, error.message);
            }
        }
    }
}

checkModifiers();
