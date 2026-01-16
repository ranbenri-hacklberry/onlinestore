// Script to add more plants - צמחי בית (houseplants)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';

const supabase = createClient(supabaseUrl, supabaseKey);

const BUSINESS_ID = '8e4e05da-2d99-4bd9-aedf-8e54cbde930a';

// צמחי בית from WhatsApp catalog
const houseplants = [
    { name: 'פוטוס', price: 25, description: 'צמח מטפס קלאסי' },
    { name: 'אברה ארוכת עלים', price: 38, description: 'אברה עם עלים ארוכים' },
    { name: 'מונסטרה', price: 75, description: 'צמח טרופי מרהיב' },
    { name: 'סינגוניום', price: 25, description: 'צמח עלים יפהפה' },
    { name: 'ירקה', price: 15, description: 'צמח ירוק ורענן' },
    { name: 'שפלרה מגוונת', price: 37, description: 'שפלרה עם עלים מגוונים' },
    { name: 'דקל אריקה', price: 25, description: 'דקל פנימי אלגנטי' },
    { name: 'שרך אברה', price: 25, description: 'שרך ירוק ועדין' },
    { name: 'דקל חמודריאה', price: 25, description: 'דקל קומפקטי לבית' },
    { name: 'פפרומיה', price: 25, description: 'צמח מיני חמוד' },
    { name: 'שרך בוסטון', price: 25, description: 'שרך קלאסי פופולרי' },
    { name: 'קרוטון מנוקד', price: 33, description: 'עלים צבעוניים מנוקדים' },
    { name: 'קלתאה אינסיגניס', price: 70, description: 'קלתאה עם דוגמה מיוחדת' },
    { name: 'ארליה', price: 25, description: 'צמח עלים אדום-ירוק' },
    { name: 'קרוטון מסולסל', price: 37, description: 'קרוטון עם עלים מסולסלים' },
    { name: 'קיסוס קערה', price: 40, description: 'קיסוס מטפס מגוון' },
    { name: 'קלתאה מקוינה', price: 70, description: 'קלתאה עם דוגמת פסים' },
];

async function addHouseplants() {
    console.log('🏠 Adding צמחי בית to שפת המדבר...\n');

    // Create category
    console.log('📁 Creating category: צמחי בית...');
    const { data: category, error: catError } = await supabase
        .from('item_category')
        .insert([{
            name: 'צמחי בית',
            name_he: 'צמחי בית',
            icon: '🪴',
            business_id: BUSINESS_ID,
            position: 3,
            prep_areas: ['kitchen'],
            is_deleted: false,
            is_hidden: false,
            is_visible_online: true
        }])
        .select()
        .single();

    if (catError) {
        console.error('❌ Error creating category:', catError.message);
        return;
    }

    console.log(`✅ Category created: ${category.name_he} (ID: ${category.id})`);

    // Add plants
    const menuItems = houseplants.map(plant => ({
        business_id: BUSINESS_ID,
        category_id: category.id,
        name: plant.name,
        price: plant.price,
        category: 'צמחי בית',
        description: plant.description,
        is_in_stock: true,
        is_deleted: false
    }));

    const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .insert(menuItems)
        .select();

    if (itemsError) {
        console.error('❌ Error adding plants:', itemsError.message);
        return;
    }

    console.log(`\n✅ Added ${items.length} houseplants:`);
    items.forEach(item => {
        console.log(`   🪴 ${item.name} - ₪${item.price}`);
    });
}

addHouseplants().then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
});
