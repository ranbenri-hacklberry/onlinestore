// Script to add remaining categories: מטפסים, שיחים, צמחי תבלין
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';

const supabase = createClient(supabaseUrl, supabaseKey);

const BUSINESS_ID = '8e4e05da-2d99-4bd9-aedf-8e54cbde930a';

const categories = {
    'מטפסים': {
        icon: '🌿',
        position: 4,
        plants: [
            { name: 'פנדוראה מגוונת', price: 40, description: 'צמח מטפס מגוון' },
            { name: 'פסיפלורה', price: 40, description: 'שעונית - פרח מרהיב' },
            { name: 'סוזי', price: 40, description: 'צמח מטפס צהוב' },
            { name: 'יערה יפנית', price: 40, description: 'יערה עם פרחים ורודים' },
            { name: 'בוגונוויליה', price: 55, description: 'מטפס צבעוני מרהיב' },
        ]
    },
    'שיחים': {
        icon: '🌳',
        position: 5,
        plants: [
            { name: 'סולנום', price: 50, description: 'שיח פורח' },
            { name: 'היביסקוס סיני מגוון', price: 37, description: 'היביסקוס צבעוני' },
            { name: 'אוג מכחיל', price: 25, description: 'שיח עם עלווה כחלחלה' },
            { name: 'טברנה מונטנה', price: 40, description: 'שיח עם פרחים לבנים' },
            { name: 'דורנטה תאילנדית', price: 37, description: 'שיח סגול יפה' },
            { name: 'אוג חרוק', price: 25, description: 'שיח עם עלווה מיוחדת' },
            { name: 'דורנטה גיישה', price: 37, description: 'דורנטה מגוון גיישה' },
        ]
    },
    'צמחי תבלין': {
        icon: '🌱',
        position: 6,
        plants: [
            { name: 'לבנדר קנרי', price: 15, description: 'לבנדר ריחני' },
            { name: 'שיבא', price: 15, description: 'צמח תבלין מסורתי' },
            { name: 'לימונית (עשב לימון)', price: 12, description: 'עשב לימון ריחני' },
            { name: 'מרווה ע.17', price: 20, description: 'מרווה מרפא' },
            { name: 'לבנדר משונן', price: 15, description: 'לבנדר עם עלים משוננים' },
            { name: 'לואיזה', price: 15, description: 'עשב תה ריחני' },
            { name: 'נענע', price: 15, description: 'נענע טרייה' },
            { name: 'מנטה', price: 15, description: 'מנטה ריחנית' },
            { name: 'זוטה רפואית', price: 15, description: 'צמח מרפא מסורתי' },
            { name: 'ריחן בזיליקום מג\'יק', price: 15, description: 'בזיליקום ריחני' },
            { name: 'לבנדר רפואי', price: 15, description: 'לבנדר לשימוש רפואי' },
        ]
    }
};

async function addCategory(categoryName, categoryData) {
    console.log(`\n📁 Creating category: ${categoryName}...`);

    const { data: category, error: catError } = await supabase
        .from('item_category')
        .insert([{
            name: categoryName,
            name_he: categoryName,
            icon: categoryData.icon,
            business_id: BUSINESS_ID,
            position: categoryData.position,
            prep_areas: ['kitchen'],
            is_deleted: false,
            is_hidden: false,
            is_visible_online: true
        }])
        .select()
        .single();

    if (catError) {
        console.error(`❌ Error creating category:`, catError.message);
        return;
    }

    console.log(`✅ Category: ${category.name_he} (ID: ${category.id})`);

    const menuItems = categoryData.plants.map(plant => ({
        business_id: BUSINESS_ID,
        category_id: category.id,
        name: plant.name,
        price: plant.price,
        category: categoryName,
        description: plant.description,
        is_in_stock: true,
        is_deleted: false
    }));

    const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .insert(menuItems)
        .select();

    if (itemsError) {
        console.error(`❌ Error adding plants:`, itemsError.message);
        return;
    }

    console.log(`   ✅ Added ${items.length} plants`);
}

async function main() {
    console.log('🌿 Adding remaining categories to שפת המדבר...');

    for (const [name, data] of Object.entries(categories)) {
        await addCategory(name, data);
    }

    console.log('\n🎉 All categories added!');
}

main().then(() => process.exit(0));
