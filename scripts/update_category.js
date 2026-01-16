const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

const BUSINESS_ID = '8e4e05da-2d99-4bd9-aedf-8e54cbde930a';

async function updateCategoryName() {
    console.log('Updating category name from "שיחים" to "שיחים ועצים"...');

    const { data, error } = await supabase
        .from('item_category')
        .update({ name_he: 'שיחים ועצים' })
        .eq('business_id', BUSINESS_ID)
        .eq('name_he', 'שיחים')
        .select();

    if (error) {
        console.error('Error updating category:', error);
        return;
    }

    console.log('✅ Updated category:', data);
}

updateCategoryName();
