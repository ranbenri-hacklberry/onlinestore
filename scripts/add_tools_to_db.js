
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addCategory() {
    console.log('Adding "Garden Tools" category...');

    const { data, error } = await supabase
        .from('item_category')
        .insert([
            {
                name: 'Garden Tools',
                name_he: 'כלי עבודה',
                business_id: '8e4e05da-2d99-4bd9-aedf-8e54cbde930a', // Sfat Hamidbar ID
                is_hidden: false,
                position: 10 // Last position
            }
        ])
        .select();

    if (error) {
        console.error('Error adding category:', error);
    } else {
        console.log('Category added successfully:', data);
    }
}

addCategory();
