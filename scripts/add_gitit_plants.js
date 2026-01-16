// Script to add plants from WhatsApp catalog to שפת המדבר
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';

const supabase = createClient(supabaseUrl, supabaseKey);

const BUSINESS_ID = '8e4e05da-2d99-4bd9-aedf-8e54cbde930a';

// Plants from WhatsApp catalog screenshots
const plantsData = {
    'פרחי חוץ': {
        icon: '🌸',
        plants: [
            { name: 'בידנס', price: 15, description: 'פרח שמש צהוב מקסים' },
            { name: 'אמנון ותמר', price: 15, description: 'עונתי חורף, מגוון צבעים' },
            { name: 'פטוניה מפלית', price: 15, description: 'פרחים צבעוניים שופעים' },
            { name: 'לוע הארי זקוף', price: 15, description: 'פרח גבוה ומרשים' },
            { name: 'חמניה זקופה', price: 17, description: 'חמניה זקופה יפהפייה' },
            { name: 'ביצן', price: 15, description: 'עלווה צבעונית' },
            { name: 'לנטנה ננסית', price: 15, description: 'פרחים כתומים-צהובים' },
            { name: 'לוע הארי ננסי', price: 15, description: 'גרסה ננסית יפה' },
            { name: 'לובליה', price: 15, description: 'פרחים כחולים עדינים' },
            { name: 'חמניה זוחלת', price: 15, description: 'חמניה לכיסוי קרקע' },
            { name: 'סלסילי כסף', price: 15, description: 'פרחים לבנים קטנים' },
            { name: 'ביצן מגוון', price: 15, description: 'ביצן בצבעים שונים' },
            { name: 'ניצנית', price: 15, description: 'פרחים אדומים עזים' },
        ]
    },
    'צמחים רפואיים': {
        icon: '🌿',
        plants: [
            { name: 'אלוורה רפואית', price: 25, description: 'אלוורה לטיפוח ובריאות' },
        ]
    }
};

async function createCategoryAndAddPlants(categoryName, categoryData, position) {
    console.log(`\n📁 Creating category: ${categoryName}...`);

    // Create category in item_category table
    const { data: category, error: catError } = await supabase
        .from('item_category')
        .insert([{
            name: categoryName,
            name_he: categoryName,
            icon: categoryData.icon,
            business_id: BUSINESS_ID,
            position: position,
            prep_areas: ['kitchen'],
            is_deleted: false,
            is_hidden: false,
            is_visible_online: true
        }])
        .select()
        .single();

    if (catError) {
        console.error(`❌ Error creating category ${categoryName}:`, catError.message);
        return;
    }

    console.log(`✅ Category created: ${category.name_he} (ID: ${category.id})`);

    // Add plants with category_id
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

    console.log(`   ✅ Added ${items.length} plants:`);
    items.forEach(item => {
        console.log(`      🌱 ${item.name} - ₪${item.price}`);
    });
}

async function main() {
    console.log('🌿 Adding plants to שפת המדבר...');
    console.log('   Business ID:', BUSINESS_ID);

    let position = 1;
    for (const [categoryName, categoryData] of Object.entries(plantsData)) {
        await createCategoryAndAddPlants(categoryName, categoryData, position);
        position++;
    }

    console.log('\n🎉 Done!');
}

main().then(() => process.exit(0));
